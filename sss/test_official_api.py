
import csv
import requests
from datetime import datetime

API_URL = "http://127.0.0.1:8000/predict"

# Previously failing official cases and their expected results
tests = [
    {
        "id": 4,
        "complaint": "Power failure has occurred in the laboratory.",
        "category": "Electrical",
        "department": "Electrical",
        "priority": "HIGH",
    },
    {
        "id": 13,
        "complaint": "Classroom fan is not working.",
        "category": "Classroom",
        "department": "Electrical",
        "priority": "HIGH",
    },
    {
        "id": 14,
        "complaint": "Washroom cleaning is required.",
        "category": "Other",
        "department": "Housekeeping",
        "priority": "HIGH",
    },
    {
        "id": 15,
        "complaint": "Mouse is not working in the computer lab.",
        "category": "IT / Computer",
        "department": "IT Support",
        "priority": "LOW",
    },
    {
        "id": 16,
        "complaint": "No internet connection in the lab.",
        "category": "Internet / Wi-Fi",
        "department": "IT Support",
        "priority": "HIGH",
    },
    {
        "id": 20,
        "complaint": "General office assistance is required.",
        "category": "Other",
        "department": "Administration",
        "priority": "LOW",
    },
]

results = []

for test in tests:
    try:
        response = requests.post(
            API_URL,
            json={"complaint": test["complaint"]},
            timeout=15,
        )
        response.raise_for_status()
        actual = response.json()

        category_ok = (
            actual.get("category") == test["category"]
        )
        department_ok = (
            actual.get("department") == test["department"]
        )
        priority_ok = (
            actual.get("priority") == test["priority"]
        )

        passed = category_ok and department_ok and priority_ok

        results.append({
            "test_id": test["id"],
            "complaint": test["complaint"],
            "expected_category": test["category"],
            "actual_category": actual.get("category", ""),
            "category_pass": category_ok,
            "expected_department": test["department"],
            "actual_department": actual.get("department", ""),
            "department_pass": department_ok,
            "expected_priority": test["priority"],
            "actual_priority": actual.get("priority", ""),
            "priority_pass": priority_ok,
            "result": "PASS" if passed else "FAIL",
            "error": "",
        })

    except Exception as error:
        results.append({
            "test_id": test["id"],
            "complaint": test["complaint"],
            "expected_category": test["category"],
            "actual_category": "",
            "category_pass": False,
            "expected_department": test["department"],
            "actual_department": "",
            "department_pass": False,
            "expected_priority": test["priority"],
            "actual_priority": "",
            "priority_pass": False,
            "result": "ERROR",
            "error": str(error),
        })

filename = "api_test_results.csv"

with open(filename, "w", newline="", encoding="utf-8") as file:
    writer = csv.DictWriter(file, fieldnames=results[0].keys())
    writer.writeheader()
    writer.writerows(results)

passed = sum(row["result"] == "PASS" for row in results)
failed = sum(row["result"] == "FAIL" for row in results)
errors = sum(row["result"] == "ERROR" for row in results)

print("\nCAMPUSBRIDGE AI API TEST RESULTS")
print("--------------------------------")
print(f"Tests run: {len(results)}")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
print(f"Errors: {errors}")

for row in results:
    print(f"Test {row['test_id']}: {row['result']} - {row['complaint']}")

print(f"\nDetailed results saved to: {filename}")