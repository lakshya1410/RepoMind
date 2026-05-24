import chromadb
import os

# Use a persistent client instead of an ephemeral one
# This ensures that embeddings are stored on disk and survive restarts
client = chromadb.PersistentClient(path="chroma_db")

def get_collection(collection_name):

    collection = client.get_or_create_collection(
        name=collection_name
    )

    return collection


def store_embeddings(embedded_chunks, collection_name):

    collection = get_collection(collection_name)

    # Clear existing collection if we want to re-index the repository
    # collection.delete(ids=collection.get().ids) # Uncomment if fresh index per repo is needed

    # Chunking the updates to avoid API/memory limits if the codebase is huge
    batch_size = 100
    for i in range(0, len(embedded_chunks), batch_size):
        batch = embedded_chunks[i:i+batch_size]
        ids = [str(index) for index in range(i, i + len(batch))]
        embeddings = [item["embedding"] for item in batch]
        documents = [item["chunk"] for item in batch]

        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents
        )

    return "Embeddings stored successfully"

def search_similar_chunks(query_embedding, collection_name):

    collection = get_collection(collection_name)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    return results