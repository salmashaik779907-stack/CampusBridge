import firebase_admin
from firebase_admin import credentials, firestore

PROJECT_ID = "campusbridge-69bde"

if not firebase_admin._apps:
    firebase_admin.initialize_app(
        credentials.ApplicationDefault(),
        {"projectId": PROJECT_ID}
    )

db = firestore.client()

workers = [
    {
        "name": "Demo IT Worker 1",
        "email": "demo.it1@campusbridge.test",
        "department": "IT Support",
    },
    {
        "name": "Demo Electrical Worker 1",
        "email": "demo.electrical1@campusbridge.test",
        "department": "Electrical",
    },
    {
        "name": "Demo Maintenance Worker 1",
        "email": "demo.maintenance1@campusbridge.test",
        "department": "Maintenance",
    },
    {
        "name": "Demo Housekeeping Worker 1",
        "email": "demo.housekeeping1@campusbridge.test",
        "department": "Housekeeping",
    },
    {
        "name": "Demo Administration Worker 1",
        "email": "demo.admin1@campusbridge.test",
        "department": "Administration",
    },
]

for index, worker in enumerate(workers, start=1):
    worker_id = f"campusbridge_demo_worker_{index:02d}"
    ref = db.collection("workers").document(worker_id)

    if ref.get().exists:
        print(f"Already exists; left unchanged: {worker_id}")
        continue

    ref.set({
        **worker,
        "available": True,
        "activeTasks": 0,
        "isDemo": True,
    })
    print(f"Created: {worker['name']} ({worker['department']})")

print("Demo worker seeding finished.")
