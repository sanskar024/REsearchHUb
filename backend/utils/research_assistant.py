import os
import logging
from typing import List, Any
from groq import Groq
from dotenv import load_dotenv

# .env file load karna
load_dotenv()

# Professional Logging Setup (Print ki jagah logger use karna best practice hai)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ResearchAssistant:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        
        if not api_key:
            logger.warning("⚠️ GROQ_API_KEY is missing from your .env file!")
            
        self.client = Groq(api_key=api_key)

    def create_research_context(self, db_papers: List[Any], history: List[Any], query: str) -> str:
        """
        Database se papers aur purani chat history nikal kar AI ke liye rich context banata hai.
        Yahan True Agentic behavior add kiya gaya hai (Memory).
        """
        # 1. Document Context Inject Karna
        context = "--- 📄 UPLOADED DOCUMENTS CONTEXT ---\n"
        if not db_papers:
            context += "No documents selected in the workspace.\n\n"
        else:
            for paper in db_papers:
                # Assuming your model has 'title' and 'abstract' (or full text)
                context += f"Title: {paper.title}\nContent/Abstract: {paper.abstract}\n\n"

        # 2. Short-Term Memory Inject Karna (Pichle 3 messages)
        if history:
            context += "--- 💬 PREVIOUS CHAT CONTEXT (Memory) ---\n"
            # Token limit bachane ke liye sirf last 3 interactions bhej rahe hain
            for msg in history[-3:]:
                context += f"User: {msg.query}\nAssistant: {msg.response}\n\n"

        return context

    def generate_research_response(self, context: str, query: str) -> str:
        """
        AI se strict, factual, aur context-aware answer generate karwata hai.
        """
        # Token limit safety (Llama 3.1 8b context window ke hisaab se optimized)
        safe_context = context[:25000] if context else ""

        # The 'Elite Agent' System Prompt
        system_prompt = """You are an elite AI Research Assistant. 
        Your primary job is to answer questions, summarize, explain, and extract insights based ONLY on the provided documents and previous chat context.
        
        CRITICAL RULES:
        1. DOCUMENT AWARENESS: Use the "UPLOADED DOCUMENTS CONTEXT" to provide highly accurate summaries and details.
        2. CONVERSATIONAL MEMORY: Use the "PREVIOUS CHAT CONTEXT" to understand follow-up questions (e.g., if the user asks "explain it more", refer to the previous topic).
        3. STRICT BOUNDARIES: If the user asks a general knowledge question (e.g., 'Who is the President?', 'What is the capital of France?') that is completely unrelated to the context, you MUST politely refuse.
        4. MISSING FACTS: If the user asks for a specific fact not present in the text, reply EXACTLY with: 'I am sorry, but I cannot find the answer to this in the uploaded paper.'
        5. NO HALLUCINATIONS: Do not invent facts or use outside knowledge."""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"{safe_context}\n--- ❓ NEW QUESTION ---\nUser Question: {query}"}
                ],
                temperature=0.3, # Balanced for analytical thinking and accurate summaries
                max_tokens=1024  # Response ki length limit taaki API bill na bade
            )
            return response.choices[0].message.content
            
        except Exception as e:
            error_details = str(e)
            logger.error(f"Groq API Error: {error_details}")
            return f"⚠️ API Error: {error_details}"