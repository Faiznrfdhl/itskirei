
import asyncio
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BACKEND_DIR / "storage" / "uploads"
OUTPUT_DIR = BACKEND_DIR / "storage" / "outputs"

FILE_TTL_SECONDS = 60 * 60  # 1 jam
CLEANUP_INTERVAL_SECONDS = 60


def cleanup_expired_files() -> int:
    """Delete upload and output files older than five minutes."""
    now = time.time()
    deleted_count = 0

    for directory in (UPLOAD_DIR, OUTPUT_DIR):
        if not directory.exists():
            continue

        for file_path in directory.iterdir():
            try:
                if not file_path.is_file():
                    continue

                age = now - file_path.stat().st_mtime
                if age >= FILE_TTL_SECONDS:
                    file_path.unlink()
                    deleted_count += 1
                    logger.info("Deleted expired temporary file: %s", file_path.name)

            except FileNotFoundError:
                # Another process may already have deleted the file.
                continue
            except OSError:
                logger.exception("Failed to clean up file: %s", file_path)

    return deleted_count


async def cleanup_loop() -> None:
    """Run periodic cleanup while the application is running."""
    while True:
        try:
            deleted = await asyncio.to_thread(cleanup_expired_files)
            if deleted:
                logger.info("Cleanup removed %s expired file(s)", deleted)
        except Exception:
            logger.exception("Temporary file cleanup failed")

        await asyncio.sleep(CLEANUP_INTERVAL_SECONDS)