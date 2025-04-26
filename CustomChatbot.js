import React, { useState, useRef } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Audio } from 'expo-av';
import ingredients from './ingredients'; // Eğer aynı klasördeyse


export default function CustomChatbot() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const soundRef = useRef(null);

  const [items, setItems] = useState(ingredients);

  const handleItemSelect = (item) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.some((selectedItem) => selectedItem.id === item.id)) {
        return prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id);
      }
      return [...prevSelectedItems, item];
    });
  };

  const typeMessage = (fullText) => {
    let currentText = '';
    const characters = fullText.split('');
    let index = 0;

    const interval = setInterval(() => {
      if (index < characters.length) {
        currentText += characters[index];
        index++;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].text = currentText;
          return updatedMessages;
        });
      } else {
        clearInterval(interval);
      }
    }, 10);
  };

  const playLoadingSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./loading-sound.mp3') // Ses dosyasını projenin assets klasörüne koyman lazım
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  };

  const stopLoadingSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const sendMessage = async () => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    setIsDropdownOpen(false);

    const loadingMessage = {
      id: Math.random().toString(36).substring(7),
      text: 'Yükleniyor...',
      sender: 'bot',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    await playLoadingSound();

    try {
      const apiKey = 'just ask to ahmet if you need';

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [
            {
              role: 'system',
              content: `Lütfen aşağıdaki malzemelerle bir yemek tarifi önerisi verin: ${selectedItems.map(item => item.title).join(', ')}`,
            },
          ],
        }),
      });

      const data = await res.json();

      await stopLoadingSound();

      if (data.choices && data.choices.length > 0) {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.text !== 'Yükleniyor...'));

        const botMessage = {
          id: Math.random().toString(36).substring(7),
          text: data.choices[0].message.content.trim(),
          sender: 'bot',
        };

        setMessages((prevMessages) => [...prevMessages, botMessage]);
        typeMessage(botMessage.text);
      } else if (data.error) {
        setResponse(`Hata: ${data.error.message}`);
      } else {
        setResponse('Beklenmeyen bir hata oluştu.');
      }
    } catch (error) {
      console.error(error);
      setResponse('Bir hata oluştu.');
      await stopLoadingSound();
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessages = () => {
    return messages.map((message) => (
      <View
        key={message.id}
        style={[styles.messageContainer, message.sender === 'user' ? styles.userMessage : styles.botMessage]}
      >
        <Markdown style={styles.messageText}>{message.text}</Markdown>
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.messageList}>
        {renderMessages()}
        {response && (
          <View style={styles.botMessage}>
            <Text style={styles.messageText}>{response}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setIsDropdownOpen(!isDropdownOpen)} style={styles.dropdownButton}>
          <Text style={styles.buttonText}>
            {selectedItems.length > 0 ? selectedItems.map(item => item.title).join(', ') : 'Bir veya daha fazla malzeme seçin'}
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdownList}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemSelect(item)}
                style={styles.dropdownItem}
              >
                <Text style={styles.dropdownText}>
                  {selectedItems.some((selectedItem) => selectedItem.id === item.id) ? `✓ ${item.title}` : item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Gönderiliyor...' : 'Tarif Al'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 20,
  },
  messageList: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 15,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#a9dff9',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: '#000000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'column',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  dropdownButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
});
