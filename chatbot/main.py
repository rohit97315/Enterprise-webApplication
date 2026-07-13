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
# from langchain_community.vectorstores import Chroma
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mistralai import ChatMistralAI
import pydantic_core
import httpx
from langchain.tools import tool
from langchain_core.tools import BaseTool
import datetime

from mistralai.client import Mistral
# from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage



# import datetime
# from mistralai import Mistral
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
FRONTEND_URL=os.getenv("FRONTEND_URL")
# Unified CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
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




# ==========================================
# SHARED: Handbook / Policy RAG lookup
# ==========================================

def answer_policy_question(question: str) -> str:
    """Core retrieval-augmented lookup against the employee handbook vectorstore.
    Used by both the employee agent and the HR agent as a shared tool."""
    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    if not context.strip():
        return "I could not find relevant information in the HR documents."

    prompt = rag_prompt_template.invoke({
        "context": context,
        "question": question
    })

    response = llm_rag.invoke(prompt)
    return response.content



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
        NODE_API_URL = os.getenv("NODE_API_URL")
        response = httpx.post(
            f"{NODE_API_URL}/api/leave/apply-internal",
            json={
                "employee_id": employee_id,
                "leaveType": leave_type,
                "startDate": start_date,
                "endDate": end_date,
                "reason": reason
            },
            headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")},
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
        NODE_API_URL = os.getenv("NODE_API_URL")
        response = httpx.get(
            f"{NODE_API_URL}/api/leave/all-internal",
            headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")},
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

@tool
def policy_qa_tool(question: str) -> str:
    """Use this tool when the employee asks about HR policies, company rules,
    leave policy details, salary, holidays, benefits, or anything that would
    be found in the employee handbook.

    Parameter:
    - question: the employee's question, as a string
    """
    return answer_policy_question(question)

# List of all tools the agent can use
agent_tools = [ apply_leave_tool, check_leave_status_tool, policy_qa_tool]

# Agent prompt — this tells the LLM how to behave
agent_system_prompt = """You are HRBot, a helpful HR AI assistant for DevGuard company.

You have access to the following tools:
1. apply_leave_tool — applies for leave on behalf of the employee
2. check_leave_status_tool — checks the employee's leave history and status
3. policy_qa_tool — answers questions about HR policies, benefits, and the employee handbook

Important rules:
- When the employee wants to apply for leave, ALWAYS use the apply_leave_tool
- The employee_id will be provided to you in the context — use it for leave operations
- For leave type, map naturally: "sick leave" → "Sick Leave", "annual" → "Annual Leave", "casual" → "Casual Leave"
- For dates, always convert to YYYY-MM-DD format
- When the employee asks about policy, rules, benefits, or anything from the handbook, use policy_qa_tool
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










# ==========================================
# HR INTELLIGENCE AGENT — MISTRAL TOOL CALLING
# ==========================================



# Reuses your existing MISTRAL_API_KEY from .env (os and load_dotenv already called above)
mistral_client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))

# httpx is already imported at the top of your main.py
NODE_API_URL = os.getenv("NODE_API_URL")
NODE = f"{NODE_API_URL}/api/leave"


# ── Tool functions ─────────────────────────────────────────────────────────

def search_employee_leaves(employee_name: str) -> str:
    try:
        r = httpx.get(f"{NODE}/search", params={"username": employee_name},headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        if r.status_code == 404:
            return f"No leave records found for '{employee_name}'."
        data   = r.json()
        leaves = data["leaves"]
        summary = data["summary"]
        out  = f"Leave history for '{employee_name}':\n"
        out += f"Total: {summary['totalLeaves']} requests, {summary['totalDays']} days\n"
        out += f"By type: {summary['byType']}\nBy status: {summary['byStatus']}\n\nRecent records:\n"
        for l in leaves[:10]:
            reason = f" | {l['reason']}" if l.get("reason") else ""
            out += f"  - {l['leaveType']} | {l['startDate'][:10]} to {l['endDate'][:10]} ({l['days']} days) | {l['status']}{reason}\n"
        return out
    except Exception as e:
        return f"Error: {str(e)}"


def get_leave_ranking(month: int = 0, year: int = 0) -> str:
    try:
        params  = {"month": month, "year": year} if month and year else {}
        r       = httpx.get(f"{NODE}/ranking", params=params,headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        ranking = r.json()
        if not ranking:
            return "No leave records found."
        period = f"for {month}/{year}" if month and year else "(all time)"
        out = f"Leave ranking {period}:\n"
        for i, emp in enumerate(ranking, 1):
            out += (f"  {i}. {emp['_id']} — {emp['totalLeaves']} requests, "
                    f"{emp['totalDays']} days (Sick: {emp['sickLeaves']}, "
                    f"Annual: {emp['annualLeaves']})\n")
        return out
    except Exception as e:
        return f"Error: {str(e)}"


def get_employees_on_leave_today() -> str:
    try:
        r    = httpx.get(f"{NODE}/on-leave-today",headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        data = r.json()
        if data["count"] == 0:
            return "No employees are on leave today."
        today = datetime.date.today().strftime("%B %d, %Y")
        out   = f"Employees on leave today ({today}): {data['count']}\n"
        for emp in data["employees"]:
            out += f"  - {emp['username']} | {emp['leaveType']} | Returns {emp['endDate'][:10]}\n"
        return out
    except Exception as e:
        return f"Error: {str(e)}"


def get_all_pending_leaves() -> str:
    try:
        r       = httpx.get(f"{NODE}/all-internal", headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")},timeout=10)   # uses your existing /all-internal route
        pending = [l for l in r.json() if l["status"] == "Pending"]
        if not pending:
            return "No pending leave requests. You are caught up."
        out = f"Pending requests ({len(pending)}):\n"
        for l in pending:
            reason = f" | {l['reason']}" if l.get("reason") else ""
            out += (f"  • {l['username']} | {l['leaveType']} | "
                    f"{l['startDate'][:10]} to {l['endDate'][:10]} ({l['days']} days){reason}\n")
        return out
    except Exception as e:
        return f"Error: {str(e)}"


def approve_all_leaves_for_employee(employee_name: str) -> str:
    try:
        r = httpx.post(f"{NODE}/bulk-update",
                       json={"username": employee_name, "status": "Approved"},headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        return r.json().get("message", "Done.")
    except Exception as e:
        return f"Error: {str(e)}"


def reject_all_leaves_for_employee(employee_name: str) -> str:
    try:
        r = httpx.post(f"{NODE}/bulk-update",
                       json={"username": employee_name, "status": "Rejected"}, headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")},timeout=10)
        return r.json().get("message", "Done.")
    except Exception as e:
        return f"Error: {str(e)}"


def flag_high_absenteeism(threshold: int = 5) -> str:
    try:
        r    = httpx.get(f"{NODE}/high-absenteeism", params={"threshold": threshold},headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        data = r.json()
        if not data["employees"]:
            return f"No employees with {threshold}+ leaves. Attendance looks healthy."
        out = f"Attendance Risk — {threshold}+ leaves:\n"
        for emp in data["employees"]:
            out += f"  ⚠ {emp['_id']} | {emp['totalLeaves']} requests | {emp['totalDays']} days\n"
        out += "\nSuggestion: Schedule check-in meetings with flagged employees."
        return out
    except Exception as e:
        return f"Error: {str(e)}"


def update_specific_leave(employee_name: str, start_date: str, new_status: str) -> str:
    try:
        r = httpx.get(f"{NODE}/search", params={"username": employee_name},headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=10)
        if r.status_code != 200:
            return f"No leaves found for '{employee_name}'."
        leaves = r.json()["leaves"]
        target = next(
            (l for l in leaves if l["startDate"][:10] == start_date and l["status"] == "Pending"),
            None
        )
        if not target:
            return f"No pending leave found for '{employee_name}' starting {start_date}."
        upd = httpx.patch(f"{NODE}/{target['_id']}/status",
                          json={"status": new_status}, timeout=10)
        if upd.status_code == 200:
            return (f"Done. {employee_name}'s {target['leaveType']} "
                    f"({start_date} to {target['endDate'][:10]}) is now {new_status}.")
        return f"Failed: {upd.json().get('message')}"
    except Exception as e:
        return f"Error: {str(e)}"


def auto_process_leaves_by_rule(
    action: str,
    leave_type: str = "",
    max_days: int = 0,
    min_days: int = 0,
    blackout_start: str = "",
    blackout_end: str = ""
) -> str:
    try:
        payload = {"action": action}
        if leave_type:     payload["leave_type"]     = leave_type
        if max_days:       payload["max_days"]        = max_days
        if min_days:       payload["min_days"]        = min_days
        if blackout_start: payload["blackout_start"]  = blackout_start
        if blackout_end:   payload["blackout_end"]    = blackout_end

        r    = httpx.post(f"{NODE}/auto-process", json=payload,headers={"X-Internal-Key": os.getenv("INTERNAL_API_KEY")}, timeout=15)
        data = r.json()
        if data["processedCount"] == 0:
            return "No pending leaves matched your rule. Nothing changed."
        out = f"{data['message']}\n\nProcessed:\n"
        for item in data["processed"]:
            out += (f"  - {item['username']} | {item['leaveType']} | "
                    f"{item['startDate']} to {item['endDate']} "
                    f"({item['days']} days) → {item['newStatus']}\n")
        return out
    except Exception as e:
        return f"Error: {str(e)}"


# ── Tool registry ──────────────────────────────────────────────────────────
TOOL_FUNCTIONS = {
    "search_employee_leaves":          search_employee_leaves,
    "get_leave_ranking":               get_leave_ranking,
    "get_employees_on_leave_today":    get_employees_on_leave_today,
    "get_all_pending_leaves":          get_all_pending_leaves,
    "approve_all_leaves_for_employee": approve_all_leaves_for_employee,
    "reject_all_leaves_for_employee":  reject_all_leaves_for_employee,
    "flag_high_absenteeism":           flag_high_absenteeism,
    "update_specific_leave":           update_specific_leave,
    "auto_process_leaves_by_rule":     auto_process_leaves_by_rule,
    "answer_policy_question":          answer_policy_question,
}


# ── Tool definitions (JSON schemas sent to Mistral) ────────────────────────
HR_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_employee_leaves",
            "description": "Search a specific employee's full leave history by name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_name": {"type": "string", "description": "Employee username or name (partial match works)"}
                },
                "required": ["employee_name"]
            }
        }
    },
    {
         "type": "function",
         "function": {
             "name": "answer_policy_question",
             "description": "Answer questions about HR policies, company rules, or anything in the employee handbook, using the handbook document store.",
             "parameters": {
                 "type": "object",
                 "properties": {
                     "question": {"type": "string", "description": "The policy/handbook question to look up"}
                 },
                 "required": ["question"]
             }
         }
     },
    {
        "type": "function",
        "function": {
            "name": "get_leave_ranking",
            "description": "Get all employees ranked by leave days taken. Pass month and year to filter.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {"type": "integer", "description": "Month 1-12, or 0 for all time"},
                    "year":  {"type": "integer", "description": "Year like 2026, or 0 for all time"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_employees_on_leave_today",
            "description": "Check who is currently on approved leave today.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_pending_leaves",
            "description": "Get all pending leave requests waiting for HR approval.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "approve_all_leaves_for_employee",
            "description": "Approve all pending leaves for one employee in bulk.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_name": {"type": "string"}
                },
                "required": ["employee_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reject_all_leaves_for_employee",
            "description": "Reject all pending leaves for one employee in bulk.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_name": {"type": "string"}
                },
                "required": ["employee_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "flag_high_absenteeism",
            "description": "Find employees who have taken more leaves than a threshold number.",
            "parameters": {
                "type": "object",
                "properties": {
                    "threshold": {"type": "integer", "description": "Minimum leave count to flag. Default 5."}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_specific_leave",
            "description": "Approve or reject one specific leave by employee name and start date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_name": {"type": "string"},
                    "start_date":    {"type": "string", "description": "YYYY-MM-DD"},
                    "new_status":    {"type": "string", "description": "'Approved' or 'Rejected'"}
                },
                "required": ["employee_name", "start_date", "new_status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "auto_process_leaves_by_rule",
            "description": "Automatically approve or reject multiple pending leaves based on HR rules.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action":         {"type": "string",  "description": "'Approved' or 'Rejected'"},
                    "leave_type":     {"type": "string",  "description": "Optional: 'Sick Leave', 'Annual Leave', or 'Casual Leave'"},
                    "max_days":       {"type": "integer", "description": "Only process leaves with days <= this"},
                    "min_days":       {"type": "integer", "description": "Only process leaves with days >= this"},
                    "blackout_start": {"type": "string",  "description": "Blackout period start YYYY-MM-DD"},
                    "blackout_end":   {"type": "string",  "description": "Blackout period end YYYY-MM-DD"}
                },
                "required": ["action"]
            }
        }
    }
]


# ── Agent loop ─────────────────────────────────────────────────────────────

def run_hr_agent(message: str) -> str:
    today = datetime.date.today().strftime("%B %d, %Y")

    messages = [
        {
            "role": "system",
            "content": (
                f"You are HRIntel, an intelligent HR assistant for DevGuard company. "
                f"You help HR Managers manage employee leave data. You have tools to search, "
                f"analyse, approve, reject, and automate leave processing. You can also answer "
                f"HR policy/handbook questions using answer_policy_question.\n\n"
                f"Rules:\n"
                f"- When HR mentions an employee name, use search_employee_leaves first\n"
                f"- When HR asks a policy or handbook question, use answer_policy_question\n"
                f"- For approval/rejection, always confirm the action after doing it\n"
                f"- For auto-processing, summarise what was done and how many leaves were affected\n"
                f"- Be direct and professional\n"
                f"- Today is {today}"
            )
        },
        {"role": "user", "content": message}
    ]

    for _ in range(8):  # max 8 iterations
        response         = mistral_client.chat.complete(
            model="mistral-small-latest",
            messages=messages,
            tools=HR_TOOLS,
            tool_choice="auto"
        )
        assistant_message = response.choices[0].message

        if assistant_message.tool_calls:
            messages.append({
                "role":    "assistant",
                "content": assistant_message.content or "",
                "tool_calls": [
                    {
                        "id":       tc.id,
                        "type":     "function",
                        "function": {
                            "name":      tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            for tool_call in assistant_message.tool_calls:
                tool_name   = tool_call.function.name
                tool_args   = json.loads(tool_call.function.arguments)
                print(f"[HR Agent] Calling tool: {tool_name} with args: {tool_args}")

                tool_result = (TOOL_FUNCTIONS[tool_name](**tool_args)
                               if tool_name in TOOL_FUNCTIONS
                               else f"Unknown tool: {tool_name}")

                messages.append({
                    "role":         "tool",
                    "tool_call_id": tool_call.id,
                    "name":         tool_name,
                    "content":      tool_result
                })
        else:
            return assistant_message.content

    return "Agent reached maximum iterations. Please try a simpler request."


# ── FastAPI endpoint ───────────────────────────────────────────────────────

class HRAgentRequest(BaseModel):
    message: str
    hr_id: str = ""

@app.post("/api/hr-agent")
async def hr_agent_endpoint(request: HRAgentRequest):
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        result = run_hr_agent(request.message)
        return {"response": result}
    except Exception as e:
        print(f"HR Agent endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail="HR Agent processing failed")







if __name__ == "__main__":
    import uvicorn
    # Changed host back to localhost standard or 0.0.0.0 depending on access needs
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)