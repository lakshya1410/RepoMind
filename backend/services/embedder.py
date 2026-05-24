from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')


def generate_embeddings(chunks):

    embedded_chunks = []

    for chunk in chunks:

        embedding = model.encode(chunk["chunk"]).tolist()

        embedded_chunks.append({
            "file_name": chunk["file_name"],
            "path": chunk["path"],
            "chunk": chunk["chunk"],
            "embedding": embedding
        })

    return embedded_chunks

def generate_query_embedding(query):

    embedding = model.encode(query).tolist()

    return embedding