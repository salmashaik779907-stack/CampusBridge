import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report


# Load dataset
df = pd.read_csv(r"ai\data\complaints.csv")

print("Dataset shape:", df.shape)

for target in ["category", "department", "priority"]:

    print("\n" + "=" * 60)
    print(target.upper(), "MODEL")
    print("=" * 60)

    X = df["complaint"]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("classifier", LogisticRegression(max_iter=1000))
    ])

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    print("Accuracy:", round(accuracy_score(y_test, predictions), 4))
    print()
    print(classification_report(
        y_test,
        predictions,
        zero_division=0
    ))

print("\nEvaluation completed.")
print("Existing .pkl models were NOT modified.")