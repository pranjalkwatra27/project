import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase/config';
import { ref, get } from 'firebase/database';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/Home.css';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEventsData();
  }, [searchTerm, filterCategory, events]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = ref(database, 'events');
      const snapshot = await get(eventsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const eventsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse();
        setEvents(eventsArray);
        setFilteredEvents(eventsArray);
      } else {
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsData = () => {
    let filtered = [...events];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        (event.title || '').toLowerCase().includes(search) ||
        (event.location || '').toLowerCase().includes(search) ||
        (event.description || '').toLowerCase().includes(search)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(event => 
        (event.category || '').toLowerCase() === filterCategory.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
  };

  const handleEventClick = (event) => {
    navigate(`/event/${event.id}`, { state: { event } });
  };

  return (
    <div>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Browse All Events</h1>
          <p style={styles.subtitle}>Discover amazing events happening around you</p>
        </div>

        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <i className="fas fa-search" style={styles.searchIcon}></i>
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              data-testid="search-input"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={styles.categorySelect}
            data-testid="category-filter"
          >
            <option value="all">All Categories</option>
            <option value="music">Music</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="sports">Sports</option>
            <option value="arts">Arts</option>
          </select>
        </div>

        <div className="event-cards" style={{ padding: '20px 40px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#5b21b6', gridColumn: '1/-1' }}>
              Loading events...
            </p>
          ) : filteredEvents.length === 0 ? (
            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>
              No events found.
            </p>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="event-card"
                onClick={() => handleEventClick(event)}
                style={{ cursor: 'pointer' }}
                data-testid={`event-card-${event.id}`}
              >
                <img
                  src={event.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop'}
                  alt={event.title}
                />
                <div className="event-card-content">
                  <h3>{event.title || 'Untitled Event'}</h3>
                  <div className="event-meta">
                    <i className="fas fa-calendar-alt"></i>
                    <span>{event.date || 'TBA'}</span>
                  </div>
                  <div className="event-meta">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{event.location || 'Unknown'}</span>
                  </div>
                  <p>{event.description?.substring(0, 100) || ''}...</p>
                  <button 
                    className="btn-book"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  container: {
    marginTop: '100px',
    minHeight: '70vh',
    paddingBottom: '40px'
  },
  header: {
    textAlign: 'center',
    padding: '60px 20px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff'
  },
  title: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    opacity: 0.9
  },
  filters: {
    maxWidth: '1200px',
    margin: '40px auto 20px',
    padding: '0 40px',
    display: 'flex',
    gap: '20px'
  },
  searchBox: {
    flex: 1,
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '18px'
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  categorySelect: {
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    background: '#fff',
    cursor: 'pointer',
    minWidth: '200px'
  }
};

export default BrowseEvents;
