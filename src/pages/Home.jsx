import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import BookCard from '../components/BookCard';
import { searchBooks } from '../services/api';
import './Home.css';

const Home = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        // Fetch classic literature by default to populate the initial library grid
        const results = await searchBooks('classic literature');
        setBooks(results);
      } catch (error) {
        console.error('Failed to load featured books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const results = await searchBooks(query);
      setBooks(results);
    } catch (error) {
      console.error('Failed to search books', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container animate-fade-in">
      <div className="hero-section">
        <h1 className="heading-xl">
          Your AI <span className="text-gradient">Literature Tutor</span>
        </h1>
        <p className="hero-subtitle text-muted">
          Discover insights, analyze themes, and discuss your favorite books with an intelligent AI companion.
        </p>

        <form onSubmit={handleSearch} className="search-form glass-panel">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a book to analyze..."
            className="search-input"
          />
          <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={20} /> : <Search size={20} />}
            <span>Search</span>
          </button>
        </form>
      </div>

      <div className="results-section">
        <h2 className="heading-lg section-title">
          {loading 
            ? (hasSearched ? 'Searching...' : 'Loading Featured Books...') 
            : (hasSearched ? `Results for "${query}"` : 'Featured Literature')}
        </h2>
        
        {!loading && books.length === 0 && (
          <div className="no-results glass-panel">
            <p>No books found. Try a different search term.</p>
          </div>
        )}

        {loading ? (
          <div className="flex-center" style={{ minHeight: '200px' }}>
            <Loader2 className="spinner" size={40} color="var(--accent-primary)" />
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
