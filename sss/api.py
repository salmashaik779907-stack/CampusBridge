from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from predict import predict_complaint


app = FastAPI(
    title="CampusBridge AI API",
    description="AI-powered campus complaint classification API",
    version="1.0.0"
)


# Allow the React/Vite Staff Frontend to communicate with the AI API
app.add_middleware(
    CORSMiddleware,
   
allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
     "http://localhost:5176"
    "https://campusbridge-staff-git-master-salmashaik779907-stack.vercel.app",
    "https://campusbridge-staff.vercel.app",
],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ComplaintRequest(BaseModel):
    complaint: str


@app.get("/")
def home():
    return {
        "message": "CampusBridge AI API is running",
        "status": "online"
    }


@app.post("/predict")
def predict(request: ComplaintRequest):
    complaint = request.complaint.strip()

    if not complaint:
        return {
            "error": "Complaint cannot be empty"
        }

    result = predict_complaint(complaint)

    return result
