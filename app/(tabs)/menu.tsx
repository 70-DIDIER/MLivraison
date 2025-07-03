import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { getLivraisons } from '../../services/api';

const PRIMARY = '#72815A';

type Livraison = {
  id: number;
  plats?: { nom?: string }[];
  user?: { name?: string };
  adresse_livraison?: string;
  distance?: number | string;
  created_at: string;
  statut?: string;
  latitude?: number | string;
  longitude?: number | string;
  commentaire?: string;
  montant_total?: number;
  frais_livraison?: number;
  type_livraison?: string;
  est_paye?: boolean;
  livraison_id?: number;
  code_validation?: string;
};

const Menu = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLivraisons = async () => {
    try {
      if (!loading) setRefreshing(true);
      const response = await getLivraisons();
      console.log('Réponse livraisons:', response);
      const mapped = Array.isArray(response)
        ? response.map(livraison => ({
            ...livraison.commande,
            code_validation: livraison.code_validation,
            livraison_id: livraison.id,
            statut_livraison: livraison.statut,
            created_at_livraison: livraison.created_at,
          }))
        : [];
      setLivraisons(mapped);
    } catch {
      setLivraisons([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivraisons();
  }, []);

  const toggleCollapse = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={fetchLivraisons}
          disabled={refreshing || loading}
        >
          <Text style={styles.reloadButtonText}>
            {refreshing ? 'Rechargement...' : 'Recharger'}
          </Text>
        </TouchableOpacity>
      </View>
      {livraisons.map((livraison, index) => {
        const isActive = activeIndex === index;
        return (
          <View key={livraison.livraison_id || livraison.code_validation || index}>
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
                    🍽️ Livraison de commande
                  </Text>
                  <Text style={[
                    styles.arrow,
                    isActive && styles.arrowOpen
                  ]}>
                    {isActive ? '▲' : '▼'}
                  </Text>
                </View>
                <Text style={styles.subtitle}>
                  {livraison.user?.name || 'Client inconnu'} - {livraison.adresse_livraison}
                </Text>
                <Text style={styles.subtitle}>
                  {livraison.distance ? `${livraison.distance} km` : 'Distance inconnue'} | {new Date(livraison.created_at).toLocaleTimeString()} | {livraison.statut}
                </Text>
              </TouchableOpacity>
              <Collapsible collapsed={!isActive}>
                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Montant total :</Text>
                    <Text style={styles.value}>{livraison.montant_total} FCFA</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Frais livraison :</Text>
                    <Text style={styles.value}>{livraison.frais_livraison} FCFA</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Type livraison :</Text>
                    <Text style={styles.value}>{livraison.type_livraison}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Paiement :</Text>
                    <Text style={styles.value}>{livraison.est_paye ? 'Oui' : 'Non'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Localisation :</Text>
                    {livraison.latitude && livraison.longitude ? (
                      <Text
                        style={[styles.value, { color: PRIMARY, textDecorationLine: 'underline' }]}
                        onPress={() =>
                          Linking.openURL(
                            `https://www.google.com/maps/dir/?api=1&destination=${livraison.latitude},${livraison.longitude}`
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
                    <Text style={styles.label}>Commentaire :</Text>
                    <Text style={styles.value}>{livraison.commentaire || 'Aucun'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.takeButton}
                      onPress={() => {
                        alert('Commande livrée !');
                      }}
                    >
                      <Text style={styles.takeButtonText}>Livré</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Collapsible>
            </View>
            {index < livraisons.length - 1 && <View style={styles.separator} />}
          </View>
        );
      })}
      {livraisons.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune livraison à afficher.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    margin: 10,
    padding: 10,
    elevation: 1,
  },
  cardActive: {
    backgroundColor: '#e0f7fa',
  },
  header: {
    padding: 10,
  },
  headerActive: {
    backgroundColor: '#b2ebf2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 18,
    lineHeight: 18,
  },
  arrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  details: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    marginLeft: 10,
  },
  takeButton: {
    backgroundColor: PRIMARY,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    height: 10,
    backgroundColor: '#f1f1f1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
  },
  reloadButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 6,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
  },
  reloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Menu;