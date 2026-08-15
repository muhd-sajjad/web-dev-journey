from sqlalchemy import Column, Integer, String
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    amount = Column(Integer)
    category = Column(String)
    date = Column(String)
class User(Base):
    __tablename__ = "userdata"
    id = Column(Integer,primary_key= True,index=True,nullable =False)
    name=Column(String,index=True,nullable =False)
    email = Column(String,unique = True,index = True,nullable =False)
    hashed_password= Column(String,nullable = False)
