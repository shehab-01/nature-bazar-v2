import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import AsyncSessionLocal

async def get_workout_plan(user_id: str, week_start_date: str):
    async with AsyncSessionLocal() as session:
        query = text("""
            SELECT
                wpd.day_of_week,
                wpd.day_name,
                wpd.is_rest_day,
                ws.id                AS session_id,
                ws.name              AS session_name,
                ws.category,
                ws.duration_minutes,
                ws.is_completed      AS session_completed,
                wse.id               AS exercise_entry_id,
                e.name               AS exercise_name,
                wse.sets,
                wse.rep_min,
                wse.rep_max,
                wse.is_completed     AS exercise_completed,
                wse.sort_order
            FROM workout_plan_days wpd
            JOIN workout_plans     wp  ON wp.id  = wpd.workout_plan_id
            LEFT JOIN workout_sessions         ws  ON ws.workout_plan_day_id = wpd.id
            LEFT JOIN workout_session_exercises wse ON wse.workout_session_id = ws.id
            LEFT JOIN exercises                 e   ON e.id                   = wse.exercise_id
            WHERE wp.user_id         = :user_id
              AND wp.week_start_date = :week_start_date
            ORDER BY wpd.day_of_week, wse.sort_order;
        """)

        result = await session.execute(query, {
            "user_id": user_id,
            "week_start_date": week_start_date
        })
        
        rows = result.mappings().all()
        return format_workout_data(rows)

def format_workout_data(rows):
    """
    Transforms flat SQL rows into a nested structure.
    """
    plan = {}
    
    for row in rows:
        day_key = row['day_of_week']
        
        if day_key not in plan:
            plan[day_key] = {
                "day_name": row['day_name'],
                "is_rest_day": row['is_rest_day'],
                "sessions": {}
            }
            
        # Add session if it exists and isn't a rest day
        if row['session_id']:
            sid = row['session_id']
            if sid not in plan[day_key]["sessions"]:
                plan[day_key]["sessions"][sid] = {
                    "session_name": row['session_name'],
                    "category": row['category'],
                    "duration": row['duration_minutes'],
                    "completed": row['session_completed'],
                    "exercises": []
                }
            
            # Add exercise if it exists
            if row['exercise_entry_id']:
                plan[day_key]["sessions"][sid]["exercises"].append({
                    "name": row['exercise_name'],
                    "sets": row['sets'],
                    "reps": f"{row['rep_min']}-{row['rep_max']}",
                    "completed": row['exercise_completed']
                })

    # Convert dictionary to list for the frontend
    formatted_list = []
    for day_id in sorted(plan.keys()):
        day_data = plan[day_id]
        day_data["sessions"] = list(day_data["sessions"].values())
        formatted_list.append(day_data)
        
    return formatted_list