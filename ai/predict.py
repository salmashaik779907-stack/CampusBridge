
from pathlib import Path
import joblib
import re


# =========================
# MODEL PATHS
# =========================

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"


# =========================
# LOAD MODELS
# =========================

category_model = joblib.load(
    MODEL_DIR / "category_model.pkl"
)

department_model = joblib.load(
    MODEL_DIR / "department_model.pkl"
)

priority_model = joblib.load(
    MODEL_DIR / "priority_model_v2.pkl"
)


# =========================
# TEXT NORMALIZATION
# =========================

def normalize_complaint(complaint):
    """Normalize complaint text for consistent keyword matching."""
    return re.sub(r"\s+", " ", complaint.lower()).strip()


def contains_any(text, keywords):
    """Check whether any keyword or phrase is present."""
    return any(word in text for word in keywords)


# =========================
# DEPARTMENT RULES
# =========================

def correct_department(complaint, predicted_department):

    text = normalize_complaint(complaint)

    electrical_words = [
        "sparking"
        "short circuit",
        "electrical",
        "wiring",
        "switch",
        "socket",
        "voltage",
        "electric shock",
        "sparking",
        "light",
        "bulb",
        "fan",
        "fire alarm"
    ]

    maintenance_words = [
        "water leakage",
        "water leak",
        "tap",
        "pipe",
        "plumbing",
        "leaking",
        "leakage",
        "furniture",
        "door",
        "window",
        "ceiling",
        "broken desk",
        "broken chair"
    ]

    it_words = [
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
        "system",
        "projector",
        "smart board",
        "server",
        "login",
        "password",
        "website"
    ]

    housekeeping_words = [
        "cleaning",
        "garbage",
        "dustbin",
        "dirty",
        "washroom cleaning",
        "toilet cleaning",
        "classroom is dirty",
        "classroom cleaning"
    ]

    # Safety-related electrical problems take precedence.
    if contains_any(text, electrical_words):
        return "Electrical"

    if contains_any(text, housekeeping_words):
        return "Housekeeping"

    if contains_any(text, maintenance_words):
        return "Maintenance"

    if contains_any(text, it_words):
        return "IT Support"

    # Keep the ML prediction if no rule matches.
    return predicted_department


# =========================
# PRIORITY RULES
# =========================

def correct_priority(complaint, predicted_priority):

    text = normalize_complaint(complaint)

    # HIGH: explicit danger or serious disruption.
    high_words = [
        "emergency",
        "urgent",
        "danger",
        "dangerous",
        "fire",
        "smoke",
        "short circuit",
        "electric shock",
        "sparking",
        "gas leak",
        "critical",
        "completely down",
        "exposed wire",
        "electrical burning smell"
    ]

    # LOW: explicitly minor and non-urgent problems.
    low_words = [
        "minor",
        "slight",
        "small issue",
        "not urgent",
        "cosmetic",
        "small scratch"
    ]

    # MEDIUM: routine problems that affect normal work.
    medium_words = [
        "projector",
        "computer",
        "printer",
        "wifi",
        "wi-fi",
        "internet",
        "smart board",
        "keyboard",
        "mouse",
        "classroom light",
        "fan not working"
    ]

    # Safety risks must be checked first.
    if contains_any(text, high_words):
        return "HIGH"

    if contains_any(text, low_words):
        return "LOW"

    if contains_any(text, medium_words):
        return "MEDIUM"

    # Use the trained model's result for other complaints.
    return predicted_priority


# =========================
# MAIN API FUNCTION
# =========================

def predict_complaint(complaint):

    if not isinstance(complaint, str) or not complaint.strip():
        raise ValueError("Complaint must not be empty.")

    complaint = complaint.strip()

    category, category_confidence = get_prediction_with_confidence(
        category_model,
        complaint
    )

    department, department_confidence = get_prediction_with_confidence(
        department_model,
        complaint
    )

    priority, priority_confidence = get_prediction_with_confidence(
        priority_model,
        complaint
    )

    original_department = department
    original_priority = priority

    department = correct_department(
        complaint,
        department
    )

    priority = correct_priority(
        complaint,
        priority
    )

    return {
        "complaint": complaint,

        "category": category,
        "category_confidence": round(
            float(category_confidence), 2
        ),

        "department": department,
        "department_confidence": round(
            float(department_confidence), 2
        ),

        "priority": priority,
        "priority_confidence": round(
            float(priority_confidence), 2
        ),

        "original_department_prediction": original_department,
        "original_priority_prediction": original_priority,

        "human_verification_required": True
    }


# =========================
# MODEL PREDICTION HELPER
# =========================

def get_prediction_with_confidence(model, complaint):

    prediction = model.predict([complaint])[0]
    probabilities = model.predict_proba([complaint])[0]

    confidence = max(probabilities) * 100

    return prediction, confidence


# =========================
# DIRECT TEST
# =========================

if __name__ == "__main__":

    test_complaints = [
        "Projector is not working in Room 204",
        "The classroom projector is sparking",
        "The classroom Wi-Fi is not working",
        "The classroom is dirty and needs cleaning",
        "There is water leakage from the ceiling",
        "There is a short circuit in the classroom"
    ]

    for complaint in test_complaints:

        result = predict_complaint(complaint)

        print("\n" + "=" * 45)
        print("CampusBridge AI Recommendation")
        print("=" * 45)
        print("Complaint:", result["complaint"])
        print("Category:", result["category"])
        print("Category Confidence:",
              result["category_confidence"], "%")
        print("Department:", result["department"])
        print("Department Confidence:",
              result["department_confidence"], "%")
        print("Priority:", result["priority"])
        print("Priority Confidence:",
              result["priority_confidence"], "%")
        print("Human Verification Required:",
              result["human_verification_required"])
