from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ...database import get_db
from ..models.case import Client, User, Status, Phase
from ..schemas.case import ClientRes, ClientCreate, UserRes, StatusRes, PhaseRes

client_router = APIRouter()
user_router = APIRouter()
status_router = APIRouter()
phase_router = APIRouter()


@client_router.get("/clients/", response_model=list[ClientRes])
async def list_clients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Client))
    return result.scalars().all()


@client_router.post("/clients/", response_model=ClientRes, status_code=201)
async def create_client(body: ClientCreate, db: AsyncSession = Depends(get_db)):
    client = Client(name=body.name)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client


@user_router.get("/users/", response_model=list[UserRes])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()


@status_router.get("/statuses/", response_model=list[StatusRes])
async def list_statuses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Status))
    return result.scalars().all()


@phase_router.get("/phases/", response_model=list[PhaseRes])
async def list_phases(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Phase))
    return result.scalars().all()
