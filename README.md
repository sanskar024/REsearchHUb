# 🚀 ResearchHub AI - Agentic RAG System

An intelligent, full-stack research paper management and analysis platform. ResearchHub AI allows users to upload complex research papers, extract insights, and interact with a highly context-aware AI assistant that retains conversational memory and strictly prevents hallucination.

## ✨ Key Features

* **🧠 True Agentic Memory:** Powered by Llama-3.1 (via Groq), the AI retains short-term conversational history, allowing for natural, follow-up questions without losing context.
* **📚 Multi-Document Synergy:** Select and query multiple research papers simultaneously. The system can compare, contrast, and synthesize information across different uploaded documents.
* **🚫 Anti-Hallucination Architecture:** Engineered with strict prompting and context boundaries. If a query is outside the scope of the uploaded research papers, the AI politely refuses to answer, ensuring 100% factual accuracy.
* **📝 DocSpace Editor:** A built-in rich-text workspace to draft research notes, seamlessly synced with the backend database.
* **🗂️ Dynamic Dashboard:** Real-time tracking of active workspaces, imported documents, and quick AI analysis tools.

## 💻 Tech Stack

**Frontend:**
* React.js & TypeScript
* Tailwind CSS (for modern, responsive UI)
* Lucide Icons & React-Quill (Rich Text Editor)

**Backend:**
* FastAPI (High-performance Python framework)
* SQLAlchemy & SQLite (Robust local database management)
* PyMuPDF / fitz (For highly accurate PDF text extraction)

**AI & LLM Engine:**
* Groq API (Inference engine)
* Llama-3.1-8b-instant (Core model for reasoning and summarization)

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine.

### 1. Backend Setup
Navigate to the backend directory, set up your virtual environment, and run the FastAPI server:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend root and add your Groq API key:

Code snippet
GROQ_API_KEY=your_api_key_here
Start the backend server:

Bash
uvicorn main:app --reload
2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the React app:

Bash
cd frontend
npm install
npm run dev
🛡️ Security & Privacy
Local Storage: All PDFs and extracted text are stored locally.

Git Ignored: Sensitive files like .env, node_modules, __pycache__, and *.db are protected via .gitignore to prevent accidental leaks.

Developed by: Deepanshu Rana

