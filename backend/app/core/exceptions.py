from fastapi import HTTPException, status
from typing import Any, Dict, Optional


class FeedMusicException(HTTPException):
    """基础异常类"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, Any]] = None
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class BadRequestException(FeedMusicException):
    """400 Bad Request"""
    def __init__(self, detail: str = "Bad request") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedException(FeedMusicException):
    """401 Unauthorized"""
    def __init__(self, detail: str = "Unauthorized") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class ForbiddenException(FeedMusicException):
    """403 Forbidden"""
    def __init__(self, detail: str = "Forbidden") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundException(FeedMusicException):
    """404 Not Found"""
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictException(FeedMusicException):
    """409 Conflict"""
    def __init__(self, detail: str = "Conflict") -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ValidationException(FeedMusicException):
    """422 Unprocessable Entity"""
    def __init__(self, detail: str = "Validation error") -> None:
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class UnprocessableEntityException(FeedMusicException):
    """422 Unprocessable Entity - 别名"""
    def __init__(self, detail: str = "Unprocessable entity") -> None:
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class InternalServerErrorException(FeedMusicException):
    """500 Internal Server Error"""
    def __init__(self, detail: str = "Internal server error") -> None:
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class DatabaseException(FeedMusicException):
    """数据库异常"""
    def __init__(self, detail: str = "Database error") -> None:
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)


class AuthenticationException(FeedMusicException):
    """认证异常"""
    def __init__(self, detail: str = "Authentication failed") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )