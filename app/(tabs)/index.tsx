import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { getCommandes, prendreLivraison } from '../../services/api';

type Plat = {
  nom: string;
  // Ajoutez d'autres propriétés si nécessaire
};

type Commande = {
  id: number | string;
  plats: Plat[];
  user?: { name?: string; telephone?: string };
  adresse_livraison?: string;
  distance?: number | string;
  created_at: string;
  statut?: string;
  montant_total?: number | string;
  frais_livraison?: number | string;
  type_livraison?: string;
  est_paye?: boolean;
  localisation?: string;
  latitude?: string;
  longitude?: string;
};

const PRIMARY = '#72815A';
const SECONDARY = '#000';

export default function CommandesScreen() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchCommandes = async () => {
    try {
      if (!loading) setRefreshing(true);
      const res = await getCommandes();
      setCommandes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.log('Erreur récupération:', err);
      setCommandes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const toggleCollapse = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Bouton Recharger */}
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={fetchCommandes}
          disabled={refreshing || loading}
        >
          <Text style={styles.reloadButtonText}>
            {refreshing ? 'Rechargement...' : 'Recharger'}
          </Text>
        </TouchableOpacity>
      </View>
      {commandes.map((commande, index) => {
        const platPrincipal = commande.plats && commande.plats.length > 0 ? commande.plats[0] : null;
        const isActive = activeIndex === index;
        return (
          <View key={commande.id}>
            <View style={[
              styles.card,
              isActive && styles.cardActive
            ]}>
              <TouchableOpacity
                onPress={() => toggleCollapse(index)}
                style={[
                  styles.header,
                  isActive && styles.headerActive
                ]}
                activeOpacity={0.85}
              >
                <View style={styles.headerRow}>
                  <Text
                    style={styles.title}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    🍽️ Livraison d&apos;un plat de {platPrincipal?.nom || 'Plat inconnu'}
                  </Text>
                  <Text style={[
                    styles.arrow,
                    isActive && styles.arrowOpen
                  ]}>
                    {isActive ? '▲' : '▼'}
                  </Text>
                </View>
                <Text style={styles.subtitle}>
                  {commande.user?.name || 'Client inconnu'} - {commande.adresse_livraison}
                </Text>
                <Text style={styles.subtitle}>
                  {commande.distance ? `${commande.distance} km` : 'Distance inconnue'} | {new Date(commande.created_at).toLocaleTimeString()} | 
                  <Text
                    style={
                      commande.statut === 'en_cours'
                        ? styles.statutEncours
                        : commande.statut === 'livré'
                        ? styles.statutLivre
                        : styles.statutDefault
                    }
                  >
                    {commande.statut}
                  </Text>
                </Text>
              </TouchableOpacity>
              <Collapsible collapsed={!isActive}>
                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Montant total :</Text>
                    <Text style={styles.value}>{commande.montant_total} FCFA</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Frais livraison :</Text>
                    <Text style={styles.value}>{commande.frais_livraison} FCFA</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Type livraison :</Text>
                    <Text style={styles.value}>{commande.type_livraison}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Paiement :</Text>
                    <Text style={styles.value}>{commande.est_paye ? 'Oui' : 'Non'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Localisation :</Text>
                    {commande.latitude && commande.longitude ? (
                      <Text
                        style={[styles.value, { color: PRIMARY, textDecorationLine: 'underline' }]}
                        onPress={() =>
                          Linking.openURL(
                            `https://www.google.com/maps/dir/?api=1&destination=${commande.latitude},${commande.longitude}`
                          )
                        }
                      >
                        Ouvrir dans Google Maps
                      </Text>
                    ) : (
                      <Text style={styles.value}>Non précisée</Text>
                    )}
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Téléphone :</Text>
                    <Text style={styles.value}>{commande.user?.telephone || 'Aucun'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, width: '100%' }}>
                    {/* Bouton Téléphone */}
                    <TouchableOpacity
                      style={styles.phoneButton}
                      onPress={() => {
                        if (commande.user?.telephone) {
                          Linking.openURL(`tel:${commande.user.telephone}`);
                        }
                      }}
                      disabled={!commande.user?.telephone}
                    >
                      <Text style={styles.phoneButtonText}>Téléphone</Text>
                    </TouchableOpacity>
                    {/* Bouton Prendre */}
                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={async () => {
                        try {
                          await prendreLivraison(String(commande.id));
                          setCommandes(prev => prev.filter(c => c.id !== commande.id));
                          // router.push('/menu');
                        } catch {
                          alert("Erreur lors de la prise de la livraison");
                        }
                      }}
                    >
                      <Text style={styles.takeButtonText}>Prendre</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Collapsible>
            </View>
            {/* Séparateur entre les commandes */}
            {index < commandes.length - 1 && <View style={styles.separator} />}
          </View>
        );
      })}
      {commandes.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune commande à afficher.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    // paddingTop: 50, // espace pour la barre de statut
    backgroundColor: '#f4f7f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 0,
    padding: 16,
    elevation: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    // transition: 'box-shadow 0.2s',
  },
  cardActive: {
    backgroundColor: '#e6f9f0',
    shadowOpacity: 0.22,
    borderColor: PRIMARY,
    elevation: 8,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 2,
    backgroundColor: '#fff',
  },
  headerActive: {
    backgroundColor: '#eaf3e2',
    borderRadius: 12,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    fontWeight: 'bold',
    fontSize: 18,
    color: PRIMARY,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  arrow: {
    fontSize: 20,
    color: SECONDARY,
    marginLeft: 8,
    flexShrink: 0,
    transform: [{ rotate: '0deg' }],
    // hy
  },
  arrowOpen: {
    color: PRIMARY,
    transform: [{ rotate: '180deg' }],
  },
  subtitle: {
    color: SECONDARY,
    fontSize: 13,
    marginBottom: 2,
    marginTop: 2,
  },
  details: {
    marginTop: 14,
    paddingLeft: 5,
    borderTopWidth: 1,
    borderTopColor: PRIMARY,
    paddingTop: 12,
    backgroundColor: '#f8fcfa',
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: SECONDARY,
  },
  value: {
    color: PRIMARY,
    fontWeight: '500',
  },
  separator: {
    height: 18,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 2,
  },
  boutonPrendreLivraison: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boutonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  takeButton: {
    backgroundColor: '#72815A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reloadButton: {
    backgroundColor: '#72815A',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  phoneButton: {
    backgroundColor: '#72815A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  phoneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statutEncours: {
    color: 'green',
    fontWeight: 'bold',
  },
  statutLivre: {
    color: 'red',
    fontWeight: 'bold',
  },
  statutDefault: {
    color: '#888',
    fontWeight: 'bold',
  },
});
