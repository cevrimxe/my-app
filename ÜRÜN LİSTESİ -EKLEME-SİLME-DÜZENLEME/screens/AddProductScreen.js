import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { subDays } from 'date-fns';

const AddProductScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleExpiryDateChange = (text) => {
    const formatted = text.replace(/[^0-9-]/g, '');
    setExpiryDate(formatted);
  };

  const scheduleExpiryNotification = async (product) => {
    const [day, month, year] = product.expiryDate.split('-');
    const expiry = new Date(`${year}-${month}-${day}`);
    const notifyDate = subDays(expiry, 7);
    const now = new Date();

    if (notifyDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${product.name} bozulmak üzere!`,
          body: `${product.expiryDate} tarihinden önce tüket.`,
        },
        trigger: notifyDate,
      });
    }
  };

  const handleAddProduct = async () => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;

    if (!name) {
      Alert.alert('Uyarı', 'Lütfen ürün adını girin.');
      return;
    }

    if (!regex.test(expiryDate)) {
      Alert.alert('Uyarı', 'Tarihi GG-AA-YYYY formatında girin.');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      expiryDate,
    };

    try {
      const stored = await AsyncStorage.getItem('products');
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = [...parsed, newProduct];

      await AsyncStorage.setItem('products', JSON.stringify(updated));
      await scheduleExpiryNotification(newProduct);

      navigation.goBack();
    } catch (error) {
      console.error('Ürün eklenemedi:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ürün Adı</Text>
      <TextInput
        style={styles.input}
        placeholder="Örn: Süt"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Son Kullanma Tarihi (GG-AA-YYYY)</Text>
      <TextInput
        style={styles.input}
        placeholder="27-04-2025"
        value={expiryDate}
        onChangeText={handleExpiryDateChange}
        keyboardType="numeric"
      />

      <Button title="Ekle" onPress={handleAddProduct} />
    </View>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 15,
  },
});
