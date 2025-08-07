# 后端项目结构和实现指南

## 目录结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── news.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── news.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py
│   │   ├── users.py
│   │   └── news.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   └── config.py
│   └── static/
│       ├── images/
│       └── uploads/
├── requirements.txt
└── README.md
```

## 依赖项

以下是项目所需的主要依赖项，应该添加到 `requirements.txt` 文件中：

```
fastapi==0.104.0
uvicorn==0.23.2
sqlalchemy==2.0.22
pydantic==2.4.2
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
aiofiles==23.2.1
bcrypt==4.0.1
python-dotenv==1.0.0
```

## 核心文件实现指南

### main.py

这是应用的入口点，负责创建FastAPI应用实例，注册路由和中间件。

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import users, news
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 注册路由
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(news.router, prefix="/api/news", tags=["news"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Feed Music API"}
```

### config.py

配置文件，用于管理应用的配置参数。

```python
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Feed Music API"
    PROJECT_DESCRIPTION: str = "A FastAPI backend for Feed Music website"
    PROJECT_VERSION: str = "0.1.0"
    
    # 安全配置
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 数据库配置
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./feed_music.db")
    
    # CORS配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### database.py

数据库连接和会话管理。

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 依赖项函数，用于获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## 数据模型

### models/user.py

用户数据模型。

```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### models/news.py

新闻数据模型。

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    image_url = Column(String)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", backref="news")
```

## 数据验证模式

### schemas/user.py

用户数据验证模式。

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class User(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None
```

### schemas/news.py

新闻数据验证模式。

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NewsBase(BaseModel):
    title: str
    description: str
    image_url: str

class NewsCreate(NewsBase):
    pass

class NewsUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Creator(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

class NewsInDB(NewsBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class News(NewsInDB):
    creator: Creator

class NewsPagination(BaseModel):
    items: list[News]
    total: int
    page: int
    limit: int
    pages: int
```

## API路由

### api/deps.py

依赖项函数，用于认证和授权。

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user
```

### api/users.py

用户相关的API路由。

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema, Token
from app.api.deps import create_access_token, get_current_user

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # 由于JWT是无状态的，服务器端不需要做任何操作
    # 客户端需要删除本地存储的token
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user
```

### api/news.py

新闻相关的API路由。

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.news import News
from app.schemas.news import NewsCreate, NewsUpdate, News as NewsSchema, NewsPagination
from app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=NewsPagination)
def get_news(
    page: int = Query(1, ge=1),
    limit: int = Query(6, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * limit
    news = db.query(News).order_by(News.created_at.desc()).offset(skip).limit(limit).all()
    total = db.query(News).count()
    
    return {
        "items": news,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{news_id}", response_model=NewsSchema)
def get_news_by_id(news_id: int, db: Session = Depends(get_db)):
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news

@router.post("", response_model=NewsSchema, status_code=status.HTTP_201_CREATED)
def create_news(
    news: NewsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_news = News(
        title=news.title,
        description=news.description,
        image_url=news.image_url,
        creator_id=current_user.id
    )
    
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    
    return db_news

@router.put("/{news_id}", response_model=NewsSchema)
def update_news(
    news_id: int,
    news: NewsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_news = db.query(News).filter(News.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if db_news.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this news")
    
    update_data = news.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_news, key, value)
    
    db.commit()
    db.refresh(db_news)
    
    return db_news

@router.delete("/{news_id}", status_code=status.HTTP_200_OK)
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_news = db.query(News).filter(News.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="News not found")
    
    if db_news.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this news")
    
    db.delete(db_news)
    db.commit()
    
    return {"message": "News deleted successfully"}
```

## 安全相关

### core/security.py

安全相关的功能，如密码哈希和JWT处理。

```python
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

## 初始化脚本

在 `app/__init__.py` 中，我们可以添加一些初始化代码：

```python
from app.database import Base, engine

# 创建数据库表
Base.metadata.create_all(bind=engine)
```

## 启动说明

要启动后端服务，请运行以下命令：

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

服务将在 http://localhost:8000 上运行，API文档可在 http://localhost:8000/docs 访问。