# 🧠 RepoMind: Complete Project Documentation

**RepoMind** is a full-stack, AI-powered developer tool designed to solve a critical engineering problem: onboarding onto a new codebase and understanding unfamiliar architectures. By utilizing an advanced **Retrieval-Augmented Generation (RAG)** pipeline, RepoMind clones GitHub repositories, analyzes source code, builds a local semantic search engine, and allows developers to chat with their codebase using natural language.

---

## 1. System Architecture & Tech Stack Overview

The project is built on a modern, decoupled architecture connecting a high-performance Python vector pipeline with an interactive React interface.

### **Frontend**
* **React 19 + Vite**: Chosen for fast builds, hot module replacement, and modern concurrent mode features.
* **Component Styling**: Custom CSS featuring a dark-themed glassmorphism aesthetic with floating chat elements for a clean ChatGPT-like experience.
* **Markdown Rendering**: Integrates `react-markdown` and `remark-gfm` to elegantly parse structured responses, code blocks, and tables returned by the AI.

### **Backend Core (Python/FastAPI)**
* **FastAPI Server**: Acts as the high-speed gateway handling HTTP requests, leveraging asynchronous endpoints and auto-generated OpenAPI docs. `uvicorn` acts as the ASGI server.
* **GitPython**: Handles programmatic fetching and cloning of repositories directly from remote URLs into a local `repositories/` directory.

### **AI & Data Pipeline (RAG Engine)**
1. **Model & Inference (LLM)**: **Llama-3.3-70B** served via the ultra-low latency **Groq API**.
2. **Embeddings Engine**: Hugging Face's `sentence-transformers` locally executing the `all-MiniLM-L6-v2` model to map code snippets to high-dimensional space without requiring external API calls.
3. **Vector Database**: **ChromaDB** running via a `PersistentClient()`. It permanently stores code vectors on disk (inside the `chroma_db/` folder), isolating different tracked repositories into their own collections.

---

## 2. Core Workflows Deep-Dive

### Workflow A: Repository Ingestion (`/load-repo`)
When a user submits a public GitHub URL in the frontend, the backend executes the ingestion pipeline incrementally:

1. **Repository Cloning (`repo_loader.py`)**: 
   The system extracts the repository name, purges any existing local copy to prevent conflicts, and executes a git clone via `GitPython`.
2. **File Scanning (`file_reader.py`)**:
   It recursively traverses the cloned folder explicitly hunting for supported extension files (`.py, .js, .java, .ts, .cpp, .cs, .go, .rs`). It implements safe UTF-8 decoding to silently bypass binaries.
3. **Intelligent Code Chunking (`chunker.py`)**:
   Instead of naive character limits, the chunker uses a multi-language regex strategy. It splits code around logical boundaries like `def `, `class `, `function `, and `const ... = () =>`. This retains the context of an entire function without cutting logic in half.
4. **Embedding Generation (`embedder.py`)**:
   `SentenceTransformers` tokenizes and encodes every chunk into numerical dense vectors.
5. **Vector Storage (`vector_db.py`)**:
   The vectors, alongside their raw text paths and code contents, are pushed into a ChromaDB Collection named after the repository. Batching (groups of 100) is utilized to optimize memory safety against massive monorepos.

### Workflow B: Codebase Querying (`/ask`)
When a user initiates the chat functionality:

1. **Query Embedding**: The user's semantic question (e.g., *"How is user authentication implemented?"*) is embedded using the *exact same* local `all-MiniLM-L6-v2` model used during chunking.
2. **Vector Similarity Search**: ChromaDB calculates cosine similarity (or L2 distance) to find the top 3 nearest code chunks inside that specific repository's collection.
3. **Prompt Augmentation (`llm_service.py`)**:
   A prompt is constructed instructing the AI that it is "RepoMind" and strictly enforcing it to answer *only* based on the injected context chunks.
4. **Streaming/Generation**: The payload is sent to Groq. Groq’s LPU engines process the Llama-3.3 prompt near-instantly and return a highly contextual answer containing codebase references and logic explanations.

---

## 3. Frontend Layout & User Experience

The React UI is split into two primary states to guide the user naturally:

* **Initial State (Empty)**: A single central card prompts the user to "Index Repository" with a GitHub input field mapping directly to the ingestion pipeline.
* **Engaged State (Side-by-Side Dashboard)**: Once the repository vectors are built and ChromaDB acknowledges success, the UI physically transforms via a CSS Grid (`split-layout`). 
  * The Index card jumps to a slim left-side panel (350px) displaying indexing statistics (Files Analyzed, Chunks Created).
  * A massive chat workspace occupies the majority of the screen, providing a familiar conversational UI where users can talk specifically to the indexed codebase. The Chat utilizes automatic scroll, structured AI markdown formatting, and avatar bubbles.

---

## 4. Key Engineering Decisions & Best Practices Implemented

* **Persistent Vector Storage**: By switching ChromaDB from an Ephemeral client to a `PersistentClient("chroma_db")`, the developer doesn't need to re-index the massive repository every time the server crashes.
* **Separation of Concerns**: The Python backend strictly compartmentalizes features into `services/` (e.g., reading files is separate from chunking, which is separate from LLM usage).
* **Strict Prompting Gates**: The LLM prompt explicitly blocks hallucinations by saying: `"Answer the user's question ONLY using the provided code context. If the context does not contain the answer, state that you don't know."`
* **Real-time Development**: The project uses a `start.bat` script that correctly kicks off both Vite's hot-reloading development server and Uvicorn's Python server concurrently to streamline local development.