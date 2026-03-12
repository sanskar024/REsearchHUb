import os
import shutil
import io
import fitz  # PyMuPDF
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
import models 
from utils.research_assistant import ResearchAssistant

router = APIRouter(prefix="/api/papers", tags=["Research Papers"])

# --- Setup Upload Directory ---
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Global Instance of ResearchAssistant
assistant = ResearchAssistant()

# --- Pydantic Schemas ---
class ChatRequest(BaseModel):
    query: str
    workspace_id: Optional[int] = 1
    selected_ids: Optional[List[int]] = []

class WorkspaceCreate(BaseModel):
    name: str

# --- API Routes ---

# 1. NEW: Explicit Extract Text Endpoint (For UploadPDF.tsx UI)
@router.post("/extract_text")
async def extract_text_from_pdf(file: UploadFile = File(...)):
    """
    Frontend ke 'Upload PDF' page ke liye PDF se text extract karta hai.
    Syllabus aur Research Papers ke complex structure ko handle karne ke liye optimized hai.
    """
    # 1. File type validation
    if not file.filename.endswith(".pdf"):
        return {"text": "Error: Only PDF files are allowed."}
    
    try:
        # 2. File ko memory mein read karo taaki disk par lock na lage
        pdf_content = await file.read()
        
        # 3. Stream-based processing (React 19 aur Fast Node environments ke liye best)
        # fitz.open(stream=...) use karne se cursor issues nahi aate
        with fitz.open(stream=pdf_content, filetype="pdf") as doc:
            full_text = ""
            
            # Har page se text extract karo
            for page in doc:
                # "blocks" mode use karne se multi-column layouts sahi se extract hote hain
                full_text += page.get_text("text") + "\n"
        
        # 4. Empty check: Agar scanned image hai toh readable text nahi milega
        if not full_text.strip():
            return {
                "text": "Error: No readable text found. This PDF might be a scanned image or protected document."
            }
            
        # 5. Success response
        return {"text": full_text}

    except Exception as e:
        # Debugging ke liye server terminal par error print karega
        print(f"Extraction Error for {file.filename}: {str(e)}")
        return {"text": f"Error during extraction: {str(e)}"}
    finally:
        # Memory management: file pointer reset (zaroori hai agar niche 'save' logic bhi chalna ho)
        await file.seek(0)      
          
        # 2. Upload and Save to DB
@router.post("/upload")
async def upload_paper(
    file: UploadFile = File(...), 
    workspace_id: int = Form(1),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        # Save Physical File
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        # Reset file pointer to beginning before saving since extract_text might have read it
        await file.seek(0)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract Text for Abstract/Preview
        doc = fitz.open(file_path)
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()
            if len(extracted_text) > 5000: # Slightly more context for DB
                break 
        doc.close()
        
        # Save Metadata to DB
        new_paper = models.Paper(
            title=file.filename,
            file_path=file_path,
            authors="Extracted from Source", 
            abstract=extracted_text[:2000] + "...", 
            owner_id=1,
            workspace_id=workspace_id
        )
        
        db.add(new_paper)
        db.commit()
        db.refresh(new_paper)
        
        return {"message": "Success", "paper_id": new_paper.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

# 3. Chat with AI (AITools & Workspace Chat)
@router.post("/chat")
async def chat_with_papers(request: ChatRequest, db: Session = Depends(get_db)):
    # Data type safety for IDs
    clean_ids = [int(i) for i in request.selected_ids] if request.selected_ids else []
    
    query_builder = db.query(models.Paper).filter(models.Paper.workspace_id == request.workspace_id)
    
    if clean_ids:
        db_papers = query_builder.filter(models.Paper.id.in_(clean_ids)).all()
    else:
        db_papers = query_builder.all()

    print(f"DEBUG: Processing {len(db_papers)} papers for Workspace {request.workspace_id}")
    
    if not db_papers:
        return {"response": "No papers found in the selected context."}

    history = db.query(models.ChatMessage).filter(models.ChatMessage.workspace_id == request.workspace_id).all()
    
    try:
        context = assistant.create_research_context(db_papers, history, request.query)
        answer = assistant.generate_research_response(context, request.query)
        
        # Save History
        new_msg = models.ChatMessage(
            query=request.query, 
            response=answer, 
            workspace_id=request.workspace_id
        )
        db.add(new_msg)
        db.commit()
        
        return {"response": answer}
    except Exception as e:
        return {"response": f"AI Assistant Error: {str(e)}"}

# 4. List Papers
@router.get("/list")
async def list_papers(db: Session = Depends(get_db)):
    return db.query(models.Paper).all()

# 5. Workspace Management
@router.post("/workspaces")
async def create_workspace(request: WorkspaceCreate, db: Session = Depends(get_db)):
    new_ws = models.Workspace(name=request.name, owner_id=1)
    db.add(new_ws)
    db.commit()
    db.refresh(new_ws)
    return new_ws

@router.get("/workspaces")
async def get_workspaces(db: Session = Depends(get_db)):
    return db.query(models.Workspace).all()

# 6. Maintenance (Delete)
@router.delete("/{paper_id}")
async def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(models.Paper).filter(models.Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    if os.path.exists(paper.file_path):
        os.remove(paper.file_path)
        
    db.delete(paper)
    db.commit()
    return {"message": "Paper deleted successfully"}

@router.delete("/chat/clear/{workspace_id}")
async def clear_chat(workspace_id: int, db: Session = Depends(get_db)):
    db.query(models.ChatMessage).filter(models.ChatMessage.workspace_id == workspace_id).delete()
    db.commit()
    return {"message": "Chat history cleared"}