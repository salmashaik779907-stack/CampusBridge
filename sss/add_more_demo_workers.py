import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        credentials.ApplicationDefault(),
        {"projectId": "campusbridge-69bde"}
    )

db = firestore.client()

workers = [
    ("Demo IT Worker 4", "demo.it4@campusbridge.test", "IT Support"),
    ("Demo IT Worker 5", "demo.it5@campusbridge.test", "IT Support"),
    ("Demo Electrical Worker 4", "demo.electrical4@campusbridge.test", "Electrical"),
    ("Demo Electrical Worker 5", "demo.electrical5@campusbridge.test", "Electrical"),
    ("Demo Maintenance Worker 4", "demo.maintenance4@campusbridge.test", "Maintenance"),
    ("Demo Maintenance Worker 5", "demo.maintenance5@campusbridge.test", "Maintenance"),
    ("Demo Housekeeping Worker 4", "demo.housekeeping4@campusbridge.test", "Housekeeping"),
    ("Demo Housekeeping Worker 5", "demo.housekeeping5@campusbridge.test", "Housekeeping"),
    ("Demo Administration Worker 4", "demo.admin4@campusbridge.test", "Administration"),
    ("Demo Administration Worker 5", "demo.admin5@campusbridge.test", "Administration"),
]

for name, email, department in workers:
    worker_id = email.split("@")[0].replace(".", "_")
    ref = db.collection("workers").document(worker_id)

    if ref.get().exists:
        print(f"Already exists; unchanged: {name}")
        continue

    ref.set({
        "name": name,
        "email": email,
        "department": department,
        "available": True,
        "activeTasks": 0,
        "isDemo": True,
    })
    print(f"Created: {name} ({department})")

print("Worker addition finished.")
print("Expected total: 25 demo workers, if the previous 20 records exist.")
