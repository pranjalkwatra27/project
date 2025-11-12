import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { database } from '../firebase/config';
import { ref, push, set } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // UPI details
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('');

  const bookingData = location.state;

  useEffect(() => {
    if (!bookingData || !currentUser) {
      navigate('/');
    }
  }, [bookingData, currentUser, navigate]);

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  const { event, ticketCount, pricing } = bookingData;

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(value);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiryDate(value);
  };

  const handleVerifyUPI = () => {
    if (!upiId) {
      showNotification('Please enter UPI ID', 'error');
      return;
    }
    // Simulate UPI verification
    setTimeout(() => {
      setUpiVerified(true);
      showNotification('UPI ID verified successfully', 'success');
    }, 1000);
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
        showNotification('Please fill all card details', 'error');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiVerified) {
        showNotification('Please verify your UPI ID first', 'error');
        return;
      }
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking record in Firebase
      const bookingRef = ref(database, 'bookings');
      const newBookingRef = push(bookingRef);
      
      await set(newBookingRef, {
        userId: currentUser.uid,
        userName: userData?.name || 'Guest',
        userEmail: userData?.email || currentUser.email,
        eventId: event.eventId || event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        ticketCount,
        totalAmount: pricing.totalAmount,
        paymentMethod,
        paymentStatus: 'completed',
        bookingDate: new Date().toISOString(),
        bookingId: newBookingRef.key
      });

      showNotification('Payment successful! Booking confirmed.', 'success');
      
      // Redirect to success page or bookings
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      showNotification('Payment failed. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
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

  const upiApps = [
    { name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', value: 'gpay' },
    { name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/PhonePe_Logo.png', value: 'phonepe' },
    { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg', value: 'paytm' },
    { name: 'BHIM', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Bhim-logo.png', value: 'bhim' }
  ];

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>💳 Complete Your Payment</h1>
        <p>You're just one step away from booking your tickets</p>
        <div className="secure-badge">
          <i className="fas fa-shield-alt"></i>
          <span>256-bit Secure Encryption</span>
        </div>
      </div>

      <div className="payment-body">
        <div className="payment-methods-section">
          <h2><i className="fas fa-wallet"></i> Select Payment Method</h2>

          <div className="payment-tabs">
            <div 
              className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
              data-testid="card-tab"
            >
              <i className="fas fa-credit-card"></i>
              <span>Card</span>
            </div>
            <div 
              className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('upi')}
              data-testid="upi-tab"
            >
              <i className="fas fa-mobile-alt"></i>
              <span>UPI</span>
            </div>
          </div>

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <div className="payment-content active">
              <form>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    data-testid="card-number"
                  />
                  <div className="card-logos">
                    <div className="card-logo">VISA</div>
                    <div className="card-logo">MC</div>
                    <div className="card-logo">RUPAY</div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="Name on card"
                    data-testid="cardholder-name"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      data-testid="expiry-date"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      placeholder="123"
                      maxLength="3"
                      data-testid="cvv"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* UPI Payment */}
          {paymentMethod === 'upi' && (
            <div className="payment-content active">
              <div className="humanized-message">
                <i className="fas fa-comment-alt"></i>
                <p>Choose your preferred UPI app to pay instantly. We'll send a collect request directly to your UPI ID!</p>
              </div>

              <form>
                <div className="form-group">
                  <label>Select Your UPI App (Optional)</label>
                  <div className="upi-apps">
                    {upiApps.map(app => (
                      <div 
                        key={app.value}
                        className={`upi-app ${selectedUpiApp === app.value ? 'selected' : ''}`}
                        onClick={() => setSelectedUpiApp(app.value)}
                      >
                        <img src={app.logo} className="upi-app-logo" alt={app.name} />
                        <span>{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '25px' }}>
                  <label>Enter Your UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@paytm / yourname@ybl"
                    data-testid="upi-id"
                  />
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={handleVerifyUPI}
                    style={{ width: '100%', marginTop: '10px', padding: '12px' }}
                    data-testid="verify-upi"
                  >
                    <i className="fas fa-check-circle"></i> Verify UPI ID
                  </button>
                  {upiVerified && (
                    <p style={{ fontSize: '13px', color: '#10b981', marginTop: '8px' }}>
                      <i className="fas fa-check-circle"></i> UPI ID verified successfully
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

          <button 
            className="pay-button"
            onClick={handlePayment}
            disabled={processing}
            data-testid="pay-button"
          >
            <i className="fas fa-lock"></i>
            {processing ? 'Processing...' : `Pay ₹${pricing.totalAmount}`}
          </button>

          <div className="payment-footer">
            <i className="fas fa-shield-alt"></i>
            Your payment information is encrypted and secure
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2><i className="fas fa-receipt"></i> Order Summary</h2>

          <div className="event-info">
            <h3 data-testid="event-name">{event.title}</h3>
            <div className="event-detail">
              <i className="fas fa-calendar-alt"></i>
              <span>{event.date}</span>
            </div>
            <div className="event-detail">
              <i className="fas fa-clock"></i>
              <span>{event.time || 'TBA'}</span>
            </div>
            <div className="event-detail">
              <i className="fas fa-map-marker-alt"></i>
              <span>{event.location}</span>
            </div>
            <div className="event-detail">
              <i className="fas fa-ticket-alt"></i>
              <span>{ticketCount} Tickets</span>
            </div>
          </div>

          <div className="price-breakdown">
            <div className="order-item">
              <span className="order-item-label">Ticket Price (×{ticketCount})</span>
              <span className="order-item-value">₹{pricing.ticketPrice}</span>
            </div>
            <div className="order-item">
              <span className="order-item-label">Booking Fee</span>
              <span className="order-item-value">₹{pricing.bookingFee}</span>
            </div>
            <div className="order-item">
              <span className="order-item-label">GST (18%)</span>
              <span className="order-item-value">₹{pricing.gst}</span>
            </div>
          </div>

          <div className="total-amount">
            <div className="label">Total Amount</div>
            <div className="amount" data-testid="total-amount">₹{pricing.totalAmount}</div>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {processing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please wait while we process your transaction</p>
            <p style={{ marginTop: '10px' }}>Do not refresh or close this page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
