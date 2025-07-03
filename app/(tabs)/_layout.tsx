import { colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {

 
  return (
    <Tabs
      screenOptions={{
        // headerShown: false,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: '#72815A',
        tabBarStyle: { backgroundColor: '#ffffff',
          // display: keyboardVisible ? 'none' : 'flex',
          borderTopWidth: 0,            
          elevation: 0,                 
          shadowOpacity: 0, 
        },
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Mes livraisons',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
     
      <Tabs.Screen
        name="profile"
        options={{
          // title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}