
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  signupDate: string;
  citiesChecked: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  addCityToHistory: (cityName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('weatherAppUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login - in real app, this would call an API
    const savedUsers = JSON.parse(localStorage.getItem('weatherAppUsers') || '[]');
    const foundUser = savedUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('weatherAppUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate signup - in real app, this would call an API
    const savedUsers = JSON.parse(localStorage.getItem('weatherAppUsers') || '[]');
    const existingUser = savedUsers.find((u: any) => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      name,
      signupDate: new Date().toISOString(),
      citiesChecked: []
    };

    savedUsers.push(newUser);
    localStorage.setItem('weatherAppUsers', JSON.stringify(savedUsers));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('weatherAppUser', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('weatherAppUser');
  };

  const addCityToHistory = (cityName: string) => {
    if (user && !user.citiesChecked.includes(cityName)) {
      const updatedUser = {
        ...user,
        citiesChecked: [...user.citiesChecked, cityName]
      };
      setUser(updatedUser);
      localStorage.setItem('weatherAppUser', JSON.stringify(updatedUser));
      
      // Update in users array too
      const savedUsers = JSON.parse(localStorage.getItem('weatherAppUsers') || '[]');
      const userIndex = savedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        savedUsers[userIndex].citiesChecked = updatedUser.citiesChecked;
        localStorage.setItem('weatherAppUsers', JSON.stringify(savedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      addCityToHistory
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
