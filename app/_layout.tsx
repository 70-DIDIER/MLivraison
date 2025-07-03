import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useCallback, useContext, useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { CartProvider } from '../context/CartContext';

function RootLayoutNav() {
  const { token, loading } = useContext(AuthContext);
  const segments = useSegments();
  const router = useRouter();

  const handleNavigation = useCallback(() => {
    if (loading) return; // Ne pas naviguer pendant le chargement

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      // Rediriger vers l'écran de connexion si non authentifié
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      // Rediriger vers l'écran principal si authentifié
      router.replace("/(tabs)");
    }
  }, [token, segments, router, loading]);

  useEffect(() => {
    if (!loading) {
      handleNavigation();
    }
  }, [handleNavigation, loading]);

  // Afficher un splash tant que loading est true, sans rendre Slot ni rien d'autre
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <Image source={require("../assets/images/logo.png")} style={{ width: 120, height: 120, marginBottom: 24 }} />
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Toujours rendre le Slot, même pendant le chargement
  return (
    <CartProvider>
      <Slot />
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
