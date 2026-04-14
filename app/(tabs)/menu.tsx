import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Header from '@/components/header-1';
import { getLivraisons, marquerLivre } from '../../services/api';

const PRIMARY = '#72815A';
const PRIMARY_LIGHT = '#f0f5ed';
const BORDER_LIGHT = '#e8ede5';

type Livraison = {
  id: number;
  plats?: { nom?: string }[];
  user?: { name?: string; telephone?: string };
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
  statut_livraison?: string;
};

const Menu = () => {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [codeInputVisible, setCodeInputVisible] = useState<number | null>(null); // livraison_id en cours
  const [codeInput, setCodeInput] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  const fetchLivraisons = async () => {
    try {
      if (!loading) setRefreshing(true);
      const response = await getLivraisons();
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

  const handleMarquerLivre = async (livraison: Livraison) => {
    if (!livraison.livraison_id) return;
    if (!codeInput.trim()) {
      Alert.alert('Code requis', 'Veuillez saisir le code de validation du client.');
      return;
    }
    try {
      setCodeLoading(true);
      await marquerLivre(livraison.livraison_id, codeInput.trim());
      setLivraisons(prev => prev.filter(l => l.livraison_id !== livraison.livraison_id));
      setCodeInputVisible(null);
      setCodeInput('');
      Alert.alert('Livraison confirmée', 'La commande a bien été marquée comme livrée.');
    } catch {
      Alert.alert('Code incorrect', 'Le code de validation ne correspond pas. Vérifiez avec le client.');
    } finally {
      setCodeLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Chargement des livraisons...</Text>
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
        {/* En-tête */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.topBarTitle}>Mes livraisons</Text>
            <Text style={styles.topBarSubtitle}>
              {livraisons.length} {livraisons.length > 1 ? 'livraisons en cours' : 'livraison en cours'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={fetchLivraisons}
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

        {/* Liste des livraisons */}
        {livraisons.map((livraison, index) => {
          const isActive = activeIndex === index;
          const platPrincipal = livraison.plats && livraison.plats.length > 0 ? livraison.plats[0] : null;

          return (
            <View key={livraison.livraison_id || livraison.code_validation || index} style={styles.cardWrapper}>
              <View style={[styles.card, isActive && styles.cardActive]}>
                <TouchableOpacity
                  onPress={() => toggleCollapse(index)}
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                >
                  {/* Titre */}
                  <View style={styles.titleRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="bicycle" size={22} color={PRIMARY} />
                    </View>
                    <View style={styles.titleContent}>
                      <Text style={styles.title} numberOfLines={2}>
                        {platPrincipal?.nom || 'Commande en livraison'}
                      </Text>
                      <Text style={styles.clientName}>
                        {livraison.user?.name || 'Client inconnu'}
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

                  {/* Code de validation */}
                  {livraison.code_validation && (
                    <View style={styles.codeContainer}>
                      <View style={styles.codeLabelRow}>
                        <Ionicons name="shield-checkmark-outline" size={14} color="#e65100" />
                        <Text style={styles.codeLabel}>Code de validation</Text>
                      </View>
                      <Text style={styles.codeValue}>{livraison.code_validation}</Text>
                    </View>
                  )}

                  {/* Badges */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoBadge}>
                      <Ionicons name="location" size={13} color={PRIMARY} />
                      <Text style={styles.infoBadgeText}>
                        {livraison.distance ? `${livraison.distance} km` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoBadge}>
                      <Ionicons name="time-outline" size={13} color={PRIMARY} />
                      <Text style={styles.infoBadgeText}>
                        {new Date(livraison.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.statutBadge}>
                      <Ionicons name="bicycle" size={13} color="#1565c0" />
                      <Text style={styles.statutText}>
                        {livraison.statut_livraison || livraison.statut || 'En cours'}
                      </Text>
                    </View>
                  </View>

                  {/* Adresse */}
                  <View style={styles.addressRow}>
                    <Ionicons name="navigate-circle-outline" size={16} color={PRIMARY} />
                    <Text style={styles.addressText} numberOfLines={2}>
                      {livraison.adresse_livraison || 'Adresse non précisée'}
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
                        <Text style={styles.valueAmount}>{livraison.montant_total} FCFA</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Frais de livraison</Text>
                        <Text style={styles.value}>{livraison.frais_livraison} FCFA</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Paiement</Text>
                        <View style={[styles.paymentBadge, livraison.est_paye && styles.paymentBadgePaid]}>
                          <Ionicons
                            name={livraison.est_paye ? 'checkmark-circle' : 'close-circle'}
                            size={14}
                            color={livraison.est_paye ? '#2e7d32' : '#c62828'}
                          />
                          <Text style={[styles.paymentBadgeText, livraison.est_paye && styles.paymentBadgeTextPaid]}>
                            {livraison.est_paye ? 'Payé' : 'Non payé'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Informations livraison */}
                    <View style={styles.section}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="cube-outline" size={18} color={PRIMARY} />
                        <Text style={styles.sectionTitle}>Informations de livraison</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Type de livraison</Text>
                        <Text style={styles.value}>{livraison.type_livraison || 'Standard'}</Text>
                      </View>
                      {livraison.user?.telephone && (
                        <View style={styles.detailRow}>
                          <Text style={styles.label}>Téléphone</Text>
                          <Text style={styles.valueLink}>{livraison.user.telephone}</Text>
                        </View>
                      )}
                      {livraison.commentaire && (
                        <View style={styles.commentContainer}>
                          <View style={styles.commentLabelRow}>
                            <Ionicons name="chatbubble-outline" size={14} color="#f57f17" />
                            <Text style={styles.commentLabel}>Commentaire</Text>
                          </View>
                          <Text style={styles.commentText}>{livraison.commentaire}</Text>
                        </View>
                      )}
                    </View>

                    {/* Plats commandés */}
                    {livraison.plats && livraison.plats.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="restaurant-outline" size={18} color={PRIMARY} />
                          <Text style={styles.sectionTitle}>Plats commandés</Text>
                        </View>
                        {livraison.plats.map((plat, idx) => (
                          <View key={idx} style={styles.platItem}>
                            <Ionicons name="ellipse" size={8} color={PRIMARY} />
                            <Text style={styles.platName}>{plat.nom || 'Plat inconnu'}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                      {livraison.user?.telephone && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.phoneButton]}
                          onPress={() => {
                            if (livraison.user?.telephone) {
                              Linking.openURL(`tel:${livraison.user.telephone}`);
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="call" size={18} color={PRIMARY} />
                          <Text style={styles.actionButtonText}>Appeler</Text>
                        </TouchableOpacity>
                      )}

                      {livraison.latitude && livraison.longitude && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.mapButton]}
                          onPress={() =>
                            Linking.openURL(
                              `https://www.google.com/maps/dir/?api=1&destination=${livraison.latitude},${livraison.longitude}`
                            )
                          }
                          activeOpacity={0.8}
                        >
                          <Ionicons name="map" size={18} color={PRIMARY} />
                          <Text style={styles.actionButtonText}>Itinéraire</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deliveredButton]}
                        onPress={() => {
                          setCodeInput('');
                          setCodeInputVisible(
                            codeInputVisible === livraison.livraison_id ? null : livraison.livraison_id ?? null
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark-done" size={18} color="#fff" />
                        <Text style={styles.deliveredButtonText}>Livré</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Saisie du code de validation */}
                    {codeInputVisible === livraison.livraison_id && (
                      <View style={styles.codeInputContainer}>
                        <View style={styles.codeInputHeader}>
                          <Ionicons name="keypad-outline" size={16} color="#e65100" />
                          <Text style={styles.codeInputLabel}>
                            Saisissez le code du client pour confirmer
                          </Text>
                        </View>
                        <View style={styles.codeInputRow}>
                          <TextInput
                            style={styles.codeInputField}
                            value={codeInput}
                            onChangeText={setCodeInput}
                            placeholder="0000"
                            placeholderTextColor="#ccc"
                            keyboardType="number-pad"
                            maxLength={4}
                          />
                          <TouchableOpacity
                            style={[styles.codeConfirmButton, codeLoading && { opacity: 0.7 }]}
                            onPress={() => handleMarquerLivre(livraison)}
                            disabled={codeLoading}
                            activeOpacity={0.8}
                          >
                            {codeLoading ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                <Text style={styles.codeConfirmText}>Confirmer</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </Collapsible>
              </View>
            </View>
          );
        })}

        {/* État vide */}
        {livraisons.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="bicycle-outline" size={52} color={PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Aucune livraison en cours</Text>
            <Text style={styles.emptyText}>
              Vos livraisons à effectuer apparaîtront ici
            </Text>
            <TouchableOpacity style={styles.emptyReloadButton} onPress={fetchLivraisons}>
              <Ionicons name="refresh" size={16} color={PRIMARY} />
              <Text style={styles.emptyReloadText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
  codeContainer: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#ffb74d',
    borderStyle: 'dashed',
  },
  codeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  codeLabel: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#e65100',
    letterSpacing: 6,
    textAlign: 'center',
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
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565c0',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    lineHeight: 18,
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
  commentContainer: {
    backgroundColor: '#fffde7',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffd54f',
  },
  commentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f57f17',
  },
  commentText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  platItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    paddingVertical: 2,
  },
  platName: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    flex: 1,
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
  deliveredButton: {
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
  deliveredButtonText: {
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
  // Saisie code de validation
  codeInputContainer: {
    marginTop: 12,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#ffb74d',
  },
  codeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  codeInputLabel: {
    fontSize: 13,
    color: '#e65100',
    fontWeight: '600',
    flex: 1,
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  codeInputField: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ffb74d',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#e65100',
    letterSpacing: 6,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  codeConfirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#43a047',
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#43a047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  codeConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default Menu;
