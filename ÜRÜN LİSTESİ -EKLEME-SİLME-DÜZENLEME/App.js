import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import AddProductScreen from './screens/AddProductScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import EditProductScreen from './screens/EditProductScreen';

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Bildirim izni verilmedi!');
      }
    };

    if (Platform.OS !== 'web') {
      requestPermissions();
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ürün Listesi' }} />
        <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Ürün Ekle ' }} />
        <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Ürün Düzenle' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Ürün Detayı' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
