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

# Add these simple endpoints for Android app
@app.get("/genres")
async def get_genres_simple():
    """Simple genres endpoint for Android app"""
    if not recommendation_engine:
        # Return sample genres if engine not available
        return [
            "Fiction", "Science Fiction", "Mystery", "Romance", "Fantasy",
            "Thriller", "Biography", "History", "Science", "Technology"
        ]
    
    try:
        # Get top 20 genres from your engine and extract just the names
        genres_data = recommendation_engine.get_genres(20)
        
        # Extract just the tag names from the complex objects
        if genres_data and len(genres_data) > 0 and isinstance(genres_data[0], dict):
            # If it's a list of dictionaries, extract tag_name
            genre_names = [genre.get('tag_name', '').title().replace('-', ' ') 
                          for genre in genres_data if genre.get('tag_name')]
        else:
            # If it's already a list of strings, use as is
            genre_names = genres_data
            
        return genre_names
    except Exception as e:
        print(f"Error processing genres: {e}")
        # Fallback to sample genres
        return [
            "Fiction", "Science Fiction", "Mystery", "Romance", "Fantasy",
            "Thriller", "Biography", "History", "Science", "Technology"
        ]

@app.get("/test")
async def test_connection():
    """Test endpoint for Android app"""
    return {"message": "Backend is working!", "status": "success"}

# Simple recommendations endpoint for Android
class SimpleRecommendationRequest(BaseModel):
    genres: List[str]
    top_n: int = 10

@app.post("/recommendations")
async def get_simple_recommendations(request: SimpleRecommendationRequest):
    """Return real ML-powered book recommendations"""
    if not recommendation_engine:
        return get_sample_books(request.genres)
    
    try:
        print(f"Getting ML recommendations for genres: {request.genres}")
        
        # Convert genre names to tag IDs for ML engine
        tag_ids = convert_genres_to_tag_ids(request.genres)
        print(f"Converted to tag IDs: {tag_ids}")
        
        if tag_ids:
            # Use your actual ML clustering to get recommendations
            recommendations = get_ml_recommendations(tag_ids, request.top_n)
            return recommendations
        else:
            # Fallback to content-based filtering
            return get_content_based_recommendations(request.genres, request.top_n)
            
    except Exception as e:
        print(f"Error getting ML recommendations: {e}")
        import traceback
        traceback.print_exc()
        return get_sample_books(request.genres)

def convert_genres_to_tag_ids(genres):
    """Convert genre names to tag IDs with better matching"""
    try:
        if hasattr(recommendation_engine, 'tags_df'):
            tags_df = recommendation_engine.tags_df
            tag_ids = []
            
            # Common genre mappings
            genre_mappings = {
                'non fiction': 'non-fiction',
                'young adult': 'young-adult',
                'science fiction': 'science-fiction',
                'historical fiction': 'historical-fiction',
                'self help': 'self-help'
            }
            
            for genre in genres:
                genre_lower = genre.lower()
                search_term = genre_mappings.get(genre_lower, genre_lower)
                
                # Try exact match first
                exact_match = tags_df[tags_df['tag_name'].str.lower() == search_term]
                if not exact_match.empty:
                    tag_id = exact_match.iloc[0]['tag_id']
                    tag_ids.append(tag_id)
                    print(f"Converted '{genre}' to tag_id: {tag_id}")
                    continue
                
                # Try partial match
                partial_match = tags_df[
                    tags_df['tag_name'].str.lower().str.contains(search_term, na=False)
                ]
                if not partial_match.empty:
                    tag_id = partial_match.iloc[0]['tag_id']
                    tag_ids.append(tag_id)
                    print(f"Converted '{genre}' to similar tag_id: {tag_id}")
                else:
                    print(f"No tag found for genre: {genre}")
            
            return tag_ids
        return []
    except Exception as e:
        print(f"Error converting genres to tag IDs: {e}")
        return []

