"""add booking tables

Revision ID: 20261009_01
Revises:
Create Date: 2026-10-09
"""

from alembic import op
import sqlalchemy as sa

revision = "20261009_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "expert_profiles",
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("headline", sa.String(length=180), nullable=False),
        sa.Column("company", sa.String(length=120), nullable=True),
        sa.Column("bio", sa.String(length=1000), nullable=True),
        sa.Column("domains", sa.String(length=500), nullable=False),
        sa.Column("years_experience", sa.Integer(), nullable=False),
        sa.Column("is_approved", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_expert_profiles_user_id", "expert_profiles", ["user_id"], unique=True)
    op.create_index("ix_expert_profiles_is_approved", "expert_profiles", ["is_approved"])
    op.create_table(
        "availability_slots",
        sa.Column("expert_id", sa.String(), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_booked", sa.Boolean(), nullable=False),
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["expert_id"], ["expert_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_availability_slots_expert_id", "availability_slots", ["expert_id"])
    op.create_index("ix_availability_slots_start_time", "availability_slots", ["start_time"])
    op.create_index("ix_availability_slots_is_booked", "availability_slots", ["is_booked"])
    op.create_index("ix_slots_expert_start", "availability_slots", ["expert_id", "start_time"])
    op.create_table(
        "bookings",
        sa.Column("candidate_id", sa.String(), nullable=False),
        sa.Column("expert_id", sa.String(), nullable=False),
        sa.Column("slot_id", sa.String(), nullable=False),
        sa.Column("scheduled_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("scheduled_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("agenda", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("jitsi_room_name", sa.String(length=160), nullable=True),
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["expert_id"], ["expert_profiles.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["slot_id"], ["availability_slots.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slot_id"),
    )
    op.create_index("ix_bookings_candidate_id", "bookings", ["candidate_id"])
    op.create_index("ix_bookings_expert_id", "bookings", ["expert_id"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_bookings_candidate_start", "bookings", ["candidate_id", "scheduled_start"])


def downgrade() -> None:
    op.drop_table("bookings")
    op.drop_table("availability_slots")
    op.drop_table("expert_profiles")
