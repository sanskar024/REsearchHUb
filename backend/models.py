from sqlalchemy import Column, Integer, String, ForeignKey, DateTime # DateTime add kiya
from sqlalchemy.orm import relationship
from database import Base
import datetime # Pure module ko import kiya conflict se bachne ke liye

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    papers = relationship("Paper", back_populates="owner")
    workspaces = relationship("Workspace", back_populates="owner")

class Workspace(Base):
    __tablename__ = "workspaces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="workspaces")
    papers = relationship("Paper", back_populates="workspace")

class Paper(Base):
    __tablename__ = "papers"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    file_path = Column(String)
    authors = Column(String, default="Unknown") 
    abstract = Column(String, default="No abstract available")
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    workspace_id = Column(Integer, ForeignKey("workspaces.id"), nullable=True)

    owner = relationship("User", back_populates="papers")
    workspace = relationship("Workspace", back_populates="papers")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String)
    response = Column(String)
    workspace_id = Column(Integer, ForeignKey("workspaces.id"))
    # datetime.datetime.utcnow use kiya taaki koi confusion na rahe
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)