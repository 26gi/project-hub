from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from ..schemas.case import CaseCreate, CaseUpdate, CaseResponse
from ..cruds import case as case_crud
from ...database import get_db

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("/", response_model=list[CaseResponse])
async def list_cases(
    q: Optional[str] = Query(None),
    status_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    return await case_crud.list_cases(q, status_id, db)


@router.post("/", response_model=CaseResponse, status_code=201)
async def create_case(body: CaseCreate, db: AsyncSession = Depends(get_db)):
    return await case_crud.create_case(db, body)


@router.put("/{case_id}", response_model=CaseResponse)
async def update_case(case_id: int, body: CaseUpdate, db: AsyncSession = Depends(get_db)):
    return await case_crud.update_case(case_id, body, db)


@router.delete("/{case_id}", status_code=204)
async def delete_case(case_id: int, db: AsyncSession = Depends(get_db)):
    return await case_crud.delete_case(case_id, db)
