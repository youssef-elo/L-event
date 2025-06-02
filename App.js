import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { View, Text, StyleSheet, Platform } from 'react-native';

import { UserProvider, useUser } from './src/context/UserContext';
import { EventProvider } from './src/context/EventContext';
import LoginScreen from './src/screens/LoginScreen';
import EventsScreen from './src/screens/EventsScreen';
import VolunteeringScreen from './src/screens/VolunteeringScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import { Colors } from './src/styles/globalStyles';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { isAdmin } = useUser();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Volunteering') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Volunteering" component={VolunteeringScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ headerShown: false }}
      />
      {isAdmin() && (
        <Tab.Screen 
          name="Admin" 
          component={AdminScreen} 
          options={{ 
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={size} 
                color={color} 
              />
            )
          }}
        />
      )}
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load all Unbounded font weights
        await Font.loadAsync({
          'Unbounded-ExtraLight': require('./assets/fonts/Unbounded-ExtraLight.ttf'),
          'Unbounded-Light': require('./assets/fonts/Unbounded-Light.ttf'),
          'Unbounded-Regular': require('./assets/fonts/Unbounded-Regular.ttf'),
          'Unbounded-Medium': require('./assets/fonts/Unbounded-Medium.ttf'),
          'Unbounded-SemiBold': require('./assets/fonts/Unbounded-SemiBold.ttf'),
          'Unbounded-Bold': require('./assets/fonts/Unbounded-Bold.ttf'),
          'Unbounded-ExtraBold': require('./assets/fonts/Unbounded-ExtraBold.ttf'),
          'Unbounded-Black': require('./assets/fonts/Unbounded-Black.ttf'),
          // Also load a default 'Unbounded' for compatibility
          'Unbounded': require('./assets/fonts/Unbounded-Regular.ttf'),
        });
        console.log('Fonts loaded successfully for', Platform.OS);
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontsLoaded(true); // Continue with system fonts
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <TabNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <EventProvider>
        <AppContent />
      </EventProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Unbounded-Regular',
    fontWeight: 'normal',
    color: '#666666',
  },
});
