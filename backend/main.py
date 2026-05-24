from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.services.file_reader import read_code_files
from backend.services.chunker import chunk_code
from backend.services.embedder import generate_embeddings
from backend.services.vector_db import store_embeddings
from backend.services.embedder import generate_query_embedding
from backend.services.vector_db import search_similar_chunks
from backend.services.llm_service import generate_response
from backend.services.repo_loader import clone_github_repo
import streamlit as st

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# sneh


@app.get("/")
def home():
    return {"message": "RepoMind Running"}


@app.get("/read-codebase")
def read_codebase():

    folder_path = "sample_codebase"

    files = read_code_files(folder_path)

    return {
        "total_files": len(files),
        "files": files
    }


@app.get("/chunks")
def generate_chunks():

    folder_path = "sample_codebase"

    files = read_code_files(folder_path)

    chunks = chunk_code(files)

    return {
        "total_chunks": len(chunks),
        "chunks": chunks
    }


@app.get("/embeddings")
def embeddings():

    folder_path = "sample_codebase"

    files = read_code_files(folder_path)

    chunks = chunk_code(files)

    embedded_chunks = generate_embeddings(chunks)

    return {
        "total_embeddings": len(embedded_chunks),
        "data": embedded_chunks
    }

@app.get("/store-embeddings")
def store_all_embeddings():

    folder_path = "sample_codebase"

    files = read_code_files(folder_path)

    chunks = chunk_code(files)

    embedded_chunks = generate_embeddings(chunks)

    result = store_embeddings(embedded_chunks)

    return result

@app.get("/ask")
def ask_question(query: str, repo_name: str):

    query_embedding = generate_query_embedding(query)

    retrieved_chunks = search_similar_chunks(
        query_embedding,
        repo_name
    )

    answer = generate_response(query, retrieved_chunks)

    return {
        "repo_name": repo_name,
        "query": query,
        "answer": answer
    }

@app.post("/load-repo")
def load_repository(repo_url: str):

    repo_path = clone_github_repo(repo_url)

    repo_name = repo_url.rstrip("/").split("/")[-1]

    files = read_code_files(repo_path)

    chunks = chunk_code(files)

    embedded_chunks = generate_embeddings(chunks)

    result = store_embeddings(
        embedded_chunks,
        repo_name
    )

    return {
        "repo_name": repo_name,
        "files_found": len(files),
        "chunks_created": len(chunks),
        "message": result
    }