from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, CandidateProfile, ExpertProfile
from app.schemas.user import UserCreate, ProfileUpdate, ExpertProfileUpdate, UserResponse
from typing import Optional, List, Dict
import uuid

# In-memory store for seamless local dev when Postgres is not connected
MOCK_USERS_DB: Dict[str, Dict] = {
    "mock-candidate-001": {
        "id": "mock-candidate-001",
        "email": "candidate@preppilot.com",
        "role": "candidate",
        "full_name": "Demo Candidate (Ananya)",
        "target_role": "Full Stack Engineer",
        "bio": "Final year CS student preparing for software engineering roles.",
    },
    "mock-expert-002": {
        "id": "mock-expert-002",
        "email": "expert@preppilot.com",
        "role": "expert",
        "full_name": "Demo Expert (Rohit, SDE-2)",
        "domains": "System Design, Algorithms, Python",
        "company_title": "SDE-2 at TechCorp",
        "bio": "5 years industry experience mentoring engineers for FAANG-level interviews.",
        "approved": True,
        "avg_rating": 4.9,
    },
    "mock-admin-003": {
        "id": "mock-admin-003",
        "email": "admin@preppilot.com",
        "role": "admin",
        "full_name": "Demo Admin (Platform)",
    },
}

class UserService:
    @staticmethod
    async def get_by_id(db: AsyncSession | None, user_id: str) -> Optional[User]:
        if not db:
            if user_id in MOCK_USERS_DB:
                data = MOCK_USERS_DB[user_id]
                return User(id=data["id"], email=data["email"], role=data["role"], full_name=data["full_name"])
            return None
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()
        except Exception:
            if user_id in MOCK_USERS_DB:
                data = MOCK_USERS_DB[user_id]
                return User(id=data["id"], email=data["email"], role=data["role"], full_name=data["full_name"])
            return None

    @staticmethod
    async def get_by_email(db: AsyncSession | None, email: str) -> Optional[User]:
        if not db:
            for uid, data in MOCK_USERS_DB.items():
                if data["email"].lower() == email.lower():
                    return User(id=data["id"], email=data["email"], role=data["role"], full_name=data["full_name"])
            return None
        try:
            result = await db.execute(select(User).where(User.email == email))
            return result.scalar_one_or_none()
        except Exception:
            for uid, data in MOCK_USERS_DB.items():
                if data["email"].lower() == email.lower():
                    return User(id=data["id"], email=data["email"], role=data["role"], full_name=data["full_name"])
            return None

    @staticmethod
    async def create_user(db: AsyncSession | None, user_in: UserCreate) -> User:
        role = user_in.role or "candidate"
        new_id = str(uuid.uuid4())
        user = User(
            id=new_id,
            email=user_in.email,
            full_name=user_in.full_name,
            role=role
        )
        if not db:
            MOCK_USERS_DB[new_id] = {
                "id": new_id,
                "email": user_in.email,
                "role": role,
                "full_name": user_in.full_name,
                "target_role": "Software Engineer" if role == "candidate" else None,
                "bio": "New registered user",
                "approved": False if role == "expert" else True,
            }
            return user

        try:
            db.add(user)
            await db.commit()
            await db.refresh(user)

            # Auto-create respective profile
            if role == "candidate":
                profile = CandidateProfile(user_id=user.id, target_role="Software Engineer")
                db.add(profile)
                await db.commit()
            elif role == "expert":
                expert_profile = ExpertProfile(user_id=user.id, approved=False)
                db.add(expert_profile)
                await db.commit()

        except Exception:
            await db.rollback()
            MOCK_USERS_DB[new_id] = {
                "id": new_id,
                "email": user_in.email,
                "role": role,
                "full_name": user_in.full_name,
            }
        return user

    @staticmethod
    async def list_users(db: AsyncSession | None) -> List[UserResponse]:
        if not db:
            return [
                UserResponse(
                    id=data["id"],
                    email=data["email"],
                    role=data["role"],
                    full_name=data["full_name"]
                )
                for data in MOCK_USERS_DB.values()
            ]
        try:
            result = await db.execute(select(User).order_by(User.created_at.desc()))
            users = result.scalars().all()
            if users:
                return [
                    UserResponse(id=u.id, email=u.email, role=u.role, full_name=u.full_name)
                    for u in users
                ]
        except Exception:
            pass

        return [
            UserResponse(
                id=data["id"],
                email=data["email"],
                role=data["role"],
                full_name=data["full_name"]
            )
            for data in MOCK_USERS_DB.values()
        ]

    @staticmethod
    async def update_user_role(db: AsyncSession | None, user_id: str, new_role: str) -> Optional[UserResponse]:
        if db:
            try:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    user.role = new_role
                    await db.commit()
                    await db.refresh(user)
                    return UserResponse(id=user.id, email=user.email, role=user.role, full_name=user.full_name)
            except Exception:
                pass

        if user_id in MOCK_USERS_DB:
            MOCK_USERS_DB[user_id]["role"] = new_role
            data = MOCK_USERS_DB[user_id]
            return UserResponse(id=data["id"], email=data["email"], role=data["role"], full_name=data["full_name"])
        return None


    @staticmethod
    async def get_candidate_profile(db: AsyncSession | None, user_id: str) -> Optional[CandidateProfile]:
        if not db:
            user_data = MOCK_USERS_DB.get(user_id, {})
            return CandidateProfile(
                user_id=user_id,
                target_role=user_data.get("target_role", "Frontend Engineer"),
                bio=user_data.get("bio", "Candidate preparing for tech interviews"),
                resume_url=user_data.get("resume_url")
            )
        try:
            result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
            return result.scalar_one_or_none()
        except Exception:
            return CandidateProfile(user_id=user_id, target_role="Frontend Engineer", bio="Aspiring engineer")

    @staticmethod
    async def update_candidate_profile(db: AsyncSession | None, user_id: str, profile_in: ProfileUpdate) -> CandidateProfile:
        if not db:
            if user_id in MOCK_USERS_DB:
                if profile_in.target_role is not None:
                    MOCK_USERS_DB[user_id]["target_role"] = profile_in.target_role
                if profile_in.bio is not None:
                    MOCK_USERS_DB[user_id]["bio"] = profile_in.bio
            return CandidateProfile(user_id=user_id, target_role=profile_in.target_role, bio=profile_in.bio)
        try:
            result = await db.execute(select(CandidateProfile).where(CandidateProfile.user_id == user_id))
            profile = result.scalar_one_or_none()
            if not profile:
                profile = CandidateProfile(user_id=user_id, target_role=profile_in.target_role, bio=profile_in.bio)
                db.add(profile)
            else:
                if profile_in.target_role is not None:
                    profile.target_role = profile_in.target_role
                if profile_in.bio is not None:
                    profile.bio = profile_in.bio
                if profile_in.resume_url is not None:
                    profile.resume_url = profile_in.resume_url
            await db.commit()
            await db.refresh(profile)
            return profile
        except Exception:
            await db.rollback()
            return CandidateProfile(user_id=user_id, target_role=profile_in.target_role, bio=profile_in.bio)

    @staticmethod
    async def get_expert_profile(db: AsyncSession | None, user_id: str) -> Optional[ExpertProfile]:
        if not db:
            user_data = MOCK_USERS_DB.get(user_id, {})
            return ExpertProfile(
                user_id=user_id,
                domains=user_data.get("domains", "DSA, System Design"),
                company_title=user_data.get("company_title", "Senior Software Engineer"),
                bio=user_data.get("bio", "Experienced mentor"),
                approved=user_data.get("approved", True),
                avg_rating=user_data.get("avg_rating", 4.9)
            )
        try:
            result = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == user_id))
            return result.scalar_one_or_none()
        except Exception:
            return None

    @staticmethod
    async def update_expert_profile(db: AsyncSession | None, user_id: str, profile_in: ExpertProfileUpdate) -> ExpertProfile:
        if not db:
            if user_id in MOCK_USERS_DB:
                if profile_in.domains is not None:
                    MOCK_USERS_DB[user_id]["domains"] = profile_in.domains
                if profile_in.bio is not None:
                    MOCK_USERS_DB[user_id]["bio"] = profile_in.bio
                if profile_in.company_title is not None:
                    MOCK_USERS_DB[user_id]["company_title"] = profile_in.company_title
            return ExpertProfile(
                user_id=user_id,
                domains=profile_in.domains,
                bio=profile_in.bio,
                company_title=profile_in.company_title,
                approved=True
            )
        try:
            result = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == user_id))
            profile = result.scalar_one_or_none()
            if not profile:
                profile = ExpertProfile(
                    user_id=user_id,
                    domains=profile_in.domains,
                    bio=profile_in.bio,
                    company_title=profile_in.company_title
                )
                db.add(profile)
            else:
                if profile_in.domains is not None:
                    profile.domains = profile_in.domains
                if profile_in.bio is not None:
                    profile.bio = profile_in.bio
                if profile_in.company_title is not None:
                    profile.company_title = profile_in.company_title
            await db.commit()
            await db.refresh(profile)
            return profile
        except Exception:
            await db.rollback()
            return ExpertProfile(user_id=user_id, domains=profile_in.domains, bio=profile_in.bio)

    @staticmethod
    async def approve_expert(db: AsyncSession | None, user_id: str, approved: bool) -> bool:
        if not db:
            if user_id in MOCK_USERS_DB:
                MOCK_USERS_DB[user_id]["approved"] = approved
                return True
            return False
        try:
            result = await db.execute(select(ExpertProfile).where(ExpertProfile.user_id == user_id))
            profile = result.scalar_one_or_none()
            if profile:
                profile.approved = approved
                await db.commit()
                return True
            return False
        except Exception:
            await db.rollback()
            return False

user_service = UserService()


