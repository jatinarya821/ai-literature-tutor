import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, Bookmark, BookmarkCheck, Download, Sparkles, Maximize2, X } from 'lucide-react';
import { getBookDetails, getGroqConfig, generateGroqResponse } from '../services/api';
import { safeReadJson, safeWriteJson } from '../utils/storage';
import { AuthContext } from '../context/AuthContext';
import './BookDetails.css';

const MAX_CHAT_HISTORY = 12;

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChatFullscreen, setIsChatFullscreen] = useState(false);
  const messagesEndRef = useRef(null);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsChatFullscreen(prev => !prev);
  }, []);

  // Lock body scroll when fullscreen to prevent mobile UI shifts
  useEffect(() => {
    if (isChatFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatFullscreen]);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isChatFullscreen) {
        setIsChatFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isChatFullscreen]);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      const data = await getBookDetails(id);
      setBook(data);
      if (data) {
        setMessages([
          {
            id: 1,
            sender: 'bot',
            text: `Hello! I'm your AI Literature Tutor. I see you're interested in "${data.title}" by ${data.author}. What would you like to discuss? We can explore themes, character development, historical context, or specific chapters.`
          }
        ]);
      }
      setLoading(false);
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (user && book) {
      const savedBooks = safeReadJson('library_books', []);
      setIsSaved(savedBooks.some(b => b.id === book.id));
    }
  }, [user, book]);

  const handleSaveBook = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const savedBooks = safeReadJson('library_books', []);
    if (isSaved) {
      const newBooks = savedBooks.filter(b => b.id !== book.id);
      safeWriteJson('library_books', newBooks);
      setIsSaved(false);
    } else {
      savedBooks.push(book);
      safeWriteJson('library_books', savedBooks);
      setIsSaved(true);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(m => `${m.sender === 'bot' ? 'LIT-TUTOR AI' : 'YOU'}:\n${m.text}`).join('\n\n-----------------------------------\n\n');
    const blob = new Blob([`STUDY NOTES: ${book.title}\n\n${chatText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/\s+/g, '_')}_Study_Notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitMessage = async (text) => {
    if (!text.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: text
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    const groqConfig = getGroqConfig();
    const historyLimit = Math.max(0, MAX_CHAT_HISTORY - 1);
    const recentMessages = messages.slice(-historyLimit).map(m => ({
      role: m.sender === 'bot' ? 'assistant' : 'user',
      content: m.text
    }));

    try {
      let botResponse = '';

      if (groqConfig) {
        // Deep AI Mode active: Use Groq
        const systemPrompt = `You are an expert AI Literature Tutor. The user is currently studying the book "${book.title}" by ${book.author}. Act as a highly intelligent, conversational professor. If the user asks for a summary, give a thorough, comprehensive plot overview or chapter-by-chapter breakdown. Ensure your answers are highly detailed and analytical. If the user asks for a quiz, generate exactly 10 challenging multiple-choice questions about the book.`;

        const apiMessages = [
          ...recentMessages,
          { role: 'user', content: text }
        ];

        botResponse = await generateGroqResponse({
          model: groqConfig.model,
          systemPrompt,
          messages: apiMessages
        });
      } else {
        // Free Mode: Use Pollinations AI (Original behavior)
        const apiMessages = [
          ...recentMessages,
          { role: 'user', content: text }
        ];

        // System Prompt injecting the exact Book Context
        const systemPrompt = `You are an expert AI Literature Tutor. The user is currently studying the book "${book.title}" by ${book.author}. You must act as a highly intelligent, conversational tutor. If the user asks for a quiz, you MUST generate exactly 10 challenging multiple-choice questions about the book's themes, characters, and plot. Give all 10 questions at once, and wait for the user to reply with their answers before grading them. Do not use large markdown headers.`;

        apiMessages.unshift({ role: 'system', content: systemPrompt });

        // Create an AbortController to set a strict 6-second timeout for the AI
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch(`https://text.pollinations.ai/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        botResponse = await response.text();

        clearTimeout(timeoutId); // Clear timeout ONLY after full text is received!

        // Clean up the Pollinations API deprecation notice
        botResponse = botResponse.replace(/⚠️ \*\*IMPORTANT NOTICE\*\* ⚠️[\s\S]*?will continue to work normally\./i, '').trim();
      }

      // If the API returned nothing or just a warning, force the Fallback Engine!
      if (!botResponse) {
        throw new Error('AI returned an empty response');
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: botResponse }
      ]);
    } catch (error) {
      console.warn('AI Error:', error.message);

      let fallbackResponse = '';
      const isGroqEnabled = !!groqConfig;

      // If Groq Mode is ON but it failed, tell the user WHY it failed so they can fix it.
      if (isGroqEnabled) {
        fallbackResponse = `⚠️ **Groq AI Error:** ${error.message}\n\nPlease ensure the local API server is running and GROQ_API_KEY is set on the server. Then refresh the page and try again.`;
      } else {
        // Bulletproof Fallback: Smart Keyword Engine (Free Mode)
        const lowerInput = text.toLowerCase();

        if (lowerInput.includes('quiz')) {
          fallbackResponse = `Let's test your knowledge on ${book.title}!\n\nQuestion: Which of the following best describes the core internal conflict of the protagonist?\nA) The struggle against an oppressive society.\nB) The battle between personal desire and moral duty.\nC) The quest for material wealth.\n\n(Reply with A, B, or C!)`;
        }
        else if (['a', 'b', 'c', 'a)', 'b)', 'c)'].includes(lowerInput.trim())) {
          fallbackResponse = `Good attempt! In literary analysis, this answer highlights the profound thematic depth the author intended. Understanding this character motivation is key to mastering the book!`;
        }
        else if (lowerInput.includes('summar') || lowerInput.includes('plot') || lowerInput.includes('story') || lowerInput.includes('about')) {
          if (book.description && book.description !== 'No description available for this book.') {
            const shortSummary = book.description.substring(0, 300) + (book.description.length > 300 ? '...' : '');
            fallbackResponse = `Certainly! Here is a brief summary of ${book.title}: "${shortSummary}". Does this premise interest you?`;
          } else {
            fallbackResponse = `Unfortunately, the Open Library database doesn't have a full summary available for ${book.title}, but it is a well-known work by ${book.author}.`;
          }
        }
        else if (lowerInput.includes('char') || lowerInput.includes('role')) {
          if (book.characters && book.characters.length > 0) {
            const charList = book.characters.map(c => `\n• ${c.name || c}`).slice(0, 8).join('');
            fallbackResponse = `The main characters in ${book.title} include:${charList}\n\nEach of them plays a specific role that drives the narrative forward. Whose role did you find the most interesting?`;
          } else {
            fallbackResponse = `In ${book.title}, the characters play pivotal roles in driving the themes. The protagonist's journey directly reflects ${book.author}'s main message. Who is your favorite character so far?`;
          }
        }
        else if (lowerInput.includes('author') || lowerInput.includes('written') || lowerInput.includes('who wrote')) {
          fallbackResponse = `This brilliant piece was written by ${book.author}. Their unique writing style significantly influenced the literary world during their time. Have you read any other books by them?`;
        }
        else if (lowerInput.includes('theme') || lowerInput.includes('symbol')) {
          if (book.subjects && book.subjects.length > 0) {
            const themeList = book.subjects.filter(s => typeof s === 'string' && !s.toLowerCase().includes('protected')).slice(0, 6).join(', ');
            fallbackResponse = `Great topic! Based on literary classification, the core themes and motifs in ${book.title} revolve around: ${themeList}. The author uses these concepts to drive the narrative and build emotional depth. Which of these themes stands out to you the most?`;
          } else {
            fallbackResponse = `Great topic! ${book.title} is rich with symbolism. The recurring motifs often represent the protagonist's isolation and the shifting societal values of the era. How do you interpret the recurring imagery?`;
          }
        }
        else {
          const responses = [
            `That's a fascinating perspective on "${book?.title}". The author often uses that motif to reflect broader societal changes. What do you think motivated the protagonist in that specific scene?`,
            `Indeed! The thematic depth in ${book?.author}'s work is remarkable. If we compare this to other works of the era, we see a distinct departure from traditional narrative structures.`,
            `Great question. The symbolism here is multi-layered. Often, it represents the internal conflict of the characters. How did you interpret the ending?`
          ];
          fallbackResponse = responses[Math.floor(Math.random() * responses.length)];
        }

      } // End of Free Mode Fallback

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: fallbackResponse }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    submitMessage(inputMessage);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <Loader2 className="spinner" size={48} color="var(--accent-primary)" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="error-container glass-panel">
        <h2 className="heading-md">Book not found</h2>
        <Link to="/" className="btn btn-primary mt-4">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="book-details-container animate-fade-in">
      <div className="flex-between mb-2">
        <Link to="/" className="back-link" style={{ marginBottom: 0 }}>
          <ArrowLeft size={20} />
          <span>Back to Search</span>
        </Link>
        <button
          className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleSaveBook}
        >
          {isSaved ? (
            <><BookmarkCheck size={18} /> In Library</>
          ) : (
            <><Bookmark size={18} /> Save to Library</>
          )}
        </button>
      </div>

      <div className="details-layout">
        {/* Book Info Column */}
        <div className="book-info-col glass-panel">
          <div className="book-cover-large">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} />
            ) : (
              <div className="book-cover-placeholder flex-center">
                <span className="text-muted">No Cover Available</span>
              </div>
            )}
          </div>
          <div className="book-metadata">
            <h1 className="heading-lg">{book.title}</h1>
            <p className="author-name text-gradient heading-md">{book.author}</p>
            <div className="description-box">
              <h3 className="heading-sm mb-2">Synopsis</h3>
              <p className="text-muted">{book.description}</p>

              {book.characters && book.characters.length > 0 && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <h3 className="heading-sm mb-2">Notable Characters</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {book.characters.map((char, index) => (
                      <span key={index} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {char.name || char}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {book.subjects && book.subjects.length > 0 && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <h3 className="heading-sm mb-2">Themes & Subjects</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {book.subjects.slice(0, 10).map((subject, index) => (
                      <span key={index} style={{ background: 'var(--accent-gradient)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Tutor Chat Column */}
        {(() => {
          const chatPanel = (
            <div className={`tutor-chat-col glass-panel ${isChatFullscreen ? 'chat-fullscreen' : ''}`}>
              <div className="chat-header">
                <div className="flex-between" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="tutor-avatar flex-center">
                      <Bot size={24} color="#fff" />
                    </div>
                    <div>
                      <h2 className="heading-md" style={{ fontSize: '1.2rem' }}>LitTutor AI</h2>
                      <span className="status-indicator">Online</span>
                    </div>
                  </div>
                  <div className="chat-header-controls">
                    <button className="btn btn-secondary" onClick={handleExportChat} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} title="Export Study Notes">
                      <Download size={16} /> Export
                    </button>
                    {isChatFullscreen ? (
                      <button className="btn chat-close-btn" onClick={toggleFullscreen} title="Exit Fullscreen">
                        <X size={18} /> Close
                      </button>
                    ) : (
                      <button className="btn btn-secondary chat-fullscreen-btn" onClick={toggleFullscreen} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} title="Fullscreen Chat">
                        <Maximize2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender === 'bot' ? 'message-bot' : 'message-user'}`}>
                    <div className="message-avatar flex-center">
                      {msg.sender === 'bot' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    <div className="message-content">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message message-bot">
                    <div className="message-avatar flex-center"><Bot size={18} /></div>
                    <div className="message-content typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <div className="quick-prompts">
                  <button type="button" className="prompt-pill" onClick={() => submitMessage('What are the core themes?')}>
                    <Sparkles size={14} /> Themes
                  </button>
                  <button type="button" className="prompt-pill" onClick={() => submitMessage('Analyze the symbolism in this book.')}>
                    <Sparkles size={14} /> Symbolism
                  </button>
                  <button type="button" className="prompt-pill" onClick={() => submitMessage('Quiz me on this book!')}>
                    Quiz Me!
                  </button>
                </div>
                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask a question or select a prompt..."
                    className="chat-input"
                  />
                  <button type="submit" className="send-btn" disabled={!inputMessage.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          );

          return isChatFullscreen
            ? createPortal(
                <>
                  <div className="chat-fullscreen-backdrop" onClick={toggleFullscreen} />
                  {chatPanel}
                </>,
                document.body
              )
            : chatPanel;
        })()}
      </div>
    </div>
  );
};

export default BookDetails;