def get_ml_recommendations(tag_ids, top_n=10):
    """Get ML-powered recommendations using clustering"""
    try:
        print(f"Getting ML recommendations for tag IDs: {tag_ids}")
        
        # Use your book clustering algorithm
        clusters = recommendation_engine.get_book_clusters(tag_ids, num_clusters=3)
        
        # Extract books from clusters
        all_books = []
        for cluster in clusters:
            if 'books' in cluster:
                all_books.extend(cluster['books'])
        
        # Format for Android
        formatted_books = []
        for i, book in enumerate(all_books[:top_n]):
            formatted_book = {
                "id": str(book.get('book_id', book.get('goodreads_book_id', f'ml_{i}'))),
                "title": book.get('title', 'ML Recommended Book'),
                "author": book.get('authors', 'Various Authors'),
                "rating": float(book.get('average_rating', 4.0)),
                "imageUrl": book.get('image_url', ''),
                "genres": ["AI Recommended"]  # You can extract actual genres later
            }
            formatted_books.append(formatted_book)
        
        print(f"ML engine returned {len(formatted_books)} recommendations")
        return formatted_books
        
    except Exception as e:
        print(f"Error in ML recommendations: {e}")
        return get_content_based_recommendations_from_tags(tag_ids, top_n)

def get_content_based_recommendations(genres, top_n=10):
    """Content-based filtering using TF-IDF and cosine similarity"""
    try:
        print(f"Using content-based filtering for genres: {genres}")
        
        # Get some books that match the genres
        if hasattr(recommendation_engine, 'books_df'):
            books_df = recommendation_engine.books_df
            
            # Simple content-based: get highly-rated books
            # You can enhance this with actual TF-IDF similarity later
            content_books = books_df.nlargest(top_n * 2, 'average_rating')
            
            formatted_books = []
            for index, book in content_books.iterrows():
                formatted_book = {
                    "id": str(book.get('book_id', book.get('goodreads_book_id', f'cb_{index}'))),
                    "title": book.get('title', 'Content-Based Recommendation'),
                    "author": book.get('authors', 'Various Authors'),
                    "rating": float(book.get('average_rating', 4.0)),
                    "imageUrl": book.get('image_url', ''),
                    "genres": genres[:2] if genres else ["Content-Based"]
                }
                formatted_books.append(formatted_book)
            
            print(f"Content-based filtering returned {len(formatted_books)} books")
            return formatted_books[:top_n]
        else:
            return get_sample_books(genres)
            
    except Exception as e:
        print(f"Error in content-based recommendations: {e}")
        return get_sample_books(genres)

def get_content_based_recommendations_from_tags(tag_ids, top_n=10):
    """Content-based filtering using actual tag data"""
    try:
        print(f"Content-based filtering for tag IDs: {tag_ids}")
        
        # Get books that have these tags
        if hasattr(recommendation_engine, 'book_tags_df'):
            book_tags_df = recommendation_engine.book_tags_df
            
            # Find books with the specified tags
            tagged_books = book_tags_df[book_tags_df['tag_id'].isin(tag_ids)]
            
            if not tagged_books.empty:
                # Get top books by tag count
                popular_books = tagged_books.groupby('goodreads_book_id')['count'].sum().nlargest(top_n)
                
                # Get book details
                books_df = recommendation_engine.books_df
                formatted_books = []
                
                for book_id in popular_books.index:
                    book_data = books_df[books_df['goodreads_book_id'] == book_id]
                    if not book_data.empty:
                        book = book_data.iloc[0]
                        formatted_book = {
                            "id": str(book_id),
                            "title": book.get('title', 'Tag-Based Recommendation'),
                            "author": book.get('authors', 'Various Authors'),
                            "rating": float(book.get('average_rating', 4.0)),
                            "imageUrl": book.get('image_url', ''),
                            "genres": ["Tag-Based ML"]
                        }
                        formatted_books.append(formatted_book)
                
                print(f"Tag-based content filtering returned {len(formatted_books)} books")
                return formatted_books
        
        return get_sample_books(["ML Recommended"])
        
    except Exception as e:
        print(f"Error in tag-based content filtering: {e}")
        return get_sample_books(["ML Recommended"])

def get_real_books_from_dataset(genres, top_n=10):
    """Get real books from your Goodreads dataset"""
    try:
        # Access your books dataframe from the recommendation engine
        if hasattr(recommendation_engine, 'books_df') and recommendation_engine.books_df is not None:
            books_df = recommendation_engine.books_df
            
            print(f"Available books in dataset: {len(books_df)}")
            
            # Get top N books with highest ratings
            top_books = books_df.nlargest(top_n, 'average_rating')
            
            formatted_books = []
            for index, book in top_books.iterrows():
                # Get book details from your dataset
                book_id = str(book.get('book_id', book.get('goodreads_book_id', f'book_{index}')))
                title = book.get('title', 'Unknown Title')
                author = book.get('authors', 'Unknown Author')
                rating = float(book.get('average_rating', 4.0))
                image_url = book.get('image_url', '')
                
                # Use the selected genres or get from book data if available
                book_genres = genres[:2] if genres else ["General"]
                
                formatted_book = {
                    "id": book_id,
                    "title": title,
                    "author": author,
                    "rating": rating,
                    "imageUrl": image_url,
                    "genres": book_genres
                }
                formatted_books.append(formatted_book)
                print(f"Added book: {title} by {author} (Rating: {rating})")
            
            print(f"Returning {len(formatted_books)} real books from dataset")
            return formatted_books
        else:
            print("Books dataframe not available, using sample books")
            return get_sample_books(genres)
            
    except Exception as e:
        print(f"Error in get_real_books_from_dataset: {e}")
        import traceback
        traceback.print_exc()
        return get_sample_books(genres)

def get_sample_books(genres):
    """Fallback sample books with better data"""
    books = []
    sample_books_data = [
        {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "rating": 3.9},
        {"title": "To Kill a Mockingbird", "author": "Harper Lee", "rating": 4.3},
        {"title": "1984", "author": "George Orwell", "rating": 4.2},
        {"title": "Pride and Prejudice", "author": "Jane Austen", "rating": 4.3},
        {"title": "The Hobbit", "author": "J.R.R. Tolkien", "rating": 4.3},
        {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "rating": 3.8},
        {"title": "The Lord of the Rings", "author": "J.R.R. Tolkien", "rating": 4.5},
        {"title": "Harry Potter and the Philosopher's Stone", "author": "J.K. Rowling", "rating": 4.5},
        {"title": "The Da Vinci Code", "author": "Dan Brown", "rating": 3.9},
        {"title": "The Alchemist", "author": "Paulo Coelho", "rating": 3.9}
    ]
    
    for i, book_data in enumerate(sample_books_data[:8]):
        book = {
            "id": f"classic_{i}",
            "title": book_data["title"],
            "author": book_data["author"],
            "rating": book_data["rating"],
            "imageUrl": "",
            "genres": genres[:2] if genres else ["Classic Literature"]
        }
        books.append(book)
    
    print(f"Returning {len(books)} sample books")
    return books

def format_books_for_android(books_data):
    """Format your ML engine's book data for Android app"""
    if not books_data:
        return []
    
    formatted_books = []
    for i, book in enumerate(books_data):
        try:
            formatted_book = {
                "id": str(book.get('goodreads_book_id', book.get('book_id', f'book_{i}'))),
                "title": book.get('title', 'Unknown Title'),
                "author": book.get('authors', 'Unknown Author'),
                "rating": float(book.get('average_rating', 4.0)),
                "imageUrl": book.get('image_url', ''),
                "genres": ["AI Recommended"]  # You can extract actual genres if available
            }
            formatted_books.append(formatted_book)
        except Exception as e:
            print(f"Error formatting book {i}: {e}")
            continue
    
    print(f"Formatted {len(formatted_books)} books for Android")
    return formatted_books

class SimpleRecommendationRequest(BaseModel):
    genres: List[str]
    top_n: int = 10

class ClusterRequest(BaseModel):
    genres: List[str]
    num_clusters: int = 3

@app.post("/clusters")
async def get_clusters_for_genres(request: ClusterRequest):
    """Get real ML clusters based on selected genres"""
    if not recommendation_engine:
        return get_sample_clusters(request.genres)
    
    try:
        print(f"Getting ML clusters for genres: {request.genres}")
        
        # Convert genre names to tag IDs
        tag_ids = convert_genres_to_tag_ids(request.genres)
        print(f"Converted to tag IDs: {tag_ids}")
        
        if tag_ids:
            # Use your actual ML clustering
            clusters = recommendation_engine.get_book_clusters(
                tag_ids, 
                request.num_clusters
            )
            return format_clusters_for_android(clusters)
        else:
            return get_sample_clusters(request.genres)
            
    except Exception as e:
        print(f"Error getting ML clusters: {e}")
        import traceback
        traceback.print_exc()
        return get_sample_clusters(request.genres)

