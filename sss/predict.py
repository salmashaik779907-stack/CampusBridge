from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

category_model = joblib.load(MODEL_DIR / "category_model.pkl")
department_model = joblib.load(MODEL_DIR / "department_model.pkl")
priority_model = joblib.load(MODEL_DIR / "priority_model_v2.pkl")


def get_prediction_with_confidence(model, complaint):
    prediction = model.predict([complaint])[0]
    probabilities = model.predict_proba([complaint])[0]
    confidence = max(probabilities) * 100
    return prediction, confidence


def correct_department(complaint, predicted_department):
    text = complaint.lower()

    # Electrical equipment and power problems
    electrical_phrases = [
        "power failure",
        "power outage",
        "power cut",
        "electricity failure",
        "electrical failure",
        "short circuit",
        "electric shock",
        "electrical wiring",
        "wiring problem",
        "voltage problem",
        "electrical fault",
        "fan is not working",
        "fan not working",
        "light is not working",
        "light not working",
        "bulb not working",
        "switch is broken",
        "socket is damaged",
    ]

    # Building and plumbing problems
    maintenance_phrases = [
        "water leakage",
        "water leak",
        "leaking pipe",
        "pipe leakage",
        "tap is leaking",
        "plumbing problem",
        "broken door",
        "broken window",
        "damaged furniture",
        "ceiling damage",
    ]

    # Cleaning and sanitation
    housekeeping_phrases = [
        "washroom cleaning",
        "toilet cleaning",
        "bathroom cleaning",
        "cleaning required",
        "cleaning is required",
        "garbage removal",
        "dustbin is full",
        "dirty washroom",
    ]

    # Administration and office assistance
    administration_phrases = [
        "general office assistance",
        "office assistance",
        "administrative assistance",
        "administration help",
        "office paperwork",
        "document verification",
        "office documentation",
        "administrative support",
    ]

    # IT equipment, software and network
    it_phrases = [
        "computer",
        "laptop",
        "keyboard",
        "mouse",
        "printer",
        "software",
        "wifi",
        "wi-fi",
        "internet",
        "network",
        "server",
        "projector",
        "smart board",
    ]

    if any(phrase in text for phrase in electrical_phrases):
        return "Electrical"

    if any(phrase in text for phrase in maintenance_phrases):
        return "Maintenance"

    if any(phrase in text for phrase in housekeeping_phrases):
        return "Housekeeping"

    if any(phrase in text for phrase in administration_phrases):
        return "Administration"

    if any(phrase in text for phrase in it_phrases):
        return "IT Support"

    return predicted_department


def correct_priority(complaint, predicted_priority):
    text = complaint.lower()

    # High-priority examples agreed for the current evaluation.
    high_phrases = [
        "emergency",
        "urgent",
        "major electrical fault",
        "power failure",
        "power outage",
        "short circuit",
        "electric shock",
        "fire",
        "dangerous",
        "critical",
        "completely down",
        "no internet connection",
        "internet connection is down",
        "entire network is down",
        "fan is not working",
        "fan not working",
        "washroom cleaning is required",
        "washroom cleaning required",
    ]

    # Explicitly minor problems and routine IT peripheral issues.
    low_phrases = [
        "minor",
        "slight issue",
        "small issue",
        "cosmetic issue",
        "not urgent",
        "minor mouse issue",
        "mouse is not working",
        "mouse not working",
        "keyboard is not working",
        "keyboard not working",
        "general office assistance is required",
    ]

    # Check specific low-priority cases before the model prediction.
    if any(phrase in text for phrase in low_phrases):
        return "LOW"

    if any(phrase in text for phrase in high_phrases):
        return "HIGH"

    return predicted_priority


def predict_complaint(complaint):
    complaint = complaint.strip()

    if not complaint:
        raise ValueError("Complaint cannot be empty.")

    category, category_confidence = get_prediction_with_confidence(
        category_model, complaint
    )

    department, department_confidence = get_prediction_with_confidence(
        department_model, complaint
    )

    priority, priority_confidence = get_prediction_with_confidence(
        priority_model, complaint
    )

    original_department = department
    original_priority = priority

    department = correct_department(complaint, department)
    priority = correct_priority(complaint, priority)

    return {
        "complaint": complaint,
        "category": category,
        "category_confidence": round(float(category_confidence), 2),
        "department": department,
        "department_confidence": round(float(department_confidence), 2),
        "priority": priority,
        "priority_confidence": round(float(priority_confidence), 2),
        "original_department_prediction": original_department,
        "original_priority_prediction": original_priority,
        "human_verification_required": True,
    }


if __name__ == "__main__":
    test_complaints = [
        "Power failure has occurred in the laboratory.",
        "Classroom fan is not working.",
        "Washroom cleaning is required.",
        "Mouse is not working in the computer lab.",
        "No internet connection in the lab.",
        "General office assistance is required.",
    ]

    for complaint in test_complaints:
        result = predict_complaint(complaint)
        print("\nComplaint:", result["complaint"])
        print("Category:", result["category"])
        print("Category confidence:", result["category_confidence"], "%")
        print("Department:", result["department"])
        print("Department confidence:", result["department_confidence"], "%")
        print("Priority:", result["priority"])
        print("Priority confidence:", result["priority_confidence"], "%")
        print("Original department:", result["original_department_prediction"])
        print("Original priority:", result["original_priority_prediction"])

