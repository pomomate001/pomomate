import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, RegisterScreen } from '../ui/screens/auth';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Smooth transition
      }}
    >
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen onGoToRegister={() => navigation.navigate('Register')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen onGoToLogin={() => navigation.navigate('Login')} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
