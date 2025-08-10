from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from ..schemas.user import UserCreate, UserResponse, UserLogin, Token
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.exceptions import (
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    ConflictException,
)
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from ..core.config import settings
from ..services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

router = APIRouter()

# OAuth2密码流
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme)
) -> dict:
    """获取当前登录用户"""
    credentials_exception = UnauthorizedException("无法验证凭据")
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await supabase_service.get_user_by_id(int(user_id))
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """用户注册"""
    try:
        # 创建新用户（supabase_service.create_user会检查用户名和邮箱重复）
        db_user = await supabase_service.create_user(user)
        
        logger.info(f"用户注册成功: {user.username}")
        return db_user
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"用户注册失败: {error_msg}")
        
        if "邮箱已被注册" in error_msg:
            raise ConflictException("邮箱已被注册")
        elif "用户名已存在" in error_msg:
            raise ConflictException("用户名已存在")
        else:
            raise BadRequestException(f"注册失败: {error_msg}")


@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """用户登录"""
    try:
        # 验证用户（支持邮箱登录）
        user = await supabase_service.authenticate_user(
            user_credentials.username, 
            user_credentials.password
        )
        
        if not user:
            raise UnauthorizedException("用户名或密码错误")
        
        # 创建访问令牌
        access_token = create_access_token(
            subject=str(user["id"])
        )
        
        logger.info(f"用户登录成功: {user['username']}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 3600
        }
        
    except Exception as e:
        logger.error(f"用户登录失败: {str(e)}")
        raise


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """根据ID获取用户信息"""
    user = await supabase_service.get_user_by_id(user_id)
    if not user:
        raise NotFoundException("用户不存在")
    return user


@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100
):
    """获取用户列表"""
    # 注意：这里需要在supabase_service中实现get_users方法
    # 暂时返回空列表，需要后续实现
    return []


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(current_user: dict = Depends(get_current_user)):
    """用户登出
    
    在JWT机制下，服务器端无法直接使token失效。
    此接口主要用于告知客户端登出成功，客户端应删除本地存储的token。
    未来可扩展支持token黑名单机制。
    """
    logger.info(f"用户登出成功: {current_user['username']}")
    return {
        "message": "登出成功",
        "detail": "请客户端删除本地存储的token"
    }

