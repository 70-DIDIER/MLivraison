import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://apirestaurant.mrepublique.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);



export const getCommandes = async () => {
  return api.get('/toutesCommandes');
};

export const prendreLivraison = async (commandeId: string) => {
  return api.post(`/livraisons/prendre/${commandeId}`);
};

export const getLivraisons = async () => {
  return api.get('/livraisons/mes');
};

export const marquerLivre = async (livraisonId: number, codeValidation: string) => {
  return api.post(`/livraisons/livrer/${livraisonId}`, {
    code_validation: codeValidation,
  });
};







export const getUserProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/me');
    console.log('Réponse /me:', response); 
    return response;
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};

// pour les enpdpoints de connexion
interface ApiResponse {
    // Définissez ici les propriétés attendues de la réponse
    [key: string]: any;
}



export const login = async (
  identifiant: string,
  password: string
): Promise<ApiResponse> => {
  try {
    const response = await api.post('/login', {
      identifiant,
      password,
    });

    return response; // Retourner directement la réponse comme pour register et verifyCode
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};



export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export default api;