from passlib.context import CryptContext
from jose import JWTError,jwt
from dotenv import load_dotenv
import os
from datetime import timezone,timedelta,datetime
load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt_sha256"],deprecated="auto")
SECRET_KEY=os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
def make_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def create_jwt_token(data:dict,expires_delta:timedelta | None=None)->str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
