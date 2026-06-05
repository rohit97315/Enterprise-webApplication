import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Imports
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_mistralai import ChatMistralAI
from langchain_core.prompts import ChatPromptTemplate


load_dotenv()


app = FastAPI(title="Python RAG Chatbot Service")

print("Initializing Embeddings and Vector Store...")
embedding = HuggingFaceEmbeddings(model="all-MiniLM-L6-v2")

vectorstore = Chroma(
    persist_directory="chroma_db",
    embedding_function=embedding
)

retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 4,
        "fetch_k": 10,
        "lambda_mult": 0.5
    }
)

print("Connecting to Mistral AI...")
llm = ChatMistralAI(model="mistral-small-latest")

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """You are a helpful HR AI assistant.

Use ONLY the provided context to answer the question.

If the answer is not present in the context,
say: "I could not find the answer in the document."
"""
        ),
        (
            "human",
            """Context:
{context}

Question:
{question}
"""
        )
    ]
)

print("RAG System successfully loaded into FastAPI.")


class ChatRequest(BaseModel):
    message: str


@app.post("/api/chat")
async def chat_with_bot(request: ChatRequest):
    try:
        query = request.message
        
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query message cannot be empty")

        docs = retriever.invoke(query)

        content = "\n\n".join([doc.page_content for doc in docs])

        final_prompt = prompt_template.invoke({
            "context": content,
            "question": query
        })
        
        response = llm.invoke(final_prompt)

        return {"response": response.content}

    except Exception as e:
        print(f"Error handling RAG request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing error in RAG backend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)