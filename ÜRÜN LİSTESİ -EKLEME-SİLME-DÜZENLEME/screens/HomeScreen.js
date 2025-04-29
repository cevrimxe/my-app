import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchProducts();
    }
  }, [isFocused]);

  const fetchProducts = async () => {
    try {
      const savedProducts = await AsyncStorage.getItem('products');
      const parsedProducts = savedProducts ? JSON.parse(savedProducts) : [];
      setProducts(parsedProducts);
    } catch (error) {
      console.error('Ürünler alınamadı:', error);
    }
  };

  const deleteProduct = async (id) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü silmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const newProducts = products.filter((item) => item.id !== id);
            setProducts(newProducts);
            await AsyncStorage.setItem('products', JSON.stringify(newProducts));
          },
        },
      ]
    );
  };

  const parseDate = (str) => {
    const [day, month, year] = str.split('-');
    return new Date(`${year}-${month}-${day}`);
  };

  const renderItem = ({ item }) => {
    const today = new Date();
    const expiryDate = parseDate(item.expiryDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isNearExpiry = diffDays <= 30; // son kullanma tarihi 30 günden az olanlar kırmzıya boyanır

    return (
      <TouchableOpacity
        style={[styles.productItem, isNearExpiry && styles.nearExpiry]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>Son Kullanma: {item.expiryDate}</Text>
          <Text style={[styles.expiryText, isNearExpiry ? styles.nearExpiryText : styles.safeText]}>
            {diffDays > 0 ? `${diffDays} gün kaldı` : 'Süresi geçti!'}
          </Text>
        </View>
        <View style={styles.itemButtons}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('EditProduct', { product: item })}
          >
            <Text style={styles.buttonText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'red' }]}
            onPress={() => deleteProduct(item.id)}
          >
            <Text style={styles.buttonText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.addButtonText}>+ Ürün Ekle</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productItem: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nearExpiry: {
    backgroundColor: '#ffcccc',
  },
  itemContent: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  expiryText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  nearExpiryText: {
    color: 'red',
  },
  safeText: {
    color: 'green',
  },
  itemButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
  },
});
