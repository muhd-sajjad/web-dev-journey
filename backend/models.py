from sqlalchemy import Column, Integer, String,ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Integer)
    category = Column(String)
    date = Column(String)
    user_id = Column(Integer,ForeignKey("userdata.id"),nullable = False)
    owner = relationship("User",back_populates = "expenses")
    
class User(Base):
    __tablename__ = "userdata"
    id = Column(Integer,primary_key= True,index=True,nullable =False)
    name=Column(String,index=True,nullable =False)
    email = Column(String,unique = True,index = True,nullable =False)
    hashed_password= Column(String,nullable = False)

    expenses = relationship("Expenses",back_populates = "owner",cascade = "all , delete-orphan")
