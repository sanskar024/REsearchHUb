import os
from dotenv import load_dotenv
from groq import Groq

# Load variables from the .env file
load_dotenv()

# Retrieve the key securely
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found. Please check your .env file.")

client = Groq(api_key=api_key)

MODEL_CONFIG = {
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.3,
    "max_tokens": 1024,
}