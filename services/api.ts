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
  console.log('Token utilisé:', token);
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
  
  return api.get('/commandes');
};


// Récupérer tous les plats 
export const getDishes = () => api.get('/plats');

// Récupérer les plats par catégorie
export const getDishesByCategory = (category: string) => api.get(`/plats/categorie/${category}`);

// Récupérer les catégories uniques à partir des plats
export const getCategories = async () => {
  try {
    const response = await getDishes();
    const dishes: { categorie: string | null }[] = response.data || []; // Ajuste selon la structure réelle
    const categories = [...new Set(dishes.map((dish) => dish.categorie))];
    return categories.filter((category): category is string => !!category); // Filtrer les valeurs nulles
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
};

// Récupérer 3 plats et 2 boissons pour la section "Nouveaux"
export const getNewItems = async () => {
  try {
    const response = await getDishes();
    const dishes = response.data || [];
    const plats = dishes
      .filter((dish: any) => dish.categorie.toLowerCase() === 'plat')
      .slice(0, 3); // Prendre les 3 premiers plats
    const boissons = dishes
      .filter((dish: any) => dish.categorie.toLowerCase() === 'boisson')
      .slice(0, 2); // Prendre les 2 premières boissons
    return [...plats, ...boissons]; // Combiner les deux
  } catch (error) {
    console.error('Erreur lors de la récupération des nouveaux items:', error);
    return [];
  }
};

// Récupérer un plat au hasard pour la section "Populaire"
export const getRandomDish = async () => {
  try {
    const dishes = await getDishes();
    if (!Array.isArray(dishes) || dishes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * dishes.length);
    return dishes[randomIndex];
  } catch (error) {
    console.error('Erreur lors de la récupération du plat populaire:', error);
    return null;
  }
};

// Autres fonctions (inchangées)
// export const register = (data: { name: string; email: string; password: string }) =>
//   api.post('/register', data);

// export const login = async (credentials: { email: string; password: string }) => {
//   const response = await api.post('/login', credentials);
//   if (response.data.token) {
//     await AsyncStorage.setItem('token', response.data.token);
//   }
//   return response;
// };

export const addToCart = (dishId: string, quantity: number) =>
  api.post('/cart/add', { dish_id: dishId, quantity });

export const getCart = () => api.get('/cart');

// export const createOrder = (data: { delivery_method: string; address?: string }) =>
//   api.post('/order', data);

export const getOrders = () => api.get('/commandes');

export const getUserProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/me');
    console.log('Réponse /me:', response); // Ajoute ce log
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

export const register = async (
  name: string,
  telephone: string,
  password: string,
): Promise<ApiResponse> => {
  try {
    const response = await api.post('/register', {
      name,
      telephone,
      password,
    });

    return response; // Renvoyer directement la réponse après l'intercepteur
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

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

export const verifyCode = async (
  telephone: string,
  code: string
): Promise<ApiResponse> => {
  try {
    const response = await api.post('/verify-code', {
      telephone,
      code,
    });

    return response; // Renvoyer directement la réponse après l'intercepteur
  } catch (error: any) {
    throw error.response?.data ?? error;
  }
};

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export default api;