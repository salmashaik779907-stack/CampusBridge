import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load dataset
df = pd.read_csv(r"ai\data\complaints.csv")

X = df["complaint"]
y = df["priority"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# TF-IDF + Logistic Regression
model = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("classifier", LogisticRegression(max_iter=1000))
])

# Train
model.fit(X_train, y_train)

# Test
predictions = model.predict(X_test)

print("Priority Model Results")
print("----------------------")
print("Accuracy:", accuracy_score(y_test, predictions))
print()
print(classification_report(y_test, predictions, zero_division=0))

# Save model
joblib.dump(model, r"ai\models\priority_model.pkl")

print("Model saved successfully.")