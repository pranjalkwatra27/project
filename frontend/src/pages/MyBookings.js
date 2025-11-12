import React, { useEffect, useState } from 'react';
import { database } from '../firebase/config';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadBookings();
    }
  }, [currentUser]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const bookingsRef = ref(database, 'bookings');
      const snapshot = await get(bookingsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userBookings = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(booking => booking.userId === currentUser.uid)
          .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(userBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>My Bookings</h1>
        
        {loading ? (
          <p style={styles.loading}>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="fas fa-ticket-alt" style={styles.emptyIcon}></i>
            <h2>No Bookings Yet</h2>
            <p>Start exploring events and book your first ticket!</p>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {bookings.map(booking => (
              <div key={booking.id} style={styles.bookingCard} data-testid={`booking-${booking.id}`}>
                <div style={styles.bookingHeader}>
                  <h3 style={styles.eventTitle}>{booking.eventTitle}</h3>
                  <span style={styles.status}>
                    <i className="fas fa-check-circle"></i> Confirmed
                  </span>
                </div>
                <div style={styles.bookingDetails}>
                  <div style={styles.detail}>
                    <i className="fas fa-calendar"></i>
                    <span>{booking.eventDate}</span>
                  </div>
                  <div style={styles.detail}>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{booking.eventLocation}</span>
                  </div>
                  <div style={styles.detail}>
                    <i className="fas fa-ticket-alt"></i>
                    <span>{booking.ticketCount} Tickets</span>
                  </div>
                  <div style={styles.detail}>
                    <i className="fas fa-rupee-sign"></i>
                    <span>₹{booking.totalAmount}</span>
                  </div>
                </div>
                <div style={styles.bookingFooter}>
                  <span style={styles.bookingId}>Booking ID: {booking.bookingId}</span>
                  <span style={styles.bookingDate}>
                    Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    marginTop: '120px',
    minHeight: '70vh',
    maxWidth: '1000px',
    margin: '120px auto 40px',
    padding: '0 20px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '30px'
  },
  loading: {
    textAlign: 'center',
    color: '#5b21b6',
    fontSize: '18px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '64px',
    color: '#d1d5db',
    marginBottom: '20px'
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  bookingCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  eventTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937'
  },
  status: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '600'
  },
  bookingDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
    fontSize: '14px'
  },
  bookingFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    fontSize: '13px',
    color: '#9ca3af'
  },
  bookingId: {
    fontFamily: 'monospace'
  },
  bookingDate: {}
};

export default MyBookings;
