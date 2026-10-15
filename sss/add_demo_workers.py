import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        credentials.ApplicationDefault(),
        {"projectId": "campusbridge-69bde"}
    )

db = firestore.client()

workers = [
    ("Demo IT Worker 2", "demo.it2@campusbridge.test", "IT Support"),
    ("Demo IT Worker 3", "demo.it3@campusbridge.test", "IT Support"),
    ("Demo Electrical Worker 2", "demo.electrical2@campusbridge.test", "Electrical"),
    ("Demo Electrical Worker 3", "demo.electrical3@campusbridge.test", "Electrical"),
    ("Demo Maintenance Worker 2", "demo.maintenance2@campusbridge.test", "Maintenance"),
    ("Demo Maintenance Worker 3", "demo.maintenance3@campusbridge.test", "Maintenance"),
    ("Demo Housekeeping Worker 2", "demo.housekeeping2@campusbridge.test", "Housekeeping"),
    ("Demo Housekeeping Worker 3", "demo.housekeeping3@campusbridge.test", "Housekeeping"),
    ("Demo Administration Worker 2", "demo.admin2@campusbridge.test", "Administration"),
    ("Demo Administration Worker 3", "demo.admin3@campusbridge.test", "Administration"),
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

print("Additional worker seeding finished.")
