from langchain_chroma import Chroma
from langchain_core.documents import Document

from backend.services.embedder import get_embedding_model



def store_embeddings(
chunks,
collection_name
):


    docs=[]


    for chunk in chunks:


        docs.append(
        Document(
        page_content=
        chunk["chunk"],


        metadata={
        "file":
        chunk["file_name"],

        "path":
        chunk["path"]
        }
        )
        )



    db = Chroma(
    collection_name=collection_name,

    embedding_function=
    get_embedding_model(),

    persist_directory=
    "./chroma_db"
    )


    db.add_documents(docs)



    return True




def get_retriever(collection):


    db=Chroma(
    collection_name=collection,

    embedding_function=
    get_embedding_model(),

    persist_directory=
    "./chroma_db"
    )


    return db.as_retriever(
        search_kwargs={
        "k":5
        }
    )

def search_similar_chunks(query, collection_name):
    retriever = get_retriever(collection_name)
    docs = retriever.invoke(query)
    
    return [
        {
            "chunk": doc.page_content,
            "file_name": doc.metadata.get("file"),
            "path": doc.metadata.get("path")
        } for doc in docs
    ]