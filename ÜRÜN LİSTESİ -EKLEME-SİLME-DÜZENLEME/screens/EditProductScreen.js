import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { subDays } from 'date-fns';

const EditProductScreen = () => {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.product) {
      setName(route.params.product.name);
      setExpiryDate(route.params.product.expiryDate);
    } else {
      Alert.alert('Hata', 'Ürün bilgileri alınamadı.');
      navigation.goBack();
    }
  }, [route.params]);

  const validateDate = (date) => {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(date);
  };

  const scheduleExpiryNotification = async (product) => {
    const [day, month, year] = product.expiryDate.split('-');
    const expiry = new Date(`${year}-${month}-${day}`);
    const notifyDate = subDays(expiry, 7);
    const now = new Date();

    if (notifyDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${product.name} için hatırlatma`,
          body: `${product.expiryDate} tarihinden önce tüketmeniz önerilir.`,
        },
        trigger: notifyDate,
      });
    }
  };

  const updateProduct = async () => {
    if (!name || !expiryDate) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }

    if (!validateDate(expiryDate)) {
      Alert.alert('Hata', 'Tarih formatı geçersiz. Lütfen DD-MM-YYYY formatında girin.');
      return;
    }

    const updatedProduct = {
      id: route.params.product.id,
      name,
      expiryDate,
    };

    try {
      const savedProducts = await AsyncStorage.getItem('products');
      const parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];
      const updatedProducts = parsedProducts.map((item) =>
        item.id === updatedProduct.id ? updatedProduct : item
      );

      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      await scheduleExpiryNotification(updatedProduct);

      Alert.alert('Başarılı', 'Ürün başarıyla güncellendi!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu.');
      console.error('Ürün güncellenemedi:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ürün Adı:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Son Kullanma Tarihi (DD-MM-YYYY):</Text>
      <TextInput
        style={styles.input}
        value={expiryDate}
        onChangeText={setExpiryDate}
        keyboardType="numeric"
      />

      <Button title="Güncelle" onPress={updateProduct} />
    </View>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});
