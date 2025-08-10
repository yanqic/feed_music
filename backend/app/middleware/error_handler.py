from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

from app.core.exceptions import FeedMusicException

logger = logging.getLogger(__name__)


async def feed_music_exception_handler(request: Request, exc: FeedMusicException):
    """处理自定义异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": str(exc.detail) if exc.detail else "请求处理失败",
            "detail": str(exc.detail) if exc.detail else None,
            "data": None
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """处理HTTP异常"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.status_code,
            "message": exc.detail,
            "detail": None,
            "data": None
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理验证异常"""
    # 处理错误信息，确保可以JSON序列化
    errors = []
    for error in exc.errors():
        error_dict = {
            "type": error.get("type"),
            "loc": error.get("loc"),
            "msg": error.get("msg"),
            "input": error.get("input")
        }
        # 如果有ctx字段且包含error，提取错误消息
        if "ctx" in error and "error" in error["ctx"]:
            ctx_error = error["ctx"]["error"]
            if isinstance(ctx_error, ValueError):
                error_dict["msg"] = str(ctx_error)
        errors.append(error_dict)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": 422,
            "message": "请求参数验证失败",
            "detail": errors,
            "data": None
        }
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    """处理数据库完整性错误"""
    logger.error(f"Database integrity error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "code": 409,
            "message": "数据冲突",
            "detail": str(exc.orig) if hasattr(exc, 'orig') else str(exc),
            "data": None
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """处理通用异常"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": 500,
            "message": "服务器内部错误",
            "detail": "服务器遇到了意外错误，请稍后重试",
            "data": None
        }
    )


def register_exception_handlers(app):
    """注册异常处理器"""
    app.add_exception_handler(FeedMusicException, feed_music_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)

