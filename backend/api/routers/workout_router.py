from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any, List
from uuid import UUID
from datetime import date

from api.services import workout_service

router = APIRouter(prefix="/api/v1/workout")

class ResData(BaseModel):
    data: Any

# Changed path to /week-plan to reflect workout context
@router.get("/week-plan", response_model=ResData)
async def get_workout_plan(
    user_id: UUID = Query(...),
    week_start_date: date = Query(...),
):
    try:
        # We pass the validated UUID and date as strings to the service
        data = await workout_service.get_workout_plan(
            user_id=str(user_id),
            week_start_date=str(week_start_date),
        )
        
        if not data:
            return ResData(data=[])
            
        return ResData(data=data)
        
    except Exception as e:
        # Log the error for debugging
        print(f"Database Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving the workout plan."
        )