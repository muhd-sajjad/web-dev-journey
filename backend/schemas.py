from pydantic import BaseModel, ConfigDict

class ExpenseCreate(BaseModel):
    title: str
    amount: int 
    category: str
    date: str

class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: int
    category: str
    date: str

    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    name:str
    email:str
    password:str
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email:str
    password:str

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id:int
    name:str
    email:str

    model_config = ConfigDict(from_attributes=True)
