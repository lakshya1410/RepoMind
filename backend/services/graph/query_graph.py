from typing import TypedDict

from langgraph.graph import StateGraph, END


from backend.services.embedder import (
get_embedding_model
)

from backend.services.vector_db import (
search_similar_chunks
)

from backend.services.llm_service import (
generate_response
)




class QueryState(TypedDict):

    query:str

    repo_name:str

    query_embedding:list

    retrieved_chunks:dict

    answer:str




# NODE 1

def embedding_node(state):

    # Just create string since chroma handles embedding
    return {
        **state,
        "query_embedding": state["query"]
    }






# NODE 2

def retrieve_node(state):


    chunks = search_similar_chunks(

        state["query_embedding"],

        state["repo_name"]

    )



    return {
        **state,
        "retrieved_chunks":chunks
    }






# NODE 3

def answer_node(state):


    answer = generate_response(

        state["query"],

        state["retrieved_chunks"]

    )



    return {
        **state,
        "answer":answer
    }






workflow = StateGraph(QueryState)


workflow.add_node(
"embed_query",
embedding_node
)


workflow.add_node(
"retrieve",
retrieve_node
)


workflow.add_node(
"answer",
answer_node
)



workflow.set_entry_point(
"embed_query"
)



workflow.add_edge(
"embed_query",
"retrieve"
)


workflow.add_edge(
"retrieve",
"answer"
)


workflow.add_edge(
"answer",
END
)



query_graph = workflow.compile()