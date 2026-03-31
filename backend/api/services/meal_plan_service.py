from sqlalchemy import text
from database import AsyncSessionLocal

# Entry-level rows — no repeated day totals
MEAL_ENTRIES_QUERY = text("""
    SELECT
        mpe.id            AS entry_id,
        mpd.day_of_week,
        mpd.day_name,
        mpe.meal_type,
        mpe.sort_order,
        r.name            AS recipe_name,
        r.description     AS recipe_description,
        mpe.calories,
        mpe.protein_g,
        mpe.carbs_g,
        mpe.fat_g
    FROM meal_plan_entries mpe
    JOIN meal_plan_days    mpd ON mpd.id = mpe.meal_plan_day_id
    JOIN meal_plans        mp  ON mp.id  = mpd.meal_plan_id
    JOIN recipes           r   ON r.id  = mpe.recipe_id
    WHERE mp.user_id         = :user_id
      AND mp.week_start_date = :week_start_date
    ORDER BY mpd.day_of_week, mpe.sort_order
""")

# Day totals computed live — avoids stale denormalized data
DAY_TOTALS_QUERY = text("""
    SELECT
        mpd.day_of_week,
        SUM(mpe.calories)  AS total_calories,
        SUM(mpe.protein_g) AS total_protein_g,
        SUM(mpe.carbs_g)   AS total_carbs_g,
        SUM(mpe.fat_g)     AS total_fat_g
    FROM meal_plan_entries mpe
    JOIN meal_plan_days    mpd ON mpd.id = mpe.meal_plan_day_id
    JOIN meal_plans        mp  ON mp.id  = mpd.meal_plan_id
    WHERE mp.user_id         = :user_id
      AND mp.week_start_date = :week_start_date
    GROUP BY mpd.day_of_week
    ORDER BY mpd.day_of_week
""")


async def get_week_meal_plan(user_id: str, week_start_date: str) -> dict:
    params = {"user_id": user_id, "week_start_date": week_start_date}

    async with AsyncSessionLocal() as session:
        # AsyncSession is NOT concurrency-safe — execute sequentially,
        # never via asyncio.gather on the same session instance.
        entries_result = await session.execute(MEAL_ENTRIES_QUERY, params)
        totals_result = await session.execute(DAY_TOTALS_QUERY, params)

        entries = [
            {**row._asdict(), "entry_id": str(row.entry_id)}
            for row in entries_result.fetchall()
        ]

        day_totals = {
            row.day_of_week: {
                "total_calories":  row.total_calories,
                "total_protein_g": row.total_protein_g,
                "total_carbs_g":   row.total_carbs_g,
                "total_fat_g":     row.total_fat_g,
            }
            for row in totals_result.fetchall()
        }

        return {"entries": entries, "day_totals": day_totals}