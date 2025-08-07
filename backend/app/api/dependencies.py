from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core import get_db, decode_token
from app.models.user import User
from app.core.exceptions import UnauthorizedException, NotFoundException

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    token = credentials.credentials
    username = decode_token(token)
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise NotFoundException("用户不存在")
    
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """获取当前管理员用户"""
    if not current_user.is_admin:
        raise UnauthorizedException("需要管理员权限")
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """获取可选的当前用户（用于需要认证但不强制登录的端点）"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        username = decode_token(token)
        user = db.query(User).filter(User.username == username).first()
        return user
    except Exception:
        return None