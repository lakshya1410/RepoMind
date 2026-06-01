# RepoMind Project Documentation

## 1. Project Summary

RepoMind is a codebase intelligence tool that clones a public GitHub repository, indexes its source files into a persistent vector database, and answers natural-language questions against that indexed repository.

The current application is made of:

- a React frontend in `frontend/`
- a FastAPI backend in `backend/`
- a LangGraph-based ingestion and query pipeline
- local embeddings and retrieval with Chroma
- Groq-hosted answer generation

The active backend entrypoint is [backend/main.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/main.py).

## 2. Runtime Architecture

### Frontend layer

The frontend is a Vite-powered React app that:

- accepts a repository URL
- sends the indexing request to the backend
- stores the indexed repository name returned by the API
- sends user questions to the `/ask` endpoint
- renders markdown answers in the chat UI

The main UI logic lives in [frontend/src/App.jsx](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/frontend/src/App.jsx).

### API layer

The backend API is defined in [backend/main.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/main.py). It currently exposes three relevant routes:

- `GET /` for a health check
- `POST /load-repo` for repository ingestion
- `GET /ask` for repository-aware question answering

The backend also configures CORS for local frontend development and supports overriding allowed origins with `CORS_ALLOW_ORIGINS`.

### Workflow layer

The backend uses LangGraph to structure the main application flows:

- [backend/services/graph/index_graph.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/graph/index_graph.py) for repository ingestion
- [backend/services/graph/query_graph.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/graph/query_graph.py) for repository querying

This is the main architectural change compared with the earlier service-by-service direct endpoint approach.

## 3. Repository Ingestion Flow

The indexing pipeline starts at `POST /load-repo`.

### Step 1: Clone repository

[backend/services/repo_loader.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/repo_loader.py) clones the repository into the local `repositories/` directory.

Current behavior:

- only HTTP/HTTPS URLs are accepted
- the repository name is extracted from the URL
- if a local folder already exists for that repository, it is removed before cloning

### Step 2: Read supported source files

[backend/services/file_reader.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/file_reader.py) recursively reads supported files and returns a list of dictionaries containing:

- file name
- full path
- raw content

Supported extensions currently are:

- `.py`
- `.js`
- `.java`
- `.ts`
- `.cpp`
- `.h`
- `.cs`
- `.go`
- `.rs`

Files are read with UTF-8 using `errors="replace"` to reduce failures caused by unusual encodings.

### Step 3: Chunk source code

[backend/services/chunker.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/chunker.py) uses `RecursiveCharacterTextSplitter` with:

- `chunk_size=1200`
- `chunk_overlap=200`

This is important because the current implementation no longer uses the older regex-based function/class chunking strategy described in the previous documentation.

Each chunk keeps file metadata so the retrieval layer can preserve file provenance.

### Step 4: Store chunks in Chroma

[backend/services/vector_db.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/vector_db.py) converts chunks into LangChain `Document` objects and stores them in a persistent Chroma collection.

Current storage behavior:

- `persist_directory` is `./chroma_db`
- `collection_name` is the repository name
- metadata includes file name and path

The index endpoint returns:

- `repo_name`
- `files_found`
- `chunks_created`
- `message`

## 4. Query and Answer Flow

The question-answer pipeline starts at `GET /ask`.

### Step 1: Build query state

[backend/services/graph/query_graph.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/graph/query_graph.py) starts from:

- `query`
- `repo_name`

The current graph keeps the raw query string as `query_embedding` because Chroma handles embedding internally through the configured embedding function.

### Step 2: Retrieve similar chunks

[backend/services/vector_db.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/vector_db.py) creates a retriever from the repository collection and fetches the top `k=5` matching chunks.

Retrieved results are normalized into dictionaries with:

- `chunk`
- `file_name`
- `path`

### Step 3: Generate the answer

[backend/services/llm_service.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/services/llm_service.py) uses:

- `ChatGroq`
- model `llama-3.3-70b-versatile`
- `temperature=0`

The prompt instructs the model to answer using only the provided context.

The current implementation also includes a safety fallback:

- if no useful retrieved context exists, it returns a friendly re-index message instead of failing

### Step 4: API error handling

[backend/main.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/backend/main.py) wraps the `/ask` graph invocation in a `try/except` block and raises a structured `HTTPException(500)` if the workflow fails.

This makes frontend failures easier to diagnose than a silent server crash.

## 5. CORS and Frontend Integration

The backend explicitly allows common local development origins:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

These defaults exist because the frontend runs on Vite while the backend runs on FastAPI at a different origin.

The backend supports overriding this list with:

```env
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

This is a notable backend improvement and should be preserved in future deployments.

## 6. Current Dependencies and Stack

From [requirements.txt](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/requirements.txt), the active backend stack includes:

- `fastapi`
- `uvicorn`
- `python-dotenv`
- `groq`
- `langchain-groq`
- `langchain`
- `langchain-core`
- `langchain-community`
- `langgraph`
- `sentence-transformers`
- `langchain-huggingface`
- `chromadb`
- `langchain-chroma`
- `GitPython`
- `pydantic`

The file also still lists `streamlit`, but the current web product is not driven by Streamlit.

## 7. Run Instructions

### Standard development startup

Backend:

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload --reload-dir backend
```

Frontend:

```bash
cd frontend
npm run dev
```

### Windows helper script

[start.bat](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/start.bat) starts both services in separate command prompts.

It launches:

- the backend on `127.0.0.1:8000`
- the frontend on `localhost:5173`

## 8. Legacy Files and Historical Notes

[app.py](C:/Users/LAKSHYA/Desktop/AI-CodeBase-Assistant/app.py) is a legacy Streamlit prototype. It is still present in the repository, but it does not represent the current primary product flow.

The old documentation also referenced several test endpoints such as:

- `/read-codebase`
- `/chunks`
- `/embeddings`
- `/store-embeddings`

These are not part of the current `backend/main.py` API and should no longer be treated as supported application endpoints.

## 9. Suggested Maintenance Notes

The current backend is in a much better place functionally, but these points are worth keeping in mind:

- repository names are used as collection names, so naming collisions can matter if two repositories resolve to the same final URL segment
- re-indexing an existing repository name writes into the same logical Chroma collection path
- the `README.md` and this file should stay aligned with `backend/main.py`, not the legacy Streamlit flow
- if the frontend is deployed on a non-local domain, `CORS_ALLOW_ORIGINS` will need to be set explicitly
