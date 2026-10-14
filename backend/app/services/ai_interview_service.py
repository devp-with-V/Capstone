import io
import json
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.ai_interview import AIInterviewSession, AIInterviewTurn
from app.schemas.feedback import FeedbackCreate
from app.services.ai_service import ai_service, _extract_json
from app.services.feedback_service import feedback_service

FALLBACK_QUESTIONS = [
    "Give me a brief overview of your experience most relevant to this role.",
    "Describe the most challenging technical problem you solved recently and how you approached it.",
    "How do you make trade-offs between shipping quickly and building for long-term maintainability?",
    "Tell me about a time you disagreed with a teammate on a technical decision. What happened?",
    "What would you do differently if you had to scale your last project to 10x traffic?",
    "How do you stay current with developments in your field?",
    "Describe a failure or mistake and what you learned from it.",
    "What questions do you have about this role and the team?",
]

# Lazily-loaded local Whisper model (no API, no quota). Loaded once per process.
_whisper_model = None


def _get_local_whisper():
    global _whisper_model
    if _whisper_model is not None:
        return _whisper_model
    try:
        from faster_whisper import WhisperModel

        _whisper_model = WhisperModel(
            settings.WHISPER_MODEL or "tiny", device="cpu", compute_type="int8"
        )
        return _whisper_model
    except Exception as e:
        print(f"[AIInterviewService] local Whisper unavailable: {e}")
        return None


class AIInterviewService:
    # ---- question generation ----

    def generate_questions(
        self,
        target_role: str,
        level: str,
        domain: str,
        count: int,
        job_description: str | None,
    ) -> list[str]:
        prompt = f"""Generate exactly {count} interview questions for a {level} {target_role} mock interview focused on {domain}.
{f"Target job description context: {job_description[:2000]}" if job_description else ""}
Rules:
- Ordered from warm-up to deep deep-dives, one question per difficulty ramp.
- Behavioral questions must demand STAR-structured answers.
- Technical questions must probe trade-offs and edge cases, not trivia.
- Output ONLY valid JSON: {{"questions": ["q1", "q2", ...]}} with exactly {count} strings."""
        try:
            raw = ai_service._call_llm_text(
                prompt,
                "You are AURA, an elite technical interviewer designing mock interview question sets. Output only valid JSON.",
            )
            if raw:
                data = _extract_json(raw)
                qs = [str(q).strip() for q in data.get("questions", []) if str(q).strip()]
                if len(qs) >= 3:
                    return qs[:count]
        except Exception as e:
            print(f"[AIInterviewService] question generation failed: {e}")
        return (FALLBACK_QUESTIONS * ((count // len(FALLBACK_QUESTIONS)) + 1))[:count]

    # ---- speech to text: local Whisper first, Groq hosted fallback ----

    def _local_transcribe(self, audio_bytes: bytes, use_vad: bool) -> str:
        model = _get_local_whisper()
        if model is None:
            return ""
        segments, _info = model.transcribe(
            io.BytesIO(audio_bytes), beam_size=1, vad_filter=use_vad
        )
        return "".join(seg.text for seg in segments).strip()

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "answer.webm") -> str:
        # Small-utterance-friendly chain: VAD first (clean cuts), then raw
        # (VAD clips quiet/short answers on tiny), then hosted Groq.
        try:
            text = self._local_transcribe(audio_bytes, use_vad=True)
            if text:
                return text
            print("[AIInterviewService] VAD pass empty, retrying without VAD")
        except Exception as e:
            print(f"[AIInterviewService] local transcription (VAD) failed: {e}")
        try:
            text = self._local_transcribe(audio_bytes, use_vad=False)
            if text:
                return text
            print("[AIInterviewService] local Whisper returned empty transcript twice")
        except Exception as e:
            print(f"[AIInterviewService] local transcription (raw) failed: {e}")

        if ai_service.groq_configured:
            try:
                result = ai_service.groq_client.audio.transcriptions.create(
                    model="whisper-large-v3-turbo",
                    file=(filename, audio_bytes),
                )
                if (result.text or "").strip():
                    return result.text.strip()
            except Exception as e:
                print(f"[AIInterviewService] Groq transcription failed: {e}")

        raise RuntimeError(
            "Could not transcribe that answer. Please type it instead."
        )

    # ---- per-answer live analysis (single LLM call) ----

    def analyze_answer(self, question: str, transcript: str, target_role: str) -> dict:
        prompt = f"""You are AURA, scoring one interview answer (role: {target_role}).
Question: {question}
Candidate answer transcript: {transcript[:3000]}
Score 0-100 on: depth (technical depth & trade-offs), clarity (communication), star (STAR structure).
Output ONLY valid JSON: {{"depth": int, "clarity": int, "star": int, "note": "one sentence of feedback"}}"""
        try:
            raw = ai_service._call_llm_text(
                prompt,
                "You are an interview scoring engine. Output only valid JSON.",
            )
            if raw:
                data = _extract_json(raw)
                return {
                    "depth": max(0, min(100, int(data.get("depth", 70)))),
                    "clarity": max(0, min(100, int(data.get("clarity", 70)))),
                    "star": max(0, min(100, int(data.get("star", 70)))),
                    "note": str(data.get("note", "Answer recorded."))[:500],
                }
        except Exception as e:
            print(f"[AIInterviewService] answer analysis failed: {e}")
        return {"depth": 70, "clarity": 70, "star": 70, "note": "Answer recorded for final review."}

    # ---- final report (single LLM call, may take seconds) ----

    def build_report(self, session: AIInterviewSession, turns: list[AIInterviewTurn]) -> dict:
        answered = [t for t in turns if (t.transcript or "").strip()]
        lines = "\n".join(
            f"Q{i+1}: {t.question_text}\nA{i+1}: {(t.transcript or '')[:1200]}\n"
            f"Scores: {json.dumps(t.analysis)}"
            for i, t in enumerate(answered)
        )
        prompt = f"""You are AURA writing the final report for a {session.level} {session.target_role} mock interview ({session.domain}).
Interview transcript with per-answer scores:
{lines[:6000] if lines else "(candidate did not answer any question)"}
Rate 1-5 (integers) on communication, technical, problem_solving.
Output ONLY valid JSON: {{"communication": int, "technical": int, "problem_solving": int, "summary": "2-3 sentences", "strengths": ["..."], "improvements": ["..."]}}"""
        try:
            raw = ai_service._call_llm_text(
                prompt,
                "You are an interview report engine. Output only valid JSON.",
            )
            if raw:
                data = _extract_json(raw)
                return {
                    "communication": max(1, min(5, int(data.get("communication", 3)))),
                    "technical": max(1, min(5, int(data.get("technical", 3)))),
                    "problem_solving": max(1, min(5, int(data.get("problem_solving", 3)))),
                    "summary": str(data.get("summary", ""))[:2000],
                    "strengths": [str(s) for s in data.get("strengths", [])][:5],
                    "improvements": [str(s) for s in data.get("improvements", [])][:5],
                }
        except Exception as e:
            print(f"[AIInterviewService] report build failed: {e}")
        return {
            "communication": 3,
            "technical": 3,
            "problem_solving": 3,
            "summary": f"Completed {len(answered)} of {len(session.questions)} questions.",
            "strengths": ["Completed the mock interview session."],
            "improvements": ["Practice structured, detailed answers under time pressure."],
        }

    async def finish_session(self, db: AsyncSession, session: AIInterviewSession):
        result = await db.execute(
            select(AIInterviewTurn)
            .where(AIInterviewTurn.session_id == session.id)
            .order_by(AIInterviewTurn.question_idx)
        )
        turns = list(result.scalars().all())
        report = self.build_report(session, turns)
        comments = report["summary"]
        if report["improvements"]:
            comments += " Focus next: " + "; ".join(report["improvements"][:2])
        feedback = await feedback_service.create_feedback(
            db,
            FeedbackCreate(
                session_id=session.id,
                communication_score=report["communication"],
                technical_score=report["technical"],
                problem_solving_score=report["problem_solving"],
                comments=comments,
                authored_by="ai",
            ),
        )
        session.status = "finished"
        await db.commit()
        await db.refresh(session)
        return feedback, report


ai_interview_service = AIInterviewService()
