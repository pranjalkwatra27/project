import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import BrowseEvents from './pages/BrowseEvents';
import EventDetails from './pages/EventDetails';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import HostEvent from './pages/HostEvent';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/browse-events" element={<BrowseEvents />} />
          <Route path="/event/:eventId" element={<EventDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/host-event" element={<HostEvent />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