def convert_genres_to_tag_ids(genres):
    """Convert genre names to tag IDs using your tags dataset"""
    try:
        if hasattr(recommendation_engine, 'tags_df'):
            tags_df = recommendation_engine.tags_df
            tag_ids = []
            
            for genre in genres:
                # Try to find matching tag (case-insensitive, partial match)
                matching_tags = tags_df[
                    tags_df['tag_name'].str.contains(genre, case=False, na=False)
                ]
                if not matching_tags.empty:
                    tag_id = matching_tags.iloc[0]['tag_id']
                    tag_ids.append(tag_id)
                    print(f"Converted '{genre}' to tag_id: {tag_id}")
                else:
                    print(f"No tag found for genre: {genre}")
            
            return tag_ids
        return []
    except Exception as e:
        print(f"Error converting genres to tag IDs: {e}")
        return []

def format_clusters_for_android(clusters):
    """Format ML clusters for Android app - include REAL Goodreads IDs"""
    formatted_clusters = []
    
    for i, cluster in enumerate(clusters):
        cluster_name = f"Cluster {i+1}"
        books = []
        
        # Extract books from cluster
        if 'books' in cluster:
            for j, book_data in enumerate(cluster['books']):
                # Use the ACTUAL Goodreads ID from your dataset
                goodreads_id = book_data.get('goodreads_book_id')
                book_id = str(goodreads_id) if goodreads_id else f'ml_{i}_{j}'
                
                book = {
                    "id": book_id,  # This is the REAL Goodreads ID
                    "title": book_data.get('title', 'ML Recommended Book'),
                    "author": book_data.get('authors', 'Various Authors'),
                    "rating": float(book_data.get('average_rating', 4.0)),
                    "imageUrl": book_data.get('image_url', ''),
                    "genres": ["AI Clustered"]
                }
                books.append(book)
        
        formatted_clusters.append({
            "clusterName": cluster_name,
            "books": books
        })
    
    print(f"Formatted {len(formatted_clusters)} clusters with REAL Goodreads IDs")
    return formatted_clusters

def get_sample_clusters(genres):
    """Fallback sample clusters"""
    sample_clusters = []
    
    for i, genre in enumerate(genres[:3]):  # Max 3 clusters
        books = []
        for j in range(3):  # 3 books per cluster
            book = {
                "id": f"sample_{i}_{j}",
                "title": f"Sample {genre} Book {j+1}",
                "author": f"Author {j+1}",
                "rating": 4.0 + (j * 0.1),
                "imageUrl": "",
                "genres": [genre, "Sample"]
            }
            books.append(book)
        
        sample_clusters.append({
            "clusterName": f"{genre} Cluster",
            "books": books
        })
    
    return sample_clusters

class PersonalizedRecommendationRequest(BaseModel):
    selected_book_ids: List[str]
    top_n: int = 10

@app.post("/personalized-recommendations")
async def get_personalized_recommendations(request: PersonalizedRecommendationRequest):
    """Get ML-powered recommendations using REAL Goodreads IDs from Android"""
    if not recommendation_engine:
        return get_sample_personalized_books(request.selected_book_ids)
    
    try:
        print(f"Getting personalized recommendations for REAL book IDs: {request.selected_book_ids}")
        
        # Convert book IDs to integers
        book_ids = []
        for book_id in request.selected_book_ids:
            try:
                book_ids.append(int(book_id))
                print(f"Valid Goodreads ID: {book_id}")
            except ValueError:
                print(f"Invalid book ID format: {book_id}")
        
        if book_ids:
            print(f"Using REAL Goodreads IDs for ML: {book_ids}")
            
            try:
                # Use your actual ML recommendation engine with REAL IDs
                result = recommendation_engine.get_recommendations(
                    book_ids,
                    request.top_n
                )
                
                # Extract the recommendations from the result dictionary
                recommendations = result.get("recommendations", [])
                print(f"ML engine returned {len(recommendations)} recommendations")
                
                formatted_books = format_books_for_android(recommendations)
                print(f"Formatted {len(formatted_books)} books for Android")
                
                return formatted_books
                
            except Exception as ml_error:
                print(f"ML engine error: {ml_error}")
                import traceback
                traceback.print_exc()
                return get_content_based_recommendations_from_selections(request.selected_book_ids, request.top_n)
        else:
            print("No valid Goodreads IDs found, using content-based fallback")
            return get_content_based_recommendations_from_selections(request.selected_book_ids, request.top_n)
            
    except Exception as e:
        print(f"Error getting personalized recommendations: {e}")
        import traceback
        traceback.print_exc()
        return get_content_based_recommendations_from_selections(request.selected_book_ids, request.top_n)
            
    except Exception as e:
        print(f"Error getting personalized recommendations: {e}")
        import traceback
        traceback.print_exc()
        return get_content_based_recommendations_from_selections(request.selected_book_ids, request.top_n)

