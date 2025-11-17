"""
Quick cluster-evaluation script using sklearn built-ins.
Run:  python -m scripts.evaluate_clusters
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import pairwise_distances_argmin_min
from recommendation_engine import recommendation_engine

def evaluate_clusters(tag_ids: list[int], n_clusters: int = 3):
    """Return silhouette score + average distance to closest centroid."""
    clusters = recommendation_engine.get_book_clusters(tag_ids, n_clusters)

    # Re-build the TF-IDF matrix used internally (same subset)
    genre_tag_set = set(tag_ids)
    books_in_genre = recommendation_engine.book_tags_df[
        recommendation_engine.book_tags_df["tag_id"].isin(genre_tag_set)
    ]["goodreads_book_id"].unique()

    pivot_genre = recommendation_engine.pivot.loc[
        recommendation_engine.pivot.index.intersection(books_in_genre)
    ]
    from sklearn.feature_extraction.text import TfidfTransformer
    tfidf = TfidfTransformer()
    X = tfidf.fit_transform(pivot_genre)

    # Re-fit KMeans (same random_state as engine)
    from sklearn.cluster import KMeans
    km = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = km.fit_predict(X)

    sil = silhouette_score(X, labels, metric="cosine")
    closest, dist = pairwise_distances_argmin_min(X, km.cluster_centers_, metric="cosine")

    print(f"Silhouette (cosine): {sil:.3f}")
    print(f"Avg distance to closest centroid: {dist.mean():.3f}")
    return sil, dist.mean()

if __name__ == "__main__":
    # Example: evaluate clusters built from top-3 most popular tags
    from find_populr_tgs import find_popular_tags_with_books
    top = find_popular_tags_with_books(3)
    evaluate_clusters(top["tag_id"].tolist(), n_clusters=3)