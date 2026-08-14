from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List

# Import your newly created files
import models
import schemas
from database import engine, SessionLocal

app = FastAPI()

# Creates the database tables when the app starts
models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE
    allow_headers=["*"],  # Allows all headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "message": "Trackly API is running"
    }

@app.get("/health")
def healthstatus():
    return {
        "status": "ok"
    }


@app.get("/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).all()
    return expenses
@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def get_expenses_id(expense_id:int,db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id==expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense
@app.post("/expenses", response_model=schemas.ExpenseResponse)
def add_new_expense(expense_data: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = models.Expense(
        title=expense_data.title,
        amount=expense_data.amount,
        date=expense_data.date,
        category=expense_data.category
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense
@app.put("/expenses/{expense_id}",response_model=schemas.ExpenseResponse)
def updateexpense(expense_id:int,expense_data: schemas.ExpenseCreate,db:Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    db_expense.title = expense_data.title
    db_expense.amount = expense_data.amount
    db_expense.category = expense_data.category
    db_expense.date = expense_data.date
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.delete("/expenses/{expense_id}")
def deleteexpense(expense_id:int,db:Session = Depends(get_db)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if db_expense is None:
            raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}