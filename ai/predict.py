from pathlib import Path
import joblib


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
# ML PREDICTION
# =========================

def get_prediction_with_confidence(model, complaint):

    prediction = model.predict([complaint])[0]
    probabilities = model.predict_proba([complaint])[0]

    confidence = max(probabilities) * 100

    return prediction, confidence


# =========================
# DEPARTMENT RULES
# =========================

def correct_department(complaint, predicted_department):

    text = complaint.lower()

    electrical_words = [
        "short circuit",
        "electrical",
        "wiring",
        "switch",
        "socket",
        "voltage",
        "electric shock",
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
        "ceiling"
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
        "smart board"
    ]

    housekeeping_words = [
        "cleaning",
        "garbage",
        "dustbin",
        "dirty",
        "washroom cleaning",
        "toilet cleaning"
    ]

    if any(word in text for word in electrical_words):
        return "Electrical"

    if any(word in text for word in maintenance_words):
        return "Maintenance"

    if any(word in text for word in housekeeping_words):
        return "Housekeeping"

    if any(word in text for word in it_words):
        return "IT Support"

    return predicted_department


# =========================
# PRIORITY RULES
# =========================

def correct_priority(complaint, predicted_priority):

    text = complaint.lower()

    high_words = [
        "emergency",
        "urgent",
        "major",
        "danger",
        "dangerous",
        "fire",
        "short circuit",
        "electric shock",
        "completely down",
        "critical"
    ]

    low_words = [
        "minor",
        "slight",
        "small issue",
        "slowly",
        "not urgent",
        "cosmetic"
    ]

    if any(word in text for word in high_words):
        return "HIGH"

    if any(word in text for word in low_words):
        return "LOW"

    return predicted_priority


# =========================
# MAIN API FUNCTION
# =========================

def predict_complaint(complaint):

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
# DIRECT TEST
# =========================

if __name__ == "__main__":

    complaint = "Projector is not working in Room 204"

    result = predict_complaint(complaint)

    print("CampusBridge AI Recommendation")
    print("--------------------------------")
    print("Complaint:", result["complaint"])
    print()
    print("Category:", result["category"])
    print("Category Confidence:",
          result["category_confidence"], "%")
    print()
    print("Department:", result["department"])
    print("Department Confidence:",
          result["department_confidence"], "%")
    print()
    print("Priority:", result["priority"])
    print("Priority Confidence:",
          result["priority_confidence"], "%")
    print()
    print("Human Verification Required:",
          result["human_verification_required"])