import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="grid">
        <div>
          <h3>TalentConnect</h3>
          <p>Where talent meets opportunity</p>
        </div>
        <div>
          <h4>For Event Hosts</h4>
          <Link to="/host-event">Create an Event</Link>
          <a href="#">Getting Started Guide</a>
          <a href="#">Pricing</a>
        </div>
        <div>
          <h4>For Attendees</h4>
          <Link to="/browse-events">Browse Events</Link>
          <a href="#">My Tickets</a>
          <a href="#">Event Calendar</a>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/contact">Contact Us</Link>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <p>© 2025 TalentConnect. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
