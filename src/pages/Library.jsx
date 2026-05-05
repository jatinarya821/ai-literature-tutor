import { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Library as LibraryIcon, BookmarkX } from 'lucide-react';
import BookCard from '../components/BookCard';
import './Library.css';

const Library = () => {
  const { user } = useContext(AuthContext);
  const [savedBooks, setSavedBooks] = useState([]);

  useEffect(() => {
    if (user) {
      const books = JSON.parse(localStorage.getItem('library_books') || '[]');
      setSavedBooks(books);
    }
  }, [user]);

  const removeBook = (id, e) => {
    e.preventDefault(); // Prevent navigating to book details if wrapped in a Link (handled in BookCard conceptually, but here we can add a remove button over the card or just a simple list)
    const newBooks = savedBooks.filter(book => book.id !== id);
    setSavedBooks(newBooks);
    localStorage.setItem('library_books', JSON.stringify(newBooks));
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="library-container animate-fade-in">
      <div className="library-header glass-panel">
        <div className="flex-center" style={{ gap: '1rem', marginBottom: '1rem' }}>
          <LibraryIcon size={32} color="var(--accent-primary)" />
          <h1 className="heading-lg">My Library</h1>
        </div>
        <p className="text-muted">Welcome back, <span className="text-gradient font-bold">{user.name}</span>! Here are your saved books.</p>
      </div>

      {savedBooks.length === 0 ? (
        <div className="empty-library glass-panel flex-center">
          <div style={{ textAlign: 'center' }}>
            <LibraryIcon size={64} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
            <h2 className="heading-md" style={{ marginBottom: '1rem' }}>Your library is empty</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>Start searching and save books to analyze later.</p>
            <Link to="/" className="btn btn-primary">Find Books</Link>
          </div>
        </div>
      ) : (
        <div className="books-grid">
          {savedBooks.map(book => (
            <div key={book.id} className="library-card-wrapper">
              <BookCard book={book} />
              <button 
                className="remove-btn" 
                onClick={(e) => removeBook(book.id, e)}
                title="Remove from Library"
              >
                <BookmarkX size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
