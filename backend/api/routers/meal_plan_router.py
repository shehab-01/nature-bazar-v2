from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Any
from uuid import UUID
from datetime import date

from api.services import meal_plan_service


router = APIRouter(prefix="/api/v1/meal-plan")


class ResData(BaseModel):
    data: Any


@router.get("/week-meal-plan", response_model=ResData)
async def get_week_meal_plan(
    user_id: UUID = Query(...),
    week_start_date: date = Query(...),
):
    try:
        data = await meal_plan_service.get_week_meal_plan(
            user_id=str(user_id),
            week_start_date=str(week_start_date),
        )
        return ResData(data=data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Something wrong: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching meal plan: {str(e)}",
        )