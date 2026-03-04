import { createContext, useState, useEffect } from 'react';
import newRequest from './utils/newRequest'; // Assuming you have a utility for API calls

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    // Logic for setting user on login
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = async () => {
    // Logic for logging out, including an API call
    try {
      await newRequest.post('/auth/logout');
    } catch (err) {
      console.log(err);
    }
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (updatedUser) => {
    // Logic for updating the user object in state and localStorage
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;