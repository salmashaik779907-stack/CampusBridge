import pandas as pd

df = pd.read_csv(r"ai\data\complaints.csv")

extra = [
    ["Desktop computer not starting in Lab 2", "IT / Computer", "IT Support", "HIGH"],
    ["Keyboard is damaged in computer lab", "IT / Computer", "IT Support", "MEDIUM"],
    ["Mouse not working in Lab 3", "IT / Computer", "IT Support", "LOW"],
    ["Computer system is very slow", "IT / Computer", "IT Support", "MEDIUM"],
    ["Printer not working in office", "IT / Computer", "IT Support", "MEDIUM"],

    ["Wi-Fi not available in Room 105", "Internet / Wi-Fi", "IT Support", "HIGH"],
    ["Internet connection is slow", "Internet / Wi-Fi", "IT Support", "MEDIUM"],
    ["Wi-Fi disconnecting frequently", "Internet / Wi-Fi", "IT Support", "MEDIUM"],
    ["No internet connection in lab", "Internet / Wi-Fi", "IT Support", "HIGH"],
    ["Network password assistance required", "Internet / Wi-Fi", "IT Support", "LOW"],

    ["Broken bench in classroom", "Classroom", "Maintenance", "MEDIUM"],
    ["Classroom door is damaged", "Classroom", "Maintenance", "MEDIUM"],
    ["Board needs cleaning", "Classroom", "Housekeeping", "LOW"],
    ["Classroom fan is not working", "Classroom", "Electrical", "HIGH"],
    ["Chairs need repair in classroom", "Classroom", "Maintenance", "MEDIUM"],

    ["Power failure in laboratory", "Electrical", "Electrical", "HIGH"],
    ["Electrical switch is damaged", "Electrical", "Electrical", "HIGH"],
    ["Tube light is not working", "Electrical", "Electrical", "MEDIUM"],
    ["Fan is making unusual noise", "Electrical", "Electrical", "MEDIUM"],
    ["Power socket is not working", "Electrical", "Electrical", "HIGH"],

    ["Water tap is leaking", "Maintenance", "Maintenance", "MEDIUM"],
    ["Ceiling leakage reported", "Maintenance", "Maintenance", "HIGH"],
    ["Broken window needs repair", "Maintenance", "Maintenance", "MEDIUM"],
    ["Door handle is broken", "Maintenance", "Maintenance", "LOW"],
    ["Floor needs repair", "Maintenance", "Maintenance", "MEDIUM"],

    ["Projector display is not working", "Projector / Smart Board", "IT Support", "HIGH"],
    ["Smart board is not responding", "Projector / Smart Board", "IT Support", "HIGH"],
    ["Projector remote is missing", "Projector / Smart Board", "IT Support", "LOW"],
    ["Projector connection problem", "Projector / Smart Board", "IT Support", "MEDIUM"],
    ["Smart board needs technical support", "Projector / Smart Board", "IT Support", "MEDIUM"],

    ["Classroom needs cleaning", "Other", "Housekeeping", "MEDIUM"],
    ["Washroom cleaning required", "Other", "Housekeeping", "HIGH"],
    ["Corridor needs cleaning", "Other", "Housekeeping", "LOW"],
    ["Dustbins need to be emptied", "Other", "Housekeeping", "LOW"],
    ["General office assistance required", "Other", "Administration", "LOW"],
]

extra_df = pd.DataFrame(
    extra,
    columns=["complaint", "category", "department", "priority"]
)

final_df = pd.concat([df, extra_df], ignore_index=True)

final_df.to_csv(r"ai\data\complaints.csv", index=False)

print("Dataset expanded successfully.")
print("Total complaints:", len(final_df))

print("\nCategory counts:")
print(final_df["category"].value_counts())

print("\nDepartment counts:")
print(final_df["department"].value_counts())

print("\nPriority counts:")
print(final_df["priority"].value_counts())