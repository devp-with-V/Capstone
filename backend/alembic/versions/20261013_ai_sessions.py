"""add ai interview sessions and turns tables

Revision ID: 20261013_ai_sessions
Revises: ad50d617221e
Create Date: 2026-10-13
"""

from alembic import op
import sqlalchemy as sa

revision = "20261013_ai_sessions"
down_revision = "ad50d617221e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_interview_sessions",
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("target_role", sa.String(), nullable=False),
        sa.Column("level", sa.String(), nullable=False),
        sa.Column("domain", sa.String(), nullable=False),
        sa.Column("job_description", sa.Text(), nullable=True),
        sa.Column("duration_min", sa.Integer(), nullable=False),
        sa.Column("question_count", sa.Integer(), nullable=False),
        sa.Column("mode", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("questions", sa.JSON(), nullable=False),
        sa.Column("video_url", sa.String(), nullable=True),
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_interview_sessions_user_id", "ai_interview_sessions", ["user_id"])
    op.create_index("ix_ai_interview_sessions_status", "ai_interview_sessions", ["status"])
    op.create_table(
        "ai_interview_turns",
        sa.Column("session_id", sa.String(), nullable=False),
        sa.Column("question_idx", sa.Integer(), nullable=False),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("transcript", sa.Text(), nullable=True),
        sa.Column("analysis", sa.JSON(), nullable=False),
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["ai_interview_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_interview_turns_session_id", "ai_interview_turns", ["session_id"])


def downgrade() -> None:
    op.drop_table("ai_interview_turns")
    op.drop_table("ai_interview_sessions")
