import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import DiaryScreen from '../screens/DiaryScreen';
import GrowthScreen from '../screens/GrowthScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            // TODO: Add icon component
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Record" 
        component={RecordScreen}
        options={{
          title: '기록',
          tabBarIcon: ({ color, size }) => (
            // TODO: Add icon component
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Diary" 
        component={DiaryScreen}
        options={{
          title: '일기',
          tabBarIcon: ({ color, size }) => (
            // TODO: Add icon component
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Growth" 
        component={GrowthScreen}
        options={{
          title: '성장',
          tabBarIcon: ({ color, size }) => (
            // TODO: Add icon component
            <></>
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            // TODO: Add icon component
            <></>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}