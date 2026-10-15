import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion, Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib


# Load dataset
df = pd.read_csv(r"ai\data\complaints.csv")

X = df["complaint"]
y = df["priority"]


# Same evaluation split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Word + character TF-IDF
features = FeatureUnion([
    (
        "word",
        TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),
    (
        "char",
        TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            sublinear_tf=True
        )
    )
])


# Balanced Logistic Regression
model = Pipeline([
    ("features", features),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced"
        )
    )
])


# Train
model.fit(X_train, y_train)


# Evaluate
predictions = model.predict(X_test)

print("=" * 60)
print("PRIORITY V2 RESULTS")
print("=" * 60)

print("Accuracy:", round(accuracy_score(y_test, predictions), 4))
print()

print(classification_report(
    y_test,
    predictions,
    zero_division=0
))


# Save ONLY as experimental model
joblib.dump(
    model,
    r"ai\models\priority_model_v2.pkl"
)

print("V2 model saved:")
print("ai\\models\\priority_model_v2.pkl")
print()
print("Original priority_model.pkl was NOT changed.")