import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './MainScreen'; // Ana ekran
import Chatbot from './Chatbot'; // AI Chatbot
import CustomChatbot from './CustomChatbot'; // Kullanıcı Verisiyle Chatbot

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainScreen">
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="AIChatbot" component={Chatbot} />
        <Stack.Screen name="CustomChatbot" component={CustomChatbot} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
