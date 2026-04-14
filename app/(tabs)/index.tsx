import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Header from '@/components/header-1';
import { getCommandes, prendreLivraison } from '../../services/api';

type Plat = {
  nom: string;
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
const PRIMARY_LIGHT = '#f0f5ed';
const BORDER_LIGHT = '#e8ede5';

export default function CommandesScreen() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Chargement des commandes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent={false} backgroundColor={PRIMARY} />
      <Header />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête avec compteur et bouton recharger */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarTitle}>Commandes disponibles</Text>
            <Text style={styles.topBarSubtitle}>
              {commandes.length} {commandes.length > 1 ? 'commandes' : 'commande'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={fetchCommandes}
            disabled={refreshing || loading}
            activeOpacity={0.8}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Liste des commandes */}
        {commandes.map((commande, index) => {
          const platPrincipal = commande.plats && commande.plats.length > 0 ? commande.plats[0] : null;
          const isActive = activeIndex === index;

          return (
            <View key={commande.id} style={styles.cardWrapper}>
              <View style={[styles.card, isActive && styles.cardActive]}>
                <TouchableOpacity
                  onPress={() => toggleCollapse(index)}
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                >
                  {/* Titre avec icône */}
                  <View style={styles.titleRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="restaurant" size={22} color={PRIMARY} />
                    </View>
                    <View style={styles.titleContent}>
                      <Text style={styles.title} numberOfLines={2}>
                        {platPrincipal?.nom || 'Plat inconnu'}
                      </Text>
                      <Text style={styles.clientName}>
                        {commande.user?.name || 'Client inconnu'}
                      </Text>
                    </View>
                    <View style={styles.arrowContainer}>
                      <Ionicons
                        name={isActive ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={PRIMARY}
                      />
                    </View>
                  </View>

                  {/* Badges infos */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoBadge}>
                      <Ionicons name="location" size={13} color={PRIMARY} />
                      <Text style={styles.infoBadgeText}>
                        {commande.distance ? `${commande.distance} km` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoBadge}>
                      <Ionicons name="time-outline" size={13} color={PRIMARY} />
                      <Text style={styles.infoBadgeText}>
                        {new Date(commande.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={[
                      styles.statutBadge,
                      commande.statut === 'en_cours' && styles.statutEnCours,
                      commande.statut === 'livré' && styles.statutLivre,
                    ]}>
                      <Ionicons
                        name={commande.statut === 'livré' ? 'checkmark-circle' : 'bicycle'}
                        size={13}
                        color={commande.statut === 'livré' ? '#2e7d32' : '#555'}
                      />
                      <Text style={[
                        styles.statutText,
                        commande.statut === 'livré' && styles.statutTextLivre,
                      ]}>
                        {commande.statut === 'en_cours' ? 'En cours' :
                          commande.statut === 'livré' ? 'Livré' : commande.statut}
                      </Text>
                    </View>
                  </View>

                  {/* Adresse */}
                  <View style={styles.addressRow}>
                    <Ionicons name="navigate-circle-outline" size={16} color={PRIMARY} />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {commande.adresse_livraison || 'Adresse non précisée'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Détails dépliables */}
                <Collapsible collapsed={!isActive}>
                  <View style={styles.details}>
                    {/* Montants */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="cash-outline" size={18} color={PRIMARY} />
                        <Text style={styles.sectionTitle}>Détails financiers</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Montant total</Text>
                        <Text style={styles.valueAmount}>{commande.montant_total} FCFA</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Frais de livraison</Text>
                        <Text style={styles.value}>{commande.frais_livraison} FCFA</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Paiement</Text>
                        <View style={[styles.paymentBadge, commande.est_paye && styles.paymentBadgePaid]}>
                          <Ionicons
                            name={commande.est_paye ? 'checkmark-circle' : 'close-circle'}
                            size={14}
                            color={commande.est_paye ? '#2e7d32' : '#c62828'}
                          />
                          <Text style={[styles.paymentBadgeText, commande.est_paye && styles.paymentBadgeTextPaid]}>
                            {commande.est_paye ? 'Payé' : 'Non payé'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Livraison */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="cube-outline" size={18} color={PRIMARY} />
                        <Text style={styles.sectionTitle}>Informations de livraison</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Type de livraison</Text>
                        <Text style={styles.value}>{commande.type_livraison || 'Standard'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Téléphone</Text>
                        <Text style={styles.valueLink}>
                          {commande.user?.telephone || 'Non renseigné'}
                        </Text>
                      </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.phoneButton]}
                        onPress={() => {
                          if (commande.user?.telephone) {
                            Linking.openURL(`tel:${commande.user.telephone}`);
                          }
                        }}
                        disabled={!commande.user?.telephone}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="call" size={18} color={PRIMARY} />
                        <Text style={styles.actionButtonText}>Appeler</Text>
                      </TouchableOpacity>

                      {commande.latitude && commande.longitude && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.mapButton]}
                          onPress={() =>
                            Linking.openURL(
                              `https://www.google.com/maps/dir/?api=1&destination=${commande.latitude},${commande.longitude}`
                            )
                          }
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map" size={18} color={PRIMARY} />
                          <Text style={styles.actionButtonText}>Itinéraire</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionButton, styles.takeButton]}
                        onPress={async () => {
                          try {
                            await prendreLivraison(String(commande.id));
                            setCommandes(prev => prev.filter(c => c.id !== commande.id));
                          } catch {
                            alert('Erreur lors de la prise de la livraison');
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.takeButtonText}>Prendre</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Collapsible>
              </View>
            </View>
          );
        })}

        {/* État vide */}
        {commandes.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="cube-outline" size={52} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Aucune commande disponible</Text>
            <Text style={styles.emptyText}>
              Les nouvelles commandes apparaîtront ici
            </Text>
            <TouchableOpacity style={styles.emptyReloadButton} onPress={fetchCommandes}>
              <Ionicons name="refresh" size={16} color={PRIMARY} />
              <Text style={styles.emptyReloadText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: '#f5f6f4',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f4',
    gap: 12,
  },
  loadingText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 3,
  },
  topBarSubtitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  reloadButton: {
    backgroundColor: PRIMARY,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  cardActive: {
    borderColor: PRIMARY,
    elevation: 5,
    shadowOpacity: 0.1,
  },
  cardHeader: {
    padding: 16,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 3,
    lineHeight: 22,
  },
  clientName: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoBadgeText: {
    fontSize: 12,
    color: PRIMARY,
    fontWeight: '600',
  },
  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statutEnCours: {
    backgroundColor: '#e8f5e9',
  },
  statutLivre: {
    backgroundColor: '#f3faf3',
  },
  statutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  statutTextLivre: {
    color: '#2e7d32',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    padding: 10,
    borderRadius: 10,
  },
  addressText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  details: {
    backgroundColor: '#fafbf9',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER_LIGHT,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 2,
  },
  label: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  valueAmount: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: '700',
  },
  valueLink: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '600',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentBadgePaid: {
    backgroundColor: '#e8f5e9',
  },
  paymentBadgeText: {
    fontSize: 12,
    color: '#c62828',
    fontWeight: '600',
  },
  paymentBadgeTextPaid: {
    color: '#2e7d32',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  phoneButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  mapButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  takeButton: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  actionButtonText: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  takeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222',
  },
  emptyText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  emptyReloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  emptyReloadText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
});
