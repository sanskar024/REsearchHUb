from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.groq_client import client, MODEL_CONFIG

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

# Mock dependencies
class User(BaseModel):
    id: int
    email: str

class ChatMessage(BaseModel):
    content: str

async def get_current_user():
    return User(id=1, email="test@example.com")

async def get_workspace_papers(workspace_id: int, user_id: int):
    return "Sample abstract: Machine learning improves network security."

def create_research_context(papers, query):
    return f"Context from papers: {papers}. User query: {query}"

async def store_conversation(workspace_id, user_msg, ai_response):
    pass # Will save to DB later

@router.post("/ask")
async def chat_with_papers(message: ChatMessage, workspace_id: int, current_user: User = Depends(get_current_user)):
    workspace_papers = await get_workspace_papers(workspace_id, current_user.id)
    context = create_research_context(workspace_papers, message.content)
    
    # GROQ AI Call
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": f"You are a research assistant. Context: {context}"},
            {"role": "user", "content": message.content}
        ],
        **MODEL_CONFIG
    )
    
    ai_message = response.choices[0].message.content
    await store_conversation(workspace_id, message.content, ai_message)
    
    return {"response": ai_message}