"""
MAP@K evaluator for content-based ranking.
Run:  python -m scripts.mapk
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from recommendation_engine import recommendation_engine

def apk(actual: list[int], predicted: list[int], k: int = 10) -> float:
    """Average Precision at K for a single user."""
    if not actual:
        return 0.0
    predicted = predicted[:k]
    score, num_hits = 0.0, 0
    for i, p in enumerate(predicted):
        if p in actual and p not in predicted[:i]:
            num_hits += 1
            score += num_hits / (i + 1)
    return score / min(len(actual), k)

def mapk(actual_lists: list[list[int]], predicted_lists: list[list[int]], k: int = 10) -> float:
    """Mean Average Precision at K across multiple users."""
    return np.mean([apk(a, p, k) for a, p in zip(actual_lists, predicted_lists)])

def quick_mapk_test(n_users: int = 20, k: int = 5):
    """
    Synthetic test: pretend each user 'likes' 3 random books
    and we evaluate how well the engine ranks the remaining
    books that share at least one tag with those seeds.
    """
    engine = recommendation_engine
    if not engine.data_loaded:
        engine.prepare_data()

    all_books = engine.books_df["goodreads_book_id"].tolist()
    actual_lists, predicted_lists = [], []

    rng = np.random.default_rng(42)
    for _ in range(n_users):
        # Ground-truth: 3 random books the user loves
        loved = rng.choice(all_books, size=3, replace=False).tolist()
        # Build user profile on first 2
        profile = engine.get_recommendations(loved[:2], top_n=50)["recommendations"]
        ranked = [b["goodreads_book_id"] for b in profile]
        # Truth for evaluation: the held-out 3rd book (if it appears in top-50)
        actual_lists.append(loved[2:])
        predicted_lists.append(ranked)

    score = mapk(actual_lists, predicted_lists, k=k)
    print(f"MAP@{k} over {n_users} synthetic users: {score:.3f}")
    return score

if __name__ == "__main__":
    quick_mapk_test()