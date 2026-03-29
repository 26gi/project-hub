from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional
from ..models.case import Case, Status
from ..schemas.case import CaseCreate, CaseUpdate


def base_query():
    return select(Case).options(
        joinedload(Case.client),
        joinedload(Case.assignee),
        joinedload(Case.status),
        joinedload(Case.phase),
    )


def to_response(case: Case) -> dict:
    return {
        "id": case.id,
        "title": case.title,
        "client_id": case.client_id,
        "assignee_id": case.assignee_id,
        "status_id": case.status_id,
        "order_amount": case.order_amount,
        "progress_phase_id": case.progress_phase_id,
        "due_date": case.due_date,
        "description": case.description,
        "created_at": case.created_at,
        "updated_at": case.updated_at,
        "client_name": case.client.name if case.client else None,
        "assignee_name": case.assignee.display_name if case.assignee else None,
        "status_name": case.status.name if case.status else None,
        "status_color": case.status.theme_color if case.status else None,
        "phase_name": case.phase.name if case.phase else None,
        "phase_due_date": case.phase_due_date,
    }


async def validate_phase(body, db: AsyncSession) -> dict:
    result = await db.execute(select(Status).filter(Status.id == body.status_id))
    status = result.scalars().first()
    body_dict = body.model_dump()
    if status and status.name != "進行中":
        body_dict["progress_phase_id"] = None
    return body_dict


async def list_cases(q: Optional[str], status_id: Optional[int], db: AsyncSession):
    query = base_query()
    if q:
        query = query.filter(Case.title.ilike(f"%{q}%"))
    if status_id:
        query = query.filter(Case.status_id == status_id)
    query = query.order_by(Case.created_at.desc())
    result = await db.execute(query)
    return [to_response(c) for c in result.scalars().unique().all()]


async def create_case(db: AsyncSession, body: CaseCreate) -> dict:
    data = await validate_phase(body, db)
    case = Case(**data)
    db.add(case)
    await db.commit()
    await db.refresh(case)
    result = await db.execute(base_query().filter(Case.id == case.id))
    return to_response(result.scalars().first())


async def update_case(case_id: int, body: CaseUpdate, db: AsyncSession) -> dict:
    result = await db.execute(select(Case).filter(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    data = await validate_phase(body, db)
    for key, value in data.items():
        setattr(case, key, value)
    await db.commit()
    result = await db.execute(base_query().filter(Case.id == case_id))
    return to_response(result.scalars().first())


async def delete_case(case_id: int, db: AsyncSession):
    result = await db.execute(select(Case).filter(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    await db.delete(case)
    await db.commit()
