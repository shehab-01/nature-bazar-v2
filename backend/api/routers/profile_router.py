from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, Optional
from uuid import UUID

from api.services import profile_service


router = APIRouter(prefix="/api/v1/profile")


class ResData(BaseModel):
    data: Any


# ─── GET ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=ResData)
async def get_profile(user_id: UUID = Query(...)):
    try:
        data = await profile_service.get_profile(user_id=str(user_id))

        if not data or not data.get("user"):
            raise HTTPException(status_code=404, detail="User not found.")

        return ResData(data=data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving the profile."
        )


# ─── PUT: User ────────────────────────────────────────────────────────────────

class UpdateUserBody(BaseModel):
    name: str
    email: str
    sex: str


@router.put("/user")
async def update_user(body: UpdateUserBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_user(
            user_id=str(user_id),
            name=body.name,
            email=body.email,
            sex=body.sex,
        )
        return {"message": "User updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update user.")


# ─── PUT: Body Goals ──────────────────────────────────────────────────────────

class UpdateBodyGoalsBody(BaseModel):
    age: int
    height_cm: float
    current_weight_kg: float
    target_weight_kg: float
    target_body_fat_pct: Optional[float] = None
    waist_cm: Optional[float] = None
    chest_cm: Optional[float] = None
    arms_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    thighs_cm: Optional[float] = None
    primary_goal: str
    timeline: str


@router.put("/body-goals")
async def update_body_goals(body: UpdateBodyGoalsBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_body_goals(
            user_id=str(user_id),
            age=body.age,
            height_cm=body.height_cm,
            current_weight_kg=body.current_weight_kg,
            target_weight_kg=body.target_weight_kg,
            target_body_fat_pct=body.target_body_fat_pct,
            waist_cm=body.waist_cm,
            chest_cm=body.chest_cm,
            arms_cm=body.arms_cm,
            hips_cm=body.hips_cm,
            thighs_cm=body.thighs_cm,
            primary_goal=body.primary_goal,
            timeline=body.timeline,
        )
        return {"message": "Body goals updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update body goals.")


# ─── PUT: Health ──────────────────────────────────────────────────────────────

class UpdateHealthBody(BaseModel):
    medical_conditions: list[str] = []
    other_medical_condition: Optional[str] = None
    medications: Optional[str] = None
    food_allergies: list[str] = []
    other_food_allergy: Optional[str] = None


@router.put("/health")
async def update_health(body: UpdateHealthBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_health(
            user_id=str(user_id),
            medical_conditions=body.medical_conditions,
            other_medical_condition=body.other_medical_condition,
            medications=body.medications,
            food_allergies=body.food_allergies,
            other_food_allergy=body.other_food_allergy,
        )
        return {"message": "Health data updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update health data.")


# ─── PUT: Diet Preferences ────────────────────────────────────────────────────

class UpdateDietBody(BaseModel):
    dietary_styles: list[str] = []
    cultural_restrictions: list[str] = []
    meals_per_day: str
    meal_timing: Optional[str] = None
    preferred_cooking_time: str
    weekly_food_budget: str
    foods_you_love: Optional[str] = None
    foods_to_avoid: Optional[str] = None


@router.put("/diet-preferences")
async def update_diet_preferences(body: UpdateDietBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_diet_preferences(
            user_id=str(user_id),
            dietary_styles=body.dietary_styles,
            cultural_restrictions=body.cultural_restrictions,
            meals_per_day=body.meals_per_day,
            meal_timing=body.meal_timing,
            preferred_cooking_time=body.preferred_cooking_time,
            weekly_food_budget=body.weekly_food_budget,
            foods_you_love=body.foods_you_love,
            foods_to_avoid=body.foods_to_avoid,
        )
        return {"message": "Diet preferences updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update diet preferences.")


# ─── PUT: Workout Preferences ─────────────────────────────────────────────────

class UpdateWorkoutBody(BaseModel):
    workout_styles: list[str] = []
    fitness_level: str
    workout_days_per_week: int
    session_duration: str
    activity_level: str
    avg_sleep_hours: str
    stress_level: str


@router.put("/workout-preferences")
async def update_workout_preferences(body: UpdateWorkoutBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_workout_preferences(
            user_id=str(user_id),
            workout_styles=body.workout_styles,
            fitness_level=body.fitness_level,
            workout_days_per_week=body.workout_days_per_week,
            session_duration=body.session_duration,
            activity_level=body.activity_level,
            avg_sleep_hours=body.avg_sleep_hours,
            stress_level=body.stress_level,
        )
        return {"message": "Workout preferences updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update workout preferences.")


# ─── PUT: Notifications ───────────────────────────────────────────────────────

class UpdateNotificationsBody(BaseModel):
    meal_reminders: bool
    workout_reminders: bool
    weekly_progress_summary: bool


@router.put("/notifications")
async def update_notifications(body: UpdateNotificationsBody, user_id: UUID = Query(...)):
    try:
        await profile_service.update_notifications(
            user_id=str(user_id),
            meal_reminders=body.meal_reminders,
            workout_reminders=body.workout_reminders,
            weekly_progress_summary=body.weekly_progress_summary,
        )
        return {"message": "Notification preferences updated successfully."}
    except Exception as e:
        print(f"Database Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update notification preferences.")
