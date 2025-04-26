import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MainScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Button
        title="AI Chatbot"
        onPress={() => navigation.navigate('AIChatbot')} // AI Chatbot ekranına yönlendir
      />
      <Button
        title="Custom Chatbot"
        onPress={() => navigation.navigate('CustomChatbot')} // Kullanıcı verisiyle chatbot ekranına yönlendir
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
