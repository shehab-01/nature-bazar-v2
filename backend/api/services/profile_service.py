from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import AsyncSessionLocal


async def get_profile(user_id: str):
    async with AsyncSessionLocal() as session:
        user_query = text("""
            SELECT
                id,
                name,
                email,
                sex,
                avatar_url,
                unit_preference,
                created_at
            FROM users
            WHERE id = :user_id
        """)

        body_goals_query = text("""
            SELECT
                ubg.height_cm,
                ubg.current_weight_kg,
                ubg.target_weight_kg,
                ubg.target_body_fat_pct,
                ubg.age,
                ubg.waist_cm,
                ubg.chest_cm,
                ubg.arms_cm,
                ubg.hips_cm,
                ubg.thighs_cm,
                ubg.primary_goal,
                ubg.timeline,
                u.unit_preference
            FROM user_body_goals ubg
            JOIN users u ON u.id = ubg.user_id
            WHERE ubg.user_id = :user_id
        """)

        health_query = text("""
            SELECT
                medical_conditions,
                other_medical_condition,
                medications,
                food_allergies,
                other_food_allergy,
                updated_at
            FROM user_health
            WHERE user_id = :user_id
        """)

        diet_query = text("""
            SELECT
                dietary_styles,
                cultural_restrictions,
                meals_per_day,
                meal_timing,
                preferred_cooking_time,
                weekly_food_budget,
                foods_you_love,
                foods_to_avoid,
                updated_at
            FROM user_diet_preferences
            WHERE user_id = :user_id
        """)

        workout_prefs_query = text("""
            SELECT
                workout_styles,
                fitness_level,
                workout_days_per_week,
                session_duration,
                activity_level,
                avg_sleep_hours,
                stress_level,
                updated_at
            FROM user_workout_preferences
            WHERE user_id = :user_id
        """)

        notifications_query = text("""
            SELECT
                meal_reminders,
                workout_reminders,
                weekly_progress_summary,
                updated_at
            FROM user_notification_preferences
            WHERE user_id = :user_id
        """)

        params = {"user_id": user_id}

        user_result = await session.execute(user_query, params)
        body_goals_result = await session.execute(body_goals_query, params)
        health_result = await session.execute(health_query, params)
        diet_result = await session.execute(diet_query, params)
        workout_prefs_result = await session.execute(workout_prefs_query, params)
        notifications_result = await session.execute(notifications_query, params)

        user_row = user_result.mappings().first()
        body_goals_row = body_goals_result.mappings().first()
        health_row = health_result.mappings().first()
        diet_row = diet_result.mappings().first()
        workout_prefs_row = workout_prefs_result.mappings().first()
        notifications_row = notifications_result.mappings().first()

        return {
            "user": dict(user_row) if user_row else None,
            "body_goals": dict(body_goals_row) if body_goals_row else None,
            "health": dict(health_row) if health_row else None,
            "diet_preferences": dict(diet_row) if diet_row else None,
            "workout_preferences": dict(workout_prefs_row) if workout_prefs_row else None,
            "notification_preferences": dict(notifications_row) if notifications_row else None,
        }


async def update_user(user_id: str, name: str, email: str, sex: str):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE users
                SET name = :name, email = :email, sex = :sex
                WHERE id = :user_id
            """),
            {"name": name, "email": email, "sex": sex, "user_id": user_id},
        )
        await session.commit()


async def update_body_goals(
    user_id: str,
    age: int,
    height_cm: float,
    current_weight_kg: float,
    target_weight_kg: float,
    target_body_fat_pct: float | None,
    waist_cm: float | None,
    chest_cm: float | None,
    arms_cm: float | None,
    hips_cm: float | None,
    thighs_cm: float | None,
    primary_goal: str,
    timeline: str,
):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE user_body_goals
                SET
                    age                 = :age,
                    height_cm           = :height_cm,
                    current_weight_kg   = :current_weight_kg,
                    target_weight_kg    = :target_weight_kg,
                    target_body_fat_pct = :target_body_fat_pct,
                    waist_cm            = :waist_cm,
                    chest_cm            = :chest_cm,
                    arms_cm             = :arms_cm,
                    hips_cm             = :hips_cm,
                    thighs_cm           = :thighs_cm,
                    primary_goal        = :primary_goal,
                    timeline            = :timeline
                WHERE user_id = :user_id
            """),
            {
                "age": age,
                "height_cm": height_cm,
                "current_weight_kg": current_weight_kg,
                "target_weight_kg": target_weight_kg,
                "target_body_fat_pct": target_body_fat_pct,
                "waist_cm": waist_cm,
                "chest_cm": chest_cm,
                "arms_cm": arms_cm,
                "hips_cm": hips_cm,
                "thighs_cm": thighs_cm,
                "primary_goal": primary_goal,
                "timeline": timeline,
                "user_id": user_id,
            },
        )
        await session.commit()


async def update_health(
    user_id: str,
    medical_conditions: list[str],
    other_medical_condition: str | None,
    medications: str | None,
    food_allergies: list[str],
    other_food_allergy: str | None,
):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE user_health
                SET
                    medical_conditions      = :medical_conditions,
                    other_medical_condition = :other_medical_condition,
                    medications             = :medications,
                    food_allergies          = :food_allergies,
                    other_food_allergy      = :other_food_allergy,
                    updated_at              = NOW()
                WHERE user_id = :user_id
            """),
            {
                "medical_conditions": medical_conditions,
                "other_medical_condition": other_medical_condition or None,
                "medications": medications or None,
                "food_allergies": food_allergies,
                "other_food_allergy": other_food_allergy or None,
                "user_id": user_id,
            },
        )
        await session.commit()


async def update_diet_preferences(
    user_id: str,
    dietary_styles: list[str],
    cultural_restrictions: list[str],
    meals_per_day: str,
    meal_timing: str | None,
    preferred_cooking_time: str,
    weekly_food_budget: str,
    foods_you_love: str | None,
    foods_to_avoid: str | None,
):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE user_diet_preferences
                SET
                    dietary_styles        = :dietary_styles,
                    cultural_restrictions = :cultural_restrictions,
                    meals_per_day         = :meals_per_day,
                    meal_timing           = :meal_timing,
                    preferred_cooking_time = :preferred_cooking_time,
                    weekly_food_budget    = :weekly_food_budget,
                    foods_you_love        = :foods_you_love,
                    foods_to_avoid        = :foods_to_avoid,
                    updated_at            = NOW()
                WHERE user_id = :user_id
            """),
            {
                "dietary_styles": dietary_styles,
                "cultural_restrictions": cultural_restrictions,
                "meals_per_day": meals_per_day,
                "meal_timing": meal_timing or None,
                "preferred_cooking_time": preferred_cooking_time,
                "weekly_food_budget": weekly_food_budget,
                "foods_you_love": foods_you_love or None,
                "foods_to_avoid": foods_to_avoid or None,
                "user_id": user_id,
            },
        )
        await session.commit()


async def update_workout_preferences(
    user_id: str,
    workout_styles: list[str],
    fitness_level: str,
    workout_days_per_week: int,
    session_duration: str,
    activity_level: str,
    avg_sleep_hours: str,
    stress_level: str,
):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE user_workout_preferences
                SET
                    workout_styles        = :workout_styles,
                    fitness_level         = :fitness_level,
                    workout_days_per_week = :workout_days_per_week,
                    session_duration      = :session_duration,
                    activity_level        = :activity_level,
                    avg_sleep_hours       = :avg_sleep_hours,
                    stress_level          = :stress_level,
                    updated_at            = NOW()
                WHERE user_id = :user_id
            """),
            {
                "workout_styles": workout_styles,
                "fitness_level": fitness_level,
                "workout_days_per_week": workout_days_per_week,
                "session_duration": session_duration,
                "activity_level": activity_level,
                "avg_sleep_hours": avg_sleep_hours,
                "stress_level": stress_level,
                "user_id": user_id,
            },
        )
        await session.commit()


async def update_notifications(
    user_id: str,
    meal_reminders: bool,
    workout_reminders: bool,
    weekly_progress_summary: bool,
):
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("""
                UPDATE user_notification_preferences
                SET
                    meal_reminders          = :meal_reminders,
                    workout_reminders       = :workout_reminders,
                    weekly_progress_summary = :weekly_progress_summary,
                    updated_at              = NOW()
                WHERE user_id = :user_id
            """),
            {
                "meal_reminders": meal_reminders,
                "workout_reminders": workout_reminders,
                "weekly_progress_summary": weekly_progress_summary,
                "user_id": user_id,
            },
        )
        await session.commit()
