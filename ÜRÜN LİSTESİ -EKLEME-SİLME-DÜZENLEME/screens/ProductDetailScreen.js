import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const parseDate = (str) => {
  const [day, month, year] = str.split('-');
  return new Date(`${year}-${month}-${day}`);
};

const ProductDetailScreen = () => {
  const route = useRoute();
  const { product } = route.params;

  const today = new Date();
  const expiry = parseDate(product.expiryDate);
  const diffTime = expiry - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.label}>Son Kullanma Tarihi:</Text>
      <Text style={styles.value}>{product.expiryDate}</Text>
      <Text style={[styles.daysLeft, daysLeft <= 3 ? styles.nearExpiry : styles.safe]}>
        {daysLeft > 0
          ? `${daysLeft} gün kaldı`
          : `Ürünün süresi geçmiş!`}
      </Text>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 18, marginBottom: 5 },
  value: { fontSize: 16, color: '#555' },
  daysLeft: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  nearExpiry: {
    color: 'red',
  },
  safe: {
    color: 'green',
  },
});