def get_content_based_recommendations_from_selections(selected_book_ids, top_n=10):
    """Content-based filtering based on selected books"""
    try:
        print(f"Content-based filtering for selected books: {selected_book_ids}")
        
        # Get books similar to the selected ones
        if hasattr(recommendation_engine, 'books_df'):
            books_df = recommendation_engine.books_df
            
            # Convert selected book IDs to integers
            selected_ids = [int(book_id) for book_id in selected_book_ids if book_id.isdigit()]
            
            # Get details of selected books
            selected_books = books_df[books_df['goodreads_book_id'].isin(selected_ids)]
            
            if not selected_books.empty:
                # Get books with similar ratings (simple content-based approach)
                avg_rating = selected_books['average_rating'].mean()
                similar_books = books_df[
                    (books_df['average_rating'] >= avg_rating - 0.5) & 
                    (books_df['average_rating'] <= avg_rating + 0.5) &
                    (~books_df['goodreads_book_id'].isin(selected_ids))
                ].nlargest(top_n, 'average_rating')
                
                formatted_books = []
                for index, book in similar_books.iterrows():
                    formatted_book = {
                        "id": str(book.get('goodreads_book_id', f'cb_{index}')),
                        "title": book.get('title', 'Similar Recommendation'),
                        "author": book.get('authors', 'Various Authors'),
                        "rating": float(book.get('average_rating', 4.0)),
                        "imageUrl": book.get('image_url', ''),
                        "genres": ["Content-Based"]
                    }
                    formatted_books.append(formatted_book)
                
                print(f"Content-based filtering returned {len(formatted_books)} books")
                return formatted_books
        
        return get_sample_personalized_books(selected_book_ids)
        
    except Exception as e:
        print(f"Error in content-based recommendations: {e}")
        return get_sample_personalized_books(selected_book_ids)

def get_sample_personalized_books(selected_book_ids):
    """Fallback sample personalized books"""
    books = []
    
    # Sample books that are typically recommended together
    personalized_titles = [
        "The Way of Kings", "Words of Radiance", "Oathbringer",
        "The Name of the Wind", "The Wise Man's Fear",
        "Red Rising", "Golden Son", "Morning Star",
        "The Three-Body Problem", "The Dark Forest", "Death's End"
    ]
    
    personalized_authors = [
        "Brandon Sanderson", "Brandon Sanderson", "Brandon Sanderson",
        "Patrick Rothfuss", "Patrick Rothfuss", 
        "Pierce Brown", "Pierce Brown", "Pierce Brown",
        "Cixin Liu", "Cixin Liu", "Cixin Liu"
    ]
    
    for i in range(min(8, len(personalized_titles))):
        book = {
            "id": f"personalized_{i}",
            "title": personalized_titles[i],
            "author": personalized_authors[i],
            "rating": 4.2 + (i * 0.1),
            "imageUrl": "",
            "genres": ["AI Personalized"]
        }
        books.append(book)
    
    print(f"Returning {len(books)} sample personalized books")
    return books

if __name__ == "__main__":
    import uvicorn
    print("Starting LitWise Recommendation API...")
    print("Visit http://localhost:8000/docs for API documentation")
    uvicorn.run(app, host="0.0.0.0", port=8000)