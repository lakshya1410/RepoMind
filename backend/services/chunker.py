from langchain_text_splitters import (
RecursiveCharacterTextSplitter
)


def chunk_code(files):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200,
        chunk_overlap=200
    )


    chunks=[]


    for file in files:


        docs = splitter.create_documents(
            [
            file["content"]
            ],

            metadatas=[
                {
                "file":
                file["file_name"],

                "path":
                file["path"]
                }
            ]
        )


        for doc in docs:

            chunks.append(
            {
            "file_name":
            doc.metadata["file"],

            "path":
            doc.metadata["path"],

            "chunk":
            doc.page_content
            }
            )


    return chunks