import os
from groq import Groq
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_groq_client():
    # Ensure .env is loaded every time we request a client to avoid initialization race conditions
    load_dotenv(override=True)
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY not found in environment variables. Please check your .env file.")
        return None
    return Groq(api_key=api_key)


def generate_response(query, retrieved_chunks):
    client = get_groq_client()
    if not client:
        return "Error: GROQ_API_KEY is not configured. Please add it to your .env file."

    context = ""

    # Handle the case where retrieved_chunks might be empty or not in the expected format
    try:
        documents = retrieved_chunks["documents"][0]
    except (KeyError, IndexError, TypeError):
        logger.warning("No relevant documents retrieved from vector DB.")
        documents = []

    for doc in documents:
        context += doc + "\n\n"

    if not context:
        return "I couldn't find any relevant code snippets in the repository to answer your question."

    prompt = f"""
You are RepoMind, an AI Codebase Assistant.

Answer the user's question ONLY using the provided code context.
If the context does not contain the answer, state that you don't know.

CODE CONTEXT:
{context}

USER QUESTION:
{query}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error calling Groq API: {e}")
        return f"An error occurred while generating the response: {str(e)}"