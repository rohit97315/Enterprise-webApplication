import os
import json
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# LangChain Core & Community Imports
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai import ChatMistralAI
import pydantic_core

# Load Environment Variables (Ensure MISTRAL_API_KEY is present)
load_dotenv()

app = FastAPI(title="AI HR Assistant & Resume Screener Service")

# Unified CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. INITIALIZE COMPONENTS (RAG & SCREENER)
# ==========================================

print("Initializing Embeddings and Vector Store for RAG...")
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
# LLM for general HR Q&A / RAG Chatbot
llm_rag = ChatMistralAI(model="mistral-small-latest")

# LLM for Resume Screening (Optimized for JSON generation structure)
llm_screener = ChatMistralAI(
    model="mistral-tiny",
    temperature=0.1,
    max_retries=2
)

# ==========================================
# 2. PROMPT TEMPLATES & CHAINS
# ==========================================

# --- RAG Chat Prompt ---
rag_prompt_template = ChatPromptTemplate.from_messages(
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

# --- Resume Screener Prompt ---
SCREENER_PROMPT_TEMPLATE = """
You are an expert HR Technical Recruiter. Analyze the following resume text against the provided Job Description (JD).
Evaluate the candidate carefully based on technical skills, experience alignment, and project relevance.

Job Description:
{job_description}

Resume Text:
{resume_text}

Provide your response strictly as a valid JSON object. Do not include any markdown formatting, backticks (such as ```json), or extra text outside the JSON. The JSON must match this structure exactly:
{{
    "score": <integer between 0 and 100>,
    "summary": "<2-3 sentence summary of the candidate matching>",
    "key_matches": ["match1", "match2"],
    "missing_skills": ["missing1", "missing2"]
}}
"""

screener_prompt = PromptTemplate.from_template(SCREENER_PROMPT_TEMPLATE)
screener_chain = screener_prompt | llm_screener

print("RAG System and Resume Screener successfully loaded into FastAPI.")


# ==========================================
# 3. REQUEST SCHEMAS & API ENDPOINTS
# ==========================================

class ChatRequest(BaseModel):
    message: str


# --- Endpoint 1: RAG HR Chatbot ---
@app.post("/api/chat")
async def chat_with_bot(request: ChatRequest):
    try:
        query = request.message
        
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query message cannot be empty")

        # Retrieve relative documents
        docs = retriever.invoke(query)
        content = "\n\n".join([doc.page_content for doc in docs])

        # Generate response using RAG prompt setup
        final_prompt = rag_prompt_template.invoke({
            "context": content,
            "question": query
        })
        
        response = llm_rag.invoke(final_prompt)
        return {"response": response.content}

    except Exception as e:
        print(f"Error handling RAG request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing error in RAG backend")


# --- Endpoint 2: Resume Screening Analysis ---
@app.post("/api/screen")
async def screen_resume(file: UploadFile = File(...), job_description: str = Form(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Save uploaded file to a temporary location for PyPDFLoader
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Extract text from PDF using PyPDFLoader
        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        resume_text = "\n".join([doc.page_content for doc in docs])
        
        # Clean up temp file safely from disk
        os.remove(tmp_path)

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract readable text from PDF.")

        # Invoke LangChain pipeline
        response = screener_chain.invoke({
            "job_description": job_description,
            "resume_text": resume_text
        })

        # Sanitize response to isolate the strict JSON string
        raw_content = response.content.strip()
        if raw_content.startswith("```"):
            raw_content = raw_content.strip("```").strip("json").strip()

        parsed_result = json.loads(raw_content)
        return parsed_result

    except json.JSONDecodeError:
        # Fallback dictionary if LLM output fails standard parsing
        return {
            "score": 50,
            "summary": "Failed to parse structured response from AI model cleanly.",
            "key_matches": [],
            "missing_skills": ["Review manually: output format discrepancy"]
        }
    except Exception as e:
        print(f"Error handling Screener request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    # Changed host back to localhost standard or 0.0.0.0 depending on access needs
    uvicorn.run(app, host="127.0.0.1", port=8000)