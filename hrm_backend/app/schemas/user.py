from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    password: str
    role: str  # employee | manager
    manager: str | None = None


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    manager_id: int | None = None

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: list[UserResponse]
