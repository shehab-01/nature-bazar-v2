from fastapi import APIRouter, HTTPException
from api.model.models import ResData

from api.services import test_service


router = APIRouter(prefix="/api/v1/test")


@router.get("/view-all", response_model=ResData)
async def view_all_agents():
    try:
        data = await test_service.get_all()
        return ResData(data=data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Something wrong {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing Agent: {str(e)}"
        )