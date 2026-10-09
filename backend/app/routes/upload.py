from fastapi import APIRouter, UploadFile, File
import os
import uuid


router = APIRouter(
    prefix="/api",
    tags=["Upload"]
)


UPLOAD_DIR = "storage/uploads"


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...)
):

    file_id = str(uuid.uuid4())

    filename = f"{file_id}_{file.filename}"

    path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True
    )

    content = await file.read()

    with open(path, "wb") as f:
        f.write(content)

    return {
        "id": file_id,
        "filename": filename,
        "message": "Upload success"
    }