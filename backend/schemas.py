from pydantic import BaseModel, ConfigDict,EmailStr

class UserResponse(BaseModel):
    id:int
    name:str
    email:EmailStr

    model_config = ConfigDict(from_attributes=True)
class ExpenseCreate(BaseModel):
    title: str
    amount: int 
    category: str
    date: str

class ExpenseUpdate(BaseModel):
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
    email:EmailStr
    password:str
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email:EmailStr
    password:str

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str