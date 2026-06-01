import logging
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.services.graph.index_graph import index_graph
from backend.services.graph.query_graph import query_graph


app = FastAPI(
    title="RepoMind API",
    description="AI Codebase Assistant using LangGraph + RAG",
    version="2.0"
)


# CORS setup
# NOTE: `allow_origins=["*"]` cannot be combined with `allow_credentials=True`
# in browsers. We keep explicit local dev origins by default and allow override
# via CORS_ALLOW_ORIGINS env var (comma-separated).
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_origins = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
allow_origins = [o.strip() for o in env_origins.split(",") if o.strip()] if env_origins else default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = logging.getLogger(__name__)


# Health check
@app.get("/")
def home():

    return {
        "message": "RepoMind Running 🚀"
    }



# ============================
# INDEXING GRAPH
# ============================

@app.post("/load-repo")
def load_repository(repo_url: str):


    result = index_graph.invoke(
        {
            "repo_url": repo_url
        }
    )


    return {

        "status": "success",

        "repo_name":
        result["repo_name"],


        "files_found":
        len(result["files"]),


        "chunks_created":
        len(result["chunks"]),


        "message":
        result["message"]

    }



# ============================
# QUERY GRAPH
# ============================


@app.get("/ask")
def ask_question(
    query: str,
    repo_name: str
):


    try:
        result = query_graph.invoke(
            {
                "query": query,

                "repo_name": repo_name
            }
        )

    except Exception as exc:
        logger.exception("Error while answering query")
        raise HTTPException(status_code=500, detail=f"Ask failed: {str(exc)}")

    return {

        "repo_name":
        repo_name,


        "query":
        query,


        "answer":
        result["answer"]

    }
