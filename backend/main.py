import os
from typing import List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

import auth
import models
import schemas
from auth import ALGORITHM, SECRET_KEY
from database import SessionLocal, engine
from ratelimit import FailedAttemptTracker

load_dotenv()

# Creates missing tables on startup. It does NOT alter existing tables;
# use Alembic migrations once the schema starts changing.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trackly API")

# --- CORS -------------------------------------------------------------
# In production set CORS_ORIGINS to your frontend URL(s), comma-separated,
# e.g. https://trackly.vercel.app
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
cors_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
] or DEFAULT_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    # Optional: allow Vercel preview deployments, e.g. https://trackly-.*\.vercel\.app
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX") or None,
    allow_credentials=False,  # auth uses a Bearer header, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
login_tracker = FailedAttemptTracker(max_attempts=5, window_seconds=600)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return (
        db.query(models.User)
        .filter(func.lower(models.User.email) == email.lower())
        .first()
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    return user


def get_owned_expense(db: Session, expense_id: int, user: models.User) -> models.Expense:
    expense = (
        db.query(models.Expense)
        .filter(models.Expense.id == expense_id, models.Expense.user_id == user.id)
        .first()
    )
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


# --- Basic routes -----------------------------------------------------
@app.get("/")
def read_root():
    return {"message": "Trackly API is running"}


@app.get("/health")
def health_status():
    return {"status": "ok"}


# --- Auth -------------------------------------------------------------
@app.post("/auth/register", response_model=schemas.UserResponse, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=auth.make_hashed_password(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    login_tracker.check(user.email)

    existing_user = get_user_by_email(db, user.email)
    if not existing_user or not auth.verify_password(
        user.password, existing_user.hashed_password
    ):
        login_tracker.record_failure(user.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    login_tracker.reset(user.email)
    access_token = auth.create_jwt_token(data={"sub": existing_user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


# --- Expenses ---------------------------------------------------------
@app.get("/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Expense)
        .filter(models.Expense.user_id == current_user.id)
        .order_by(models.Expense.date.desc(), models.Expense.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@app.get("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return get_owned_expense(db, expense_id, current_user)


@app.post("/expenses", response_model=schemas.ExpenseResponse, status_code=201)
def add_expense(
    expense_data: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_expense = models.Expense(**expense_data.model_dump(), user_id=current_user.id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = get_owned_expense(db, expense_id, current_user)
    for field, value in expense_data.model_dump().items():
        setattr(db_expense, field, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_expense = get_owned_expense(db, expense_id, current_user)
    db.delete(db_expense)
    db.commit()
    return {"message": "Expense deleted successfully"}
