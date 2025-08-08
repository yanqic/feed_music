from typing import Generic, TypeVar, List, Optional, Union
from pydantic import BaseModel, Field
from sqlalchemy.orm import Query
from sqlalchemy import func


T = TypeVar('T')


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(default=1, ge=1, description="页码，从1开始")
    size: Optional[int] = Field(default=None, ge=1, le=100, description="每页条数，最大100")
    limit: Optional[int] = Field(default=None, ge=1, le=100, description="每页条数，最大100（与size同义）")
    
    def __init__(self, **data):
        super().__init__(**data)
        # 如果提供了limit但没有size，使用limit的值
        if self.limit is not None and self.size is None:
            self.size = self.limit
        # 如果都没有提供，使用默认值
        elif self.size is None and self.limit is None:
            self.size = 10
    
    @property
    def offset(self) -> int:
        """计算偏移量"""
        return (self.page - 1) * self.size


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    items: List[T] = Field(description="数据列表")
    total: int = Field(description="总条数")
    page: int = Field(description="当前页码")
    size: int = Field(description="每页条数")
    pages: int = Field(description="总页数")
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        size: int
    ) -> "PaginatedResponse[T]":
        """创建分页响应"""
        pages = (total + size - 1) // size
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1
        )


class PaginationHelper:
    """分页工具类"""
    
    @staticmethod
    def paginate_query(
        query: Query,
        params: PaginationParams
    ) -> tuple[List, int]:
        """对查询进行分页
        
        Args:
            query: SQLAlchemy查询对象
            params: 分页参数
            
        Returns:
            (items, total) 元组
        """
        # 获取总数
        total = query.count()
        
        # 应用分页
        items = query.offset(params.offset).limit(params.size).all()
        
        return items, total
    
    @staticmethod
    def paginate_list(
        items: List[T],
        params: PaginationParams
    ) -> PaginatedResponse[T]:
        """对列表进行分页
        
        Args:
            items: 数据列表
            params: 分页参数
            
        Returns:
            分页响应对象
        """
        total = len(items)
        start = params.offset
        end = start + params.size
        
        paginated_items = items[start:end]
        
        return PaginatedResponse.create(
            items=paginated_items,
            total=total,
            page=params.page,
            size=params.size
        )


# 快捷函数
def paginate(
    query_or_items,
    params: PaginationParams
) -> tuple[List, int] | PaginatedResponse:
    """通用分页函数
    
    Args:
        query_or_items: SQLAlchemy查询对象或列表
        params: 分页参数
        
    Returns:
        根据输入类型返回不同的分页结果
    """
    from sqlalchemy.orm import Query
    
    if isinstance(query_or_items, Query):
        return PaginationHelper.paginate_query(query_or_items, params)
    else:
        return PaginationHelper.paginate_list(query_or_items, params)