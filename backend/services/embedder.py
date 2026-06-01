from langchain_huggingface import (
HuggingFaceEmbeddings
)


embedding_model = HuggingFaceEmbeddings(
model_name=
"sentence-transformers/all-MiniLM-L6-v2"
)


def get_embedding_model():
    return embedding_model

def generate_embeddings(chunks):
    # Chroma handles embeddings internally when we pass the embedding_function,
    # so we just return chunks here.
    return chunks
