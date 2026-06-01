from typing import TypedDict

from langgraph.graph import StateGraph, END


from backend.services.repo_loader import clone_github_repo
from backend.services.file_reader import read_code_files
from backend.services.chunker import chunk_code
from backend.services.embedder import generate_embeddings
from backend.services.vector_db import store_embeddings



class IndexState(TypedDict):

    repo_url: str

    repo_name: str

    repo_path: str

    files: list

    chunks: list

    embedded_chunks: list

    message: str



# NODE 1

def clone_node(state):

    repo_path = clone_github_repo(
        state["repo_url"]
    )


    repo_name = (
        state["repo_url"]
        .rstrip("/")
        .split("/")[-1]
    )


    return {
        **state,
        "repo_path":repo_path,
        "repo_name":repo_name
    }





# NODE 2

def read_node(state):

    files = read_code_files(
        state["repo_path"]
    )


    return {
        **state,
        "files":files
    }





# NODE 3

def chunk_node(state):

    chunks = chunk_code(
        state["files"]
    )


    return {
        **state,
        "chunks":chunks
    }






# NODE 4

def embedding_node(state):


    embedded = generate_embeddings(
        state["chunks"]
    )


    return {
        **state,
        "embedded_chunks":embedded
    }






# NODE 5

def store_node(state):


    result = store_embeddings(
        state["embedded_chunks"],
        state["repo_name"]
    )


    return {
        **state,
        "message":result
    }





workflow = StateGraph(IndexState)



workflow.add_node(
    "clone",
    clone_node
)


workflow.add_node(
    "read",
    read_node
)


workflow.add_node(
    "chunk",
    chunk_node
)


workflow.add_node(
    "embedding",
    embedding_node
)


workflow.add_node(
    "store",
    store_node
)



workflow.set_entry_point(
    "clone"
)


workflow.add_edge(
    "clone",
    "read"
)


workflow.add_edge(
    "read",
    "chunk"
)


workflow.add_edge(
    "chunk",
    "embedding"
)


workflow.add_edge(
    "embedding",
    "store"
)


workflow.add_edge(
    "store",
    END
)



index_graph = workflow.compile()