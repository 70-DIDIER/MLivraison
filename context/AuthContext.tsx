import { getUserProfile } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextData {
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
  user: User | null;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  setToken: () => {},
  loading: true,
  user: null,
  logout: async () => {},
});

export const AuthProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const loadUserData = async (token: string) => {
    try {
      const userData = await getUserProfile();
      console.log('Données utilisateur chargées:', userData);
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur', error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        setToken(storedToken);
        if (storedToken) {
          await loadUserData(storedToken);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du token', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, loading, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};