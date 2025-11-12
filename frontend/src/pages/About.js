import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const About = () => {
  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>About TalentConnect</h1>
        <p style={styles.text}>Where talent meets opportunity. TalentConnect is your go-to platform for discovering and booking amazing events.</p>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    marginTop: '150px',
    minHeight: '60vh',
    maxWidth: '800px',
    margin: '150px auto 40px',
    padding: '0 20px',
    textAlign: 'center'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '20px'
  },
  text: {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: '1.6'
  }
};

export default About;
