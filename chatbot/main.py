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
import httpx
from langchain.tools import tool
from langchain_core.tools import BaseTool

# from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage


# Load Environment Variables (Ensure MISTRAL_API_KEY is present)
load_dotenv()

app = FastAPI(title="AI HR Assistant & Resume Screener Service")

# @tool
# def hr_rag_tool(question: str) -> str:
#     """Use this tool to answer questions about HR policies, company rules,
#     leave policies, salary, holidays, or anything in the employee handbook.
#     Input should be the employee's question as a string."""
    
#     docs = retriever.invoke(question)
#     context = "\n\n".join([doc.page_content for doc in docs])
    
#     if not context.strip():
#         return "I could not find relevant information in the HR documents."
    
#     prompt = rag_prompt_template.invoke({
#         "context": context,
#         "question": question
#     })
    
#     response = llm_rag.invoke(prompt)
#     return response.content

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
    employee_id: str = "" 

@tool
def apply_leave_tool(employee_id: str, leave_type: str, start_date: str, end_date: str, reason: str = "") -> str:
    """Use this tool when the employee wants to apply for leave / take time off.
    
    Parameters:
    - employee_id: The employee's MongoDB user ID (provided in the request context)
    - leave_type: Must be exactly one of: 'Sick Leave', 'Annual Leave', 'Casual Leave'
    - start_date: Start date in YYYY-MM-DD format
    - end_date: End date in YYYY-MM-DD format  
    - reason: Optional reason for leave
    
    Example usage: employee says 'apply sick leave from June 28 to July 2'
    """
    
    if not employee_id:
        return "Cannot apply leave: employee ID is missing. Please log in again."
    
    # Validate leave type
    valid_types = ['Sick Leave', 'Annual Leave', 'Casual Leave']
    if leave_type not in valid_types:
        return f"Invalid leave type. Must be one of: {', '.join(valid_types)}"
    
    try:
        response = httpx.post(
            "http://localhost:3000/api/leave/apply-internal",
            json={
                "employee_id": employee_id,
                "leaveType": leave_type,
                "startDate": start_date,
                "endDate": end_date,
                "reason": reason
            },
            timeout=10.0
        )
        
        if response.status_code == 201:
            data = response.json()
            days = data['leave']['days']
            return (
                f"Leave applied successfully! "
                f"{leave_type} from {start_date} to {end_date} ({days} days). "
                f"Status: Pending — your HR manager will review it."
            )
        else:
            error = response.json().get('message', 'Unknown error')
            return f"Failed to apply leave: {error}"
            
    except httpx.ConnectError:
        return "Could not connect to the backend server. Make sure Node.js is running on port 3000."
    except Exception as e:
        return f"Error applying leave: {str(e)}"
    




# 2nd tool
# @tool
# def check_leave_status_tool(employee_id: str) -> str:
#     """Use this tool when the employee asks about their leave history,
#     leave status, pending leaves, or approved leaves.
    
#     Parameter:
#     - employee_id: The employee's MongoDB user ID
#     """
    
#     if not employee_id:
#         return "Cannot check leaves: employee ID is missing."
    
#     try:
#         # Note: this hits a protected route — for now we call the internal approach
#         response = httpx.get(
#             f"http://localhost:3000/api/leave/all",
#             timeout=10.0
#         )
#         print(f"[DEBUG] Node backend response status: {response.status_code}")
        
#         if response.status_code == 200:
#             leaves = response.json()
#             # Filter to this employee only
#             my_leaves = [l for l in leaves if str(l.get('employeeId')) == employee_id]
            
#             if not my_leaves:
#                 return "You have no leave requests on record."
            
#             result = f"You have {len(my_leaves)} leave request(s):\n"
#             for leave in my_leaves[:5]:  # Show last 5
#                 result += (
#                     f"- {leave['leaveType']}: "
#                     f"{leave['startDate'][:10]} to {leave['endDate'][:10]} "
#                     f"({leave['days']} days) — {leave['status']}\n"
#                 )
#             return result
#         else:
#             return "Could not fetch leave records."
            
#     except Exception as e:
#         return f"Error checking leaves: {str(e)}"





@tool
def check_leave_status_tool(employee_id: str) -> str:
    """Use this tool when the employee asks about their leave history,
    leave status, pending leaves, or approved leaves.
    
    Parameter:
    - employee_id: The employee's MongoDB user ID
    """
    
    if not employee_id:
        return "Cannot check leaves: employee ID is missing."
    
    try:
        # 1. Hit the Node backend route (Make sure port matches where your Node server runs)
        response = httpx.get(
            f"http://localhost:3000/api/leave/all-internal",
            timeout=10.0
        )
        
        # DEBUG LOG: See exactly what status code your Node backend is responding with
        print(f"[DEBUG] Node backend response status: {response.status_code}")
        
        if response.status_code == 200:
            leaves = response.json()
            
            # 2. Bulletproof Filtering Logic
            # This handles strings, nested populated objects, and avoids TypeErrors
            my_leaves = []
            for l in leaves:
                emp_id_field = l.get('employeeId')
                
                # If employeeId is a nested dictionary (populated object), extract the ID string
                if isinstance(emp_id_field, dict):
                    emp_id_str = str(emp_id_field.get('_id') or emp_id_field.get('id', ''))
                else:
                    emp_id_str = str(emp_id_field) if emp_id_field else ""
                
                if emp_id_str == str(employee_id):
                    my_leaves.append(l)
            
            if not my_leaves:
                return "You have no leave requests on record."
            
            # 3. Build a clean text string output for the AI Agent to speak back
            result = f"You have {len(my_leaves)} leave request(s):\n"
            for leave in my_leaves[:5]:  # Show last 5 records
                # Graceful extraction in case date strings are formatted differently
                start = leave.get('startDate', '')[:10] if leave.get('startDate') else 'N/A'
                end = leave.get('endDate', '')[:10] if leave.get('endDate') else 'N/A'
                
                result += (
                    f"- {leave.get('leaveType', 'Leave')}: "
                    f"{start} to {end} "
                    f"({leave.get('days', 0)} days) — {leave.get('status', 'Pending')}\n"
                )
            return result
        else:
            # Enhanced fallback error description to show you why it failed
            return f"Could not fetch leave records. Backend responded with HTTP status code: {response.status_code}"
            
    except Exception as e:
        return f"Error checking leaves: {str(e)}"



# List of all tools the agent can use
agent_tools = [ apply_leave_tool, check_leave_status_tool]

# Agent prompt — this tells the LLM how to behave
agent_system_prompt = """You are HRBot, a helpful HR AI assistant for DevGuard company.

You have access to the following tools:
1. apply_leave_tool — applies for leave on behalf of the employee
2. check_leave_status_tool — checks the employee's leave history and status

Important rules:
- When the employee wants to apply for leave, ALWAYS use the apply_leave_tool
- The employee_id will be provided to you in the context — use it for leave operations
- For leave type, map naturally: "sick leave" → "Sick Leave", "annual" → "Annual Leave", "casual" → "Casual Leave"
- For dates, always convert to YYYY-MM-DD format
- Be friendly and confirm what you've done after applying leave

Current employee_id: {employee_id}
"""

# Agent prompt template with message history support
agent_prompt = ChatPromptTemplate.from_messages([
    ("system", agent_system_prompt),
    MessagesPlaceholder("chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),  # Required for tool call tracking
])

# Create the agent (tool-calling style works best with Mistral)
agent = create_tool_calling_agent(
    llm=llm_rag,           # Using your existing Mistral LLM
    tools=agent_tools,
    prompt=agent_prompt
)

# AgentExecutor runs the agent in a loop until it has a final answer
agent_executor = AgentExecutor(
    agent=agent,
    tools=agent_tools,
    verbose=True,           # Set False in production, True for debugging
    max_iterations=5,       # Prevents infinite loops
    handle_parsing_errors=True
)















# --- Endpoint 1: RAG HR Chatbot ---
# @app.post("/api/chat")
# async def chat_with_bot(request: ChatRequest):
#     try:
#         query = request.message
        
#         if not query.strip():
#             raise HTTPException(status_code=400, detail="Query message cannot be empty")

#         # Retrieve relative documents
#         docs = retriever.invoke(query)
#         content = "\n\n".join([doc.page_content for doc in docs])

#         # Generate response using RAG prompt setup
#         final_prompt = rag_prompt_template.invoke({
#             "context": content,
#             "question": query
#         })
        
#         response = llm_rag.invoke(final_prompt)
#         return {"response": response.content}

#     except Exception as e:
#         print(f"Error handling RAG request: {str(e)}")
#         raise HTTPException(status_code=500, detail="Internal processing error in RAG backend")

@app.post("/api/chat")
async def chat_with_bot(request: ChatRequest):
    try:
        query = request.message
        employee_id = request.employee_id  # Now coming from frontend
        
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query message cannot be empty")

        # Run through the agent instead of the plain RAG chain
        result = agent_executor.invoke({
            "input": query,
            "employee_id": employee_id,
            "chat_history": []   # You can add memory here later
        })
        
        return {"response": result["output"]}

    except Exception as e:
        print(f"Agent error: {str(e)}")
        raise HTTPException(status_code=500, detail="Agent processing failed")










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