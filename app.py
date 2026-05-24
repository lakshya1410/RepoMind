import streamlit as st

from backend.services.file_reader import read_code_files
from backend.services.chunker import chunk_code
from backend.services.embedder import generate_embeddings
from backend.services.vector_db import store_embeddings
from backend.services.embedder import generate_query_embedding
from backend.services.vector_db import search_similar_chunks
from backend.services.llm_service import generate_response
from backend.services.repo_loader import clone_github_repo

st.title("RepoMind")

repo_url = st.text_input("Enter GitHub Repository URL")

question = st.text_input("Ask Question About Repository")

if st.button("Analyze Repository"):

    with st.spinner("Cloning Repository..."):

        repo_path = clone_github_repo(repo_url)

        repo_name = repo_url.rstrip("/").split("/")[-1]

        files = read_code_files(repo_path)

        chunks = chunk_code(files)

        embedded_chunks = generate_embeddings(chunks)

        store_embeddings(
            embedded_chunks,
            repo_name
        )

    st.success("Repository Processed Successfully!")

if st.button("Ask Question"):

    if question and repo_url:

        repo_name = repo_url.rstrip("/").split("/")[-1]

        with st.spinner("Generating Answer..."):

            query_embedding = generate_query_embedding(question)

            retrieved_chunks = search_similar_chunks(
                query_embedding,
                repo_name
            )

            answer = generate_response(
                question,
                retrieved_chunks
            )

        st.subheader("Answer")
        st.write(answer)