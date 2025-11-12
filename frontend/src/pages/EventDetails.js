import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { database } from '../firebase/config';
import { ref, get } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const EventDetails = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    if (!event) {
      loadEventDetails();
    }
  }, [eventId]);

  const loadEventDetails = async () => {
    setLoading(true);
    try {
      const eventRef = ref(database, `events/${eventId}`);
      const snapshot = await get(eventRef);
      
      if (snapshot.exists()) {
        setEvent({ id: eventId, ...snapshot.val() });
      } else {
        showNotification('Event not found', 'error');
        navigate('/browse-events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      showNotification('Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!currentUser) {
      showNotification('Please login to book this event', 'error');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (!event.ticketPrice) {
      showNotification('Ticket price not available', 'error');
      return;
    }

    // Calculate pricing
    const ticketPrice = parseFloat(event.ticketPrice) || 0;
    const basePrice = ticketPrice * ticketCount;
    const bookingFee = 50;
    const gst = Math.round((basePrice + bookingFee) * 0.18);
    const totalAmount = basePrice + bookingFee + gst;

    // Navigate to payment page with booking details
    navigate('/payment', {
      state: {
        event: {
          ...event,
          eventId: event.id
        },
        ticketCount,
        pricing: {
          ticketPrice: basePrice,
          bookingFee,
          gst,
          totalAmount
        }
      }
    });
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#5b21b6', fontSize: '18px' }}>Loading event details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Event not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.heroImage}>
          <img 
            src={event.image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop'} 
            alt={event.title}
            style={styles.image}
          />
        </div>

        <div style={styles.content}>
          <div style={styles.mainContent}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>
              <i className="fas fa-arrow-left"></i> Back
            </button>

            <h1 style={styles.title} data-testid="event-title">{event.title || 'Untitled Event'}</h1>
            
            <div style={styles.metaRow}>
              <div style={styles.metaItem}>
                <i className="fas fa-calendar-alt" style={styles.icon}></i>
                <div>
                  <div style={styles.metaLabel}>Date</div>
                  <div style={styles.metaValue}>{event.date || 'TBA'}</div>
                </div>
              </div>
              
              <div style={styles.metaItem}>
                <i className="fas fa-clock" style={styles.icon}></i>
                <div>
                  <div style={styles.metaLabel}>Time</div>
                  <div style={styles.metaValue}>{event.time || 'TBA'}</div>
                </div>
              </div>
              
              <div style={styles.metaItem}>
                <i className="fas fa-map-marker-alt" style={styles.icon}></i>
                <div>
                  <div style={styles.metaLabel}>Location</div>
                  <div style={styles.metaValue}>{event.location || 'Unknown'}</div>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About This Event</h2>
              <p style={styles.description}>
                {event.description || 'No description available.'}
              </p>
            </div>

            {event.venue && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Venue</h2>
                <p style={styles.description}>{event.venue}</p>
              </div>
            )}
          </div>

          <div style={styles.sidebar}>
            <div style={styles.bookingCard}>
              <h3 style={styles.bookingTitle}>Book Your Tickets</h3>
              
              <div style={styles.priceRow}>
                <span style={styles.priceLabel}>Ticket Price</span>
                <span style={styles.priceValue}>₹{event.ticketPrice || '0'}</span>
              </div>

              <div style={styles.ticketSelector}>
                <label style={styles.ticketLabel}>Number of Tickets</label>
                <div style={styles.ticketControls}>
                  <button 
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    style={styles.ticketButton}
                    data-testid="decrease-ticket"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span style={styles.ticketCount} data-testid="ticket-count">{ticketCount}</span>
                  <button 
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    style={styles.ticketButton}
                    data-testid="increase-ticket"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total</span>
                <span style={styles.totalValue}>₹{(parseFloat(event.ticketPrice) || 0) * ticketCount}</span>
              </div>

              <button 
                onClick={handleBookNow}
                style={styles.bookButton}
                data-testid="book-now-button"
              >
                <i className="fas fa-ticket-alt"></i> Book Now
              </button>

              <p style={styles.bookingNote}>
                <i className="fas fa-shield-alt"></i> Secure booking with payment protection
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const styles = {
  container: {
    marginTop: '100px',
    paddingBottom: '40px'
  },
  heroImage: {
    width: '100%',
    height: '400px',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '40px'
  },
  mainContent: {
    minWidth: 0
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#5b21b6',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontWeight: '600'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '24px'
  },
  metaRow: {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  icon: {
    fontSize: '24px',
    color: '#5b21b6'
  },
  metaLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  metaValue: {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '600'
  },
  section: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '12px'
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#4b5563'
  },
  sidebar: {
    position: 'sticky',
    top: '120px',
    height: 'fit-content'
  },
  bookingCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  bookingTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  priceLabel: {
    fontSize: '16px',
    color: '#6b7280'
  },
  priceValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#5b21b6'
  },
  ticketSelector: {
    marginBottom: '20px'
  },
  ticketLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '10px',
    fontWeight: '600'
  },
  ticketControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    background: '#f9fafb',
    padding: '15px',
    borderRadius: '10px'
  },
  ticketButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #5b21b6',
    background: '#fff',
    color: '#5b21b6',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ticketCount: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    minWidth: '40px',
    textAlign: 'center'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px'
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937'
  },
  totalValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#5b21b6'
  },
  bookButton: {
    width: '100%',
    padding: '16px',
    background: '#5b21b6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  bookingNote: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '13px',
    marginTop: '15px'
  }
};

export default EventDetails;
