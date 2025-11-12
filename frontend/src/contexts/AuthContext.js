import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserData(data);
            
            // Redirect organizers to their dashboard
            if (data.userType === 'organizer' && window.location.pathname === '/') {
              window.location.href = '/organizer-dashboard';
            }
          } else {
            // User exists in Auth but not in database
            await signOut(auth);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
