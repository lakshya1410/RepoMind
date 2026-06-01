from langchain_groq import ChatGroq


from langchain_core.prompts import (
ChatPromptTemplate
)


import os
from dotenv import load_dotenv

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)



prompt = ChatPromptTemplate.from_template(
"""

You are RepoMind.

Use only context.

Context:

{context}


Question:

{question}

"""
)


def generate_response(
question,
docs
):


    normalized_chunks = []
    for d in docs or []:
        if isinstance(d, dict):
            normalized_chunks.append(str(d.get("chunk", "")))
        else:
            normalized_chunks.append(str(getattr(d, "page_content", "")))

    context = "\n".join([c for c in normalized_chunks if c.strip()])

    if not context:
        return (
            "I could not find indexed context for this repository yet. "
            "Please re-index the repo and try again."
        )


    chain = prompt | llm


    response=chain.invoke(
    {
    "context":context,
    "question":question
    }
    )


    return response.content
