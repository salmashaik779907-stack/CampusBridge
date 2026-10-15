
import csv
import requests

csv_file = (
    r"C:\Users\shaik\OneDrive\Documents"
    r"\CampusBridge-AI\ai_test_results_corrected.csv"
)

api_url = "http://127.0.0.1:8000/predict"

total = 0
passed = 0
failed = 0

with open(csv_file, "r", encoding="utf-8-sig", newline="") as file:
    tests = csv.DictReader(file)

    print("\nCAMPUSBRIDGE AI - FULL API TEST")
    print("-" * 40)

    for test in tests:
        total += 1
        complaint = test["Complaint"]

        expected = {
            "category": test["Expected_Category"],
            "department": test["Expected_Department"],
            "priority": test["Expected_Priority"],
        }

        try:
            response = requests.post(
                api_url,
                json={"complaint": complaint},
                timeout=10,
            )
            response.raise_for_status()
            actual = response.json()

            errors = [
                field
                for field, expected_value in expected.items()
                if str(actual.get(field, "")).strip().casefold()
                != expected_value.strip().casefold()
            ]

            if errors:
                failed += 1
                print(f"Test {total}: FAIL")
                print("  Complaint:", complaint)
                for field in errors:
                    print(
                        f"  {field}: expected "
                        f"{expected[field]}, got {actual.get(field)}"
                    )
            else:
                passed += 1
                print(f"Test {total}: PASS - {complaint}")

        except Exception as error:
            failed += 1
            print(f"Test {total}: ERROR - {complaint}")
            print(" ", error)

print("\n" + "=" * 40)
print(f"Total tests: {total}")
print(f"Passed: {passed}")
print(f"Failed or errors: {failed}")

if total:
    print(f"Overall API pass rate: {passed / total * 100:.2f}%")