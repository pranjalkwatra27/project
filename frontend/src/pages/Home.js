import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebase/config';
import { ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/Home.css';

const Home = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
      title: 'Discover, Book & Experience Events Effortlessly',
      description: 'Join thousands who trust TalentConnect to find and host incredible experiences.'
    },
    {
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1800&auto=format&fit=crop',
      title: 'Easy Booking. Seamless Payments.',
      description: 'Book concerts, workshops, and entertainment with just one click.'
    },
    {
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1800&auto=format&fit=crop',
      title: 'Host With Confidence',
      description: 'Create, promote, and manage your event — all in one platform.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    loadEvents();
    const savedCity = localStorage.getItem('userCity');
    if (savedCity && savedCity !== 'Unknown') {
      setLocationSearch(savedCity);
    }
  }, []);

  useEffect(() => {
    filterEvents();
  }, [locationSearch, events]);

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
      showNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!locationSearch.trim()) {
      setFilteredEvents(events);
      return;
    }

    const searchTerm = locationSearch.toLowerCase();
    const filtered = events.filter(event => 
      (event.location || '').toLowerCase().includes(searchTerm) ||
      (event.title || '').toLowerCase().includes(searchTerm)
    );
    setFilteredEvents(filtered);
  };

  const detectUserCity = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation not supported', 'error');
      return;
    }

    showNotification('Detecting your location...', 'success');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address || {};
          
          let city = (address.city || address.town || address.village || address.county || address.state || '').trim();
          
          const tricityCities = ['pinjore', 'panchkula', 'mohali', 'tricity'];
          if (tricityCities.some(c => city.toLowerCase().includes(c))) {
            city = 'Chandigarh';
          }
          
          if (!city) city = address.county || address.state || 'Unknown';
          
          setLocationSearch(city);
          localStorage.setItem('userCity', city);
          showNotification(`Location detected: ${city}`, 'success');
        } catch (error) {
          console.error('Error detecting city:', error);
          showNotification('Unable to detect city', 'error');
        }
      },
      () => {
        showNotification('Location permission denied', 'error');
      },
      { timeout: 10000 }
    );
  };

  const handleBookEvent = (event) => {
    if (!currentUser) {
      showNotification('Please login to book events', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    navigate(`/event/${event.id}`, { state: { event } });
  };

  const showNotification = (message, type = 'success') => {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `<strong>${message}</strong>`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 80);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  return (
    <div>
      <Navbar />

      {/* Carousel */}
      <div className="carousel">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === slideIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            <div className="carousel-content">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`dot ${index === slideIndex ? 'active' : ''}`}
              onClick={() => setSlideIndex(index)}
            ></div>
          ))}
        </div>
      </div>

      {/* Detect My Location Section */}
      <section className="detect-section">
        <h2>Find Events Happening Near You</h2>
        <div className="search-box">
          <input
            id="locationSearch"
            placeholder="Find events near you..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
          />
          <button className="detect-btn" onClick={detectUserCity}>
            📍 Detect Location
          </button>
          <button className="find-btn" onClick={filterEvents}>
            Find Events
          </button>
        </div>
      </section>

      {/* Events Section */}
      <section>
        <h2>Events Near You</h2>
        <p className="section-desc">
          Hot events happening right now. Don't miss out — filter by city or event name.
        </p>
        <div className="event-cards">
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
              <div key={event.id} className="event-card" data-testid={`event-card-${event.id}`}>
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
                  <p>{event.description || ''}</p>
                  <button 
                    className="btn-book" 
                    onClick={() => handleBookEvent(event)}
                    data-testid={`book-button-${event.id}`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ background: '#f9fafb' }}>
        <h2>
          Everything You Need to Host & Discover <span style={{ color: '#5b21b6' }}>Events</span>
        </h2>
        <p className="section-desc">
          Whether you're hosting a concert or looking for your next adventure, we've got you covered
          with powerful tools and seamless experiences.
        </p>
        <div className="AboutUs-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-calendar-plus"></i></div>
            <h3>Easy Event Creation</h3>
            <p>Create and publish your event in minutes with our intuitive event builder.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-bullhorn"></i></div>
            <h3>Built-in Promotion</h3>
            <p>Your events get promoted to the right audience automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-users"></i></div>
            <h3>Reach Your Audience</h3>
            <p>Connect with thousands of potential attendees in your local community.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-shield-alt"></i></div>
            <h3>Booking Protection</h3>
            <p>Both hosts and attendees are protected with our booking guarantee.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-credit-card"></i></div>
            <h3>Secure Payments</h3>
            <p>We handle all payments securely, so you can focus on your event.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-bolt"></i></div>
            <h3>Instant Bookings</h3>
            <p>Customers can book and pay instantly with just a few clicks.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section>
        <h2>
          How <span style={{ color: '#5b21b6' }}>It Works</span>
        </h2>
        <p className="section-desc">Simple steps to find and book the perfect event for you</p>
        <div className="steps">
          <div className="step">
            <div className="step-icon"><i className="fas fa-search"></i></div>
            <h3>1. Search</h3>
            <p>Browse events by location, date, and category to find what interests you.</p>
          </div>
          <div className="step">
            <div className="step-icon"><i className="fas fa-check-circle"></i></div>
            <h3>2. Select</h3>
            <p>Choose from a variety of events that match your preferences and budget.</p>
          </div>
          <div className="step">
            <div className="step-icon"><i className="fas fa-credit-card"></i></div>
            <h3>3. Book & Pay</h3>
            <p>Secure your spot with our trusted payment system.</p>
          </div>
          <div className="step">
            <div className="step-icon"><i className="fas fa-smile"></i></div>
            <h3>4. Enjoy</h3>
            <p>Attend the event and create unforgettable memories.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
