from fastapi import FastAPI, HTTPException, Depends,status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import models
import schemas
from database import engine, SessionLocal
import auth
from jose import JWTError,jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import (
    make_hashed_password,
    verify_password,
    create_jwt_token,
    SECRET_KEY,
    ALGORITHM,
)

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE
    allow_headers=["*"],  # Allows all headers
)
security = HTTPBearer()
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()

    if user is None:
        raise credentials_exception

    return user


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
def add_new_expense(expense_data: schemas.ExpenseCreate, db: Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
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
def updateexpense(expense_id: int, expense_data: schemas.ExpenseUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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
def deleteexpense(expense_id:int,db:Session = Depends(get_db),current_user: models.User = Depends(get_current_user)):
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()

    if db_expense is None:
            raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}

@app.post("/auth/register")
def postregister(user:schemas.UserCreate,db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = auth.make_hashed_password(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def postlogin(user: schemas.UserLogin,db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401,detail="Invalid email or password")

    userthere = auth.verify_password(user.password,existing_user.hashed_password)

    if not userthere:
        raise HTTPException(status_code=401,detail="Invalid email or password")
    access_token = auth.create_jwt_token(
        data={"sub": existing_user.email}
    )
    return {
  "access_token": access_token,
  "token_type": "bearer"

}
@app.get("/auth/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user
    