import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const HostEvent = () => {
  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Host Your Event</h1>
        <p style={styles.subtitle}>Feature coming soon! Email/phone verification will be implemented here.</p>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    marginTop: '150px',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '40px 20px'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    marginTop: '10px'
  }
};

export default HostEvent;
