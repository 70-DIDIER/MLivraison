import { AuthContext } from '@/context/AuthContext';
import { login } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken } = useContext(AuthContext);

  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const response = await login(identifiant, password);
      console.log('Login Success:', response);

      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      const errorMessage = error instanceof Error ? error.message : 'Identifiants incorrects';
      Alert.alert('Échec', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Connexion</Text>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.subtitle}>Veuillez entrer votre email pour vous connecter</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={identifiant}
          onChangeText={setIdentifiant}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Mot de passe"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Connexion'}</Text>
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Bienvenu à la maison de la république{'\n'}votre restaurant idéal</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#4a704a',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  forgotPassword: {
    color: 'red',
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#4a704a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
});