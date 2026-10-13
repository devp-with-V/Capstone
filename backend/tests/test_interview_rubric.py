import asyncio

import pytest
from fastapi import HTTPException

from app.api.ai import ChatMessage, InterviewRubricRequest, interview_rubric
from app.services.ai_service import AIService, ai_service


def test_rubric_averages_real_answers_and_ignores_scratchpad(monkeypatch):
    captured = {}

    def score(turns, target_role):
        captured["turns"] = turns
        captured["role"] = target_role
        return {
            "communication_score": 4,
            "technical_score": 3,
            "problem_solving_score": 4,
            "star_score": 3.5,
            "summary": "Clear trade-offs.",
            "scoring_method": "ai_text_rubric",
        }

    monkeypatch.setattr(ai_service, "score_interview_turns", score)
    payload = InterviewRubricRequest(messages=[
        ChatMessage(sender="ai", content="How did you design it?"),
        ChatMessage(sender="candidate", content="I used a queue to reduce latency."),
        ChatMessage(sender="candidate", content="diagram", is_blueprint=True),
        ChatMessage(sender="ai", content="What would you change?"),
        ChatMessage(sender="candidate", content="I would test the retry policy."),
    ], target_role="Backend Engineer")

    result = asyncio.run(interview_rubric(payload))

    assert captured == {
        "turns": [
            {"question": "How did you design it?", "answer": "I used a queue to reduce latency."},
            {"question": "What would you change?", "answer": "I would test the retry policy."},
        ],
        "role": "Backend Engineer",
    }
    assert result.data.star_score == 3.5


def test_rubric_rejects_interview_without_an_answer():
    payload = InterviewRubricRequest(messages=[
        ChatMessage(sender="ai", content="Tell me about a system."),
        ChatMessage(sender="candidate", content="diagram", is_blueprint=True),
    ])
    with pytest.raises(HTTPException) as exc:
        asyncio.run(interview_rubric(payload))
    assert exc.value.status_code == 422


def test_ai_scoring_averages_per_answer_scores(monkeypatch):
    service = AIService()
    service.openrouter_configured = True
    monkeypatch.setattr(service, "_call_llm_text", lambda *args: (
        '{"answers": ['
        '{"communication": 4, "technical": 2, "problem_solving": 3, "star": 1},'
        '{"communication": 2, "technical": 4, "problem_solving": 5, "star": 5}'
        '], "summary": "Mixed performance."}'
    ))

    result = service.score_interview_turns([
        {"question": "Q1", "answer": "A1"},
        {"question": "Q2", "answer": "A2"},
    ], "Engineer")

    assert result["communication_score"] == 3
    assert result["technical_score"] == 3
    assert result["problem_solving_score"] == 4
    assert result["star_score"] == 3.0
    assert result["scoring_method"] == "ai_text_rubric"


def test_invalid_ai_rubric_uses_text_fallback(monkeypatch):
    service = AIService()
    service.openrouter_configured = True
    monkeypatch.setattr(service, "_call_llm_text", lambda *args: '{"answers": []}')

    result = service.score_interview_turns([
        {"question": "Q1", "answer": "I designed a Python API because latency mattered."},
    ], "Engineer")

    assert result["scoring_method"] == "text_heuristic"
    assert 1 <= result["star_score"] <= 5
