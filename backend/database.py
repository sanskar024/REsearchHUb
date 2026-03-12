import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. .env file se variables load karna
load_dotenv()

# 2. Database URL get karna (.env se)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 3. Engine create karna (yeh SQLite database ke sath connection banata hai)
# connect_args={"check_same_thread": False} sirf SQLite ke liye zaroori hota hai FastAPI mein
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 4. Database session banana (Data save/fetch karne ke liye)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Base class banana (Isi class ka use karke hum aage apni Tables/Models banayenge)
Base = declarative_base()

# 6. Dependency function (Yeh function har API request ko database se jodega)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()