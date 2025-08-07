# Feed Music 网站项目

这是一个类似 feedmusic.com 的网站项目，包括前端和后端实现。

## 项目结构

- `frontend/`: React 前端应用
- `backend/`: FastAPI 后端应用

## 技术栈

### 前端
- React
- React Router
- Axios
- SCSS/CSS Modules
- React Context API (状态管理)

### 后端
- Python
- FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- Python-Jose (JWT)
- Passlib (密码加密)

## 功能特点

1. 动态背景和文字滚动效果
2. 响应式新闻网格布局
3. 用户认证系统
4. 新闻管理后台
5. 页面切换动画效果

## 开发指南

详细的开发指南请参考 [项目计划文档](./project_plan.md)。

## 安装与运行

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm start
```

## 许可证

MIT