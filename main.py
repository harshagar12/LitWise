"""
FastAPI server for LitWise recommendation engine
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
from scripts.evaluate_clusters import evaluate_clusters
from scripts.mapk import quick_mapk_test

# Add scripts directory to path
scripts_path = os.path.join(os.path.dirname(__file__), 'scripts')
if scripts_path not in sys.path:
    sys.path.insert(0, scripts_path)

try:
    from recommendation_engine import recommendation_engine
except ImportError as e:
    print(f"Warning: Could not import recommendation engine: {e}")
    recommendation_engine = None

app = FastAPI(title="LitWise Recommendation API", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class GenreRequest(BaseModel):
    top_n: int = 20

class ClusterRequest(BaseModel):
    selected_tag_ids: List[int]
    num_clusters: int = 3

class RecommendationRequest(BaseModel):
    favorite_goodreads_book_ids: List[int]
    top_n: int = 10

@app.get("/")
async def root():
    return {"message": "LitWise Recommendation API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine_loaded": recommendation_engine is not None,
        "data_loaded": recommendation_engine.data_loaded if recommendation_engine else False
    }

@app.post("/api/python/genres")
async def get_genres(request: GenreRequest):
    if not recommendation_engine:
        raise HTTPException(status_code=500, detail="Recommendation engine not available")
    
    try:
        genres = recommendation_engine.get_genres(request.top_n)
        return genres
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting genres: {str(e)}")

@app.post("/api/python/clusters")
async def get_clusters(request: ClusterRequest):
    if not recommendation_engine:
        raise HTTPException(status_code=500, detail="Recommendation engine not available")
    
    try:
        clusters = recommendation_engine.get_book_clusters(
            request.selected_tag_ids, 
            request.num_clusters
        )
        return clusters
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting clusters: {str(e)}")

@app.post("/api/python/recommendations")
async def get_recommendations(request: RecommendationRequest):
    if not recommendation_engine:
        raise HTTPException(status_code=500, detail="Recommendation engine not available")
    
    try:
        recommendations = recommendation_engine.get_recommendations(
            request.favorite_goodreads_book_ids,
            request.top_n
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@app.get("/api/diagnostics")
async def diagnostics():
    # ---- pick tags that actually have books ----
    popular = (
        recommendation_engine.book_tags_df
        .groupby("tag_id")["goodreads_book_id"].nunique()
        .sort_values(ascending=False).head(3).index.tolist()
    )
    # -------------------------------------------
    sil, dist = evaluate_clusters(popular, n_clusters=3)
    map5 = quick_mapk_test(n_users=50, k=5)
    return {
        "silhouette": round(sil, 3),
        "avg_centroid_dist": round(dist, 3),
        "MAP@5": round(map5, 3),
        "tags_used": list(map(int, popular)),  # JSON-safe
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting LitWise Recommendation API...")
    print("Visit http://localhost:8000/docs for API documentation")
    uvicorn.run(app, host="0.0.0.0", port=8000)
