from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class CaseCreate(BaseModel):
    title: str
    client_id: int
    assignee_id: int
    status_id: int
    order_amount: Optional[float] = None
    progress_phase_id: Optional[int] = None
    due_date: Optional[date] = None
    phase_due_date: Optional[date] = None   # ← 追加
    description: Optional[str] = None


class CaseUpdate(CaseCreate):
    pass


class CaseResponse(BaseModel):
    id: int
    title: str
    client_id: int
    assignee_id: int
    status_id: int
    order_amount: Optional[float] = None
    progress_phase_id: Optional[int] = None
    due_date: Optional[date] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    client_name: Optional[str] = None
    assignee_name: Optional[str] = None
    status_name: Optional[str] = None
    status_color: Optional[str] = None
    phase_name: Optional[str] = None
    phase_due_date: Optional[date] = None

    class Config:
        from_attributes = True


class StatusRes(BaseModel):
    id: int
    name: str
    theme_color: str
    class Config:
        from_attributes = True


class ClientRes(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class ClientCreate(BaseModel):
    name: str


class UserRes(BaseModel):
    id: int
    username: str
    display_name: str
    email: str
    class Config:
        from_attributes = True


class PhaseRes(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True


class CaseFileRes(BaseModel):
    id: int
    case_id: int
    filename: str
    original_name: str
    file_size: int
    mime_type: str
    created_at: datetime
    class Config:
        from_attributes = True
