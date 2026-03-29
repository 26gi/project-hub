from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid, os, aiofiles
from ...database import get_db
from ..models.case import CaseFile
from ..schemas.case import CaseFileRes

router = APIRouter(prefix="/cases/{case_id}/files", tags=["files"])

UPLOAD_DIR = "/api/uploads"
ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
}
MAX_FILE_SIZE = 10 * 1024 * 1024

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=list[CaseFileRes])
async def list_files(case_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CaseFile).filter(CaseFile.case_id == case_id).order_by(CaseFile.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=CaseFileRes, status_code=201)
async def upload_file(case_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="許可されていないファイル形式です")
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="ファイルサイズが10MBを超えています")
    ext = os.path.splitext(file.filename or "")[1]
    saved_name = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(os.path.join(UPLOAD_DIR, saved_name), "wb") as f:
        await f.write(contents)
    record = CaseFile(
        case_id=case_id,
        filename=saved_name,
        original_name=file.filename or saved_name,
        file_size=len(contents),
        mime_type=file.content_type or "",
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


@router.get("/{file_id}/download")
async def download_file(case_id: int, file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CaseFile).filter(CaseFile.id == file_id, CaseFile.case_id == case_id)
    )
    record = result.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    path = os.path.join(UPLOAD_DIR, record.filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    return FileResponse(path, filename=record.original_name, media_type=record.mime_type)


@router.delete("/{file_id}", status_code=204)
async def delete_file(case_id: int, file_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CaseFile).filter(CaseFile.id == file_id, CaseFile.case_id == case_id)
    )
    record = result.scalars().first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    path = os.path.join(UPLOAD_DIR, record.filename)
    if os.path.exists(path):
        os.remove(path)
    await db.delete(record)
    await db.commit()
