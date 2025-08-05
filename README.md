# 📚 LitWise - AI-Powered Book Recommendation System

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.68+-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.1+-orange?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A sophisticated book recommendation application that leverages machine learning to provide personalized book suggestions based on user preferences and reading history. Built with Next.js, React, Python, and FastAPI.

## ✨ Features

- 🎯 **Genre-Based Discovery**: Select your favorite genres to discover curated book collections
- 🧠 **ML-Powered Clustering**: Books are intelligently grouped using K-Means clustering
- 🎨 **Personalized Recommendations**: Content-based filtering using TF-IDF and cosine similarity
- 📊 **Real Dataset Support**: Works with actual Goodreads dataset files
- 📱 **Responsive Design**: Beautiful, mobile-friendly interface with dark/light mode
- 🔄 **Fallback System**: Gracefully handles missing data with sample datasets
- ⚡ **Fast Performance**: Optimized with model caching and efficient data processing

## 🏗️ Architecture

```
LitWise/
├── 📁 app/                    # Next.js frontend application
│   ├── 📁 api/               # API routes
│   ├── 📁 clusters/          # Book clustering pages
│   ├── 📁 recommendations/   # Recommendation pages
│   └── 📄 page.tsx           # Main landing page
├── 📁 scripts/               # Python ML engine
│   ├── 📄 recommendation_engine.py    # Core ML algorithms
│   ├── 📄 setup_environment.py        # Environment setup
│   ├── 📄 setup_data_directory.py     # Data validation
│   └── 📄 data_statistics.py          # Dataset analysis
├── 📁 data/                  # Dataset storage
├── 📄 main.py                # FastAPI server
└── 📄 package.json           # Node.js dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **pnpm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/litwise.git
   cd litwise
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install

   # Install Python dependencies
   npm run setup-python
   ```

3. **Set up data directory**
   ```bash
   npm run setup-data
   ```

4. **Add your dataset** (optional)
   
   Place your CSV files in the `data/` directory:
   ```
   data/
   ├── books.csv          # Book information
   ├── tags.csv           # Genre/tag information  
   ├── book_tags.csv      # Book-tag relationships
   ├── ratings.csv        # User ratings (optional)
   └── to_read.csv        # User reading lists (optional)
   ```

5. **Start the application**
   ```bash
   # Start the development server
   npm run dev
   ```

6. **Start the Python backend** (in a separate terminal)
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```

7. **Visit the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Dataset Structure

### Required Files

| File | Description | Columns |
|------|-------------|---------|
| `books.csv` | Book information | `book_id`, `goodreads_book_id`, `title`, `authors`, `average_rating`, `ratings_count`, `image_url` |
| `tags.csv` | Genre/tag information | `tag_id`, `tag_name` |
| `book_tags.csv` | Book-tag relationships | `goodreads_book_id`, `tag_id`, `count` |

### Optional Files

| File | Description | Columns |
|------|-------------|---------|
| `ratings.csv` | User ratings | `user_id`, `book_id`, `rating` |
| `to_read.csv` | User reading lists | `user_id`, `book_id` |

## 🧠 Machine Learning Pipeline

### 1. Data Preprocessing
- Loads and cleans CSV data
- Creates book-tag feature matrix
- Handles missing values and invalid entries

### 2. Feature Engineering
- **TF-IDF Transformation**: Converts raw tag counts to normalized feature vectors
- **Pivot Table Creation**: Books × Tags matrix for efficient computation

### 3. Clustering Algorithm
- **K-Means Clustering**: Groups similar books based on tag features
- **Caching System**: Stores clustering models for performance
- **Dynamic Clusters**: Adjusts cluster count based on available data

### 4. Recommendation Engine
- **Content-Based Filtering**: Uses cosine similarity between book features
- **User Profile Creation**: Averages feature vectors of user's favorite books
- **Similarity Ranking**: Ranks all books by similarity to user profile

## 🎯 Usage Flow

1. **Landing Page**: Welcome screen with theme toggle
2. **Genre Selection**: Choose preferred genres from ML-generated list
3. **Cluster Discovery**: Browse intelligently grouped books
4. **Book Selection**: Select books that interest you
5. **Personalized Recommendations**: Get AI-powered suggestions

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run setup-python` | Install Python dependencies |
| `npm run setup-data` | Validate and setup data directory |
| `npm run analyze-data` | View dataset statistics |
| `npm run test-python` | Test the recommendation engine |

## 🔧 Technical Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **NumPy** - Numerical computations

### Machine Learning
- **K-Means Clustering** - Book grouping algorithm
- **TF-IDF Vectorization** - Text feature extraction
- **Cosine Similarity** - Recommendation scoring
- **Content-Based Filtering** - Recommendation strategy

## 📈 Performance Features

- **Model Caching**: Stores trained clustering models
- **Lazy Loading**: Loads data only when needed
- **Efficient Indexing**: Fast book lookups using index maps
- **Sparse Matrix Handling**: Optimized for high-dimensional sparse data
- **Fallback System**: Graceful degradation when ML engine unavailable

## 🚨 Troubleshooting

### Python Engine Not Working?
```bash
# Ensure Python dependencies are installed
npm run setup-python

# Check that CSV files are in the correct format
npm run setup-data

# The app will automatically fall back to sample data
```

### Missing CSV Files?
- The system will use sample data automatically
- Follow the data setup instructions to use your actual dataset

### Performance Issues?
- Large datasets may take time to process initially
- Clustering models are cached for subsequent requests
- Consider reducing the number of books/tags for testing

### Development Guidelines

- Test with both sample and real data
- Follow TypeScript best practices
- Ensure responsive design works on all devices
- Add appropriate error handling
- Update documentation as needed

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [React](https://reactjs.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Machine learning powered by [Scikit-learn](https://scikit-learn.org/)
- Dataset structure based on Goodreads data format
- Icons from [Lucide React](https://lucide.dev/)

---

⭐ **Star this repository if you found it helpful!**
