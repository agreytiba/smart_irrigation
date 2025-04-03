import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Text, StatusBar, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SettingsScreen from './screens/SettingScreen';
import IrrigationScreen from './screens/Irrigation';
import { Ionicons } from '@expo/vector-icons';
import { ScheduleItem } from './types';

export type RootTabParamList = {
  Home: undefined;
  Irrigation: undefined;
  Settings: undefined;
  Schedule: { scheduleData: ScheduleItem[] };
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const backgroundColor = new Animated.Value(0);
  const textScale = new Animated.Value(0.5); // Start small
  const textOpacity = new Animated.Value(0);
  const textPosition = new Animated.Value(50); // Start slightly lower

  // Color interpolation for the background transition
  const bgColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFD700', '#4CAF50'] // Yellow to Green
  });

  useEffect(() => {
    // Background color animation
    Animated.timing(backgroundColor, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false,
    }).start();

    // Text animation sequence
    Animated.sequence([
      // Scale up and fade in
      Animated.parallel([
        Animated.timing(textScale, {
          toValue: 1.2, // Scale up slightly larger than normal
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textPosition, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      ]),
      // Pause for 1 second
      Animated.delay(1000),
      // Scale back to normal
      Animated.timing(textScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Pause for 1 second
      Animated.delay(1000),
    ]).start();

    // Hide splash after 4 seconds total (adjust timing to match your animation)
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashContainer, { backgroundColor: bgColor }]}>
        <StatusBar translucent backgroundColor="transparent" />
        <Animated.Text 
          style={[
            styles.welcomeText, 
            { 
              opacity: textOpacity,
              transform: [
                { scale: textScale },
                { translateY: textPosition }
              ]
            }
          ]}
        >
          WELCOME TO SMART IRRIGATION APP
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar translucent backgroundColor="transparent" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Irrigation') {
              iconName = focused ? 'water' : 'water-outline';
            } else if (route.name === 'Schedule') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            paddingBottom: 5,
            height: 60,
            backgroundColor: '#f8f9fa',
            borderTopWidth: 0,
            elevation: 0,
          },
          headerShown: false,
          cardStyle: {
            backgroundColor: 'transparent',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Home' }} 
        />
        <Tab.Screen 
          name="Irrigation" 
          component={IrrigationScreen} 
          options={{ title: 'Irrigation Plan' }} 
        />
        <Tab.Screen 
          name="Schedule" 
          component={ScheduleScreen} 
          options={{ title: 'Irrigation Schedule' }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 20,
  },
});

export default App;