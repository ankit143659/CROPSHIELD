
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, LocalUser } from '../services/db';

interface UserProxy {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  currentUser: UserProxy | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProxy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = localStorage.getItem('botanical_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          // Verify user still exists in local DB
          const exists = await db.users.where('email').equalsIgnoreCase(parsed.email).first();
          if (exists) {
            setCurrentUser(parsed);
          } else {
            localStorage.removeItem('botanical_user');
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Standardize email to lowercase for indexing
    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.users.where('email').equalsIgnoreCase(normalizedEmail).first();
    
    if (!user) {
      throw { code: 'auth/user-not-found' };
    }
    
    if (user.password !== password) {
      throw { code: 'auth/wrong-password' };
    }
    
    const userProxy = { uid: normalizedEmail, email: normalizedEmail, displayName: user.name };
    setCurrentUser(userProxy);
    localStorage.setItem('botanical_user', JSON.stringify(userProxy));
  };

  const register = async (email: string, password: string, name: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const exists = await db.users.where('email').equalsIgnoreCase(normalizedEmail).first();
    
    if (exists) {
      throw { code: 'auth/email-already-in-use' };
    }

    await db.users.add({
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      createdAt: new Date()
    });

    const userProxy = { uid: normalizedEmail, email: normalizedEmail, displayName: name.trim() };
    setCurrentUser(userProxy);
    localStorage.setItem('botanical_user', JSON.stringify(userProxy));
  };

  const signOut = async () => {
    setCurrentUser(null);
    localStorage.removeItem('botanical_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
