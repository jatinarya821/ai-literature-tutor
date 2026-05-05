import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import './BookCard.css';

const BookCard = ({ book }) => {
  return (
    <Link to={`/book/${book.id}`} className="book-card glass-panel">
      <div className="book-cover">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} loading="lazy" />
        ) : (
          <div className="book-cover-placeholder flex-center">
            <Book size={48} color="var(--text-secondary)" />
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title heading-md">{book.title}</h3>
        <p className="book-author text-muted">{book.author}</p>
        {book.firstPublished && (
          <span className="book-year">{book.firstPublished}</span>
        )}
      </div>
    </Link>
  );
};

export default BookCard;
