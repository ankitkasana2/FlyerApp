import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import ResetPasswordScreen from '../screens/Auth/ResetPasswordScreen';
import ResetPasswordNewPasswordScreen from '../screens/Auth/ResetPasswordNewPasswordScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ConfirmEmail" component={OtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="ResetPasswordOtp" component={OtpScreen} />
      <Stack.Screen name="ResetPasswordNewPassword" component={ResetPasswordNewPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
