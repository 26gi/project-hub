from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .api.routers import cases, case_files
from .api.routers.masters import client_router, user_router, status_router, phase_router

async def lifespan(app):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="案件管理システム", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)
app.include_router(client_router)
app.include_router(user_router)
app.include_router(status_router)
app.include_router(phase_router)
app.include_router(case_files.router)
