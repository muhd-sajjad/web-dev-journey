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