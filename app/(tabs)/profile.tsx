import { AuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/Colors';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
    }
  };

  // Fonction de confirmation avant déconnexion
  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: handleLogout },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
    <View style={styles.container}>
      {/* <Header  /> */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={require('../../assets/images/profile.png')} style={styles.profileImage} />
          <View>
            <Text style={styles.name}>{user?.name || 'Utilisateur'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.option} onPress={confirmLogout}>
            <View style={styles.optionContent}>
              <Ionicons name="log-out-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Déconnexion</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => setModalVisible(true)}>
            <View style={styles.optionContent}>
              <Ionicons name="headset-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Service client</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Adresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Commandes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <Ionicons name="gift-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Bonus Fidélité</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.option}>
            <View style={styles.optionContent}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Réglages</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity> */}
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width: 300,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Informations du restaurant</Text>
            <Text>Nom : Maison de la République</Text>
            <Text>Téléphone : +228 99 57 71 07</Text>
            <Text>Email : contact@mrepublique.com</Text>
            <Text>Adresse : 123, Lomégan près du campus de luniversité de Lomé</Text>
            <Pressable
              style={{ marginTop: 20, backgroundColor: colors.primary, padding: 10, borderRadius: 5 }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: 'white' }}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  </SafeAreaView>  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: colors.text,
  },
  safeArea: {
    flex: 1,
    // backgroundColor: '#72815A',
  },
});