import { AuthContext } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/Colors';
import Header from '@/components/header-1';

const PRIMARY = '#72815A';
const PRIMARY_LIGHT = '#f0f5ed';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

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

  const confirmLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnecter', onPress: handleLogout, style: 'destructive' },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'receipt-outline',
      label: 'Historique des commandes',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
    },
    {
      icon: 'headset-outline',
      label: 'Service client',
      onPress: () => setModalVisible(true),
    },
    {
      icon: 'log-out-outline',
      label: 'Déconnexion',
      onPress: confirmLogout,
      danger: true,
    },
  ];

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'LV';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent={false} backgroundColor={PRIMARY} />
      <Header />

      <View style={styles.container}>
        {/* Carte profil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {/* Essai de charger l'image, sinon initiales */}
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Livreur'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'email@exemple.com'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="bicycle" size={12} color={PRIMARY} />
              <Text style={styles.roleText}>Livreur</Text>
            </View>
          </View>
        </View>

        {/* Menu options */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrapper, item.danger && styles.menuIconWrapperDanger]}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.danger ? '#c62828' : PRIMARY}
                />
              </View>
              <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Ionicons name="information-circle-outline" size={14} color="#bbb" />
          <Text style={styles.versionText}>Version 1.0.0 — M'Republique Livreur</Text>
        </View>
      </View>

      {/* Modal service client */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrapper}>
                <Ionicons name="headset" size={28} color={PRIMARY} />
              </View>
              <Text style={styles.modalTitle}>Service client</Text>
              <Text style={styles.modalSubtitle}>Maison de la République</Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalRow}>
                <Ionicons name="business-outline" size={18} color={PRIMARY} />
                <Text style={styles.modalRowText}>Maison de la République</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalRow}>
                <Ionicons name="call-outline" size={18} color={PRIMARY} />
                <Text style={styles.modalRowText}>+228 99 57 71 07</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalRow}>
                <Ionicons name="mail-outline" size={18} color={PRIMARY} />
                <Text style={styles.modalRowText}>contact@mrepublique.com</Text>
              </View>
              <View style={styles.modalDivider} />
              <View style={styles.modalRow}>
                <Ionicons name="location-outline" size={18} color={PRIMARY} />
                <Text style={styles.modalRowText} numberOfLines={2}>
                  Lomégan, près du campus de l'université de Lomé
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6f4',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarFallback: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: PRIMARY_LIGHT,
    borderWidth: 2.5,
    borderColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111',
    marginBottom: 3,
  },
  profileEmail: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconWrapperDanger: {
    backgroundColor: '#ffebee',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  menuLabelDanger: {
    color: '#c62828',
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  modalBody: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalRowText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginLeft: 48,
  },
  modalCloseButton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
