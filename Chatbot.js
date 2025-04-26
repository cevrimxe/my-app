import React, { useState, useRef} from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
import Markdown from 'react-native-markdown-display'; // Markdown bileşeni için
import { Audio } from 'expo-av';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([]); // Mesajları tutacağımız dizi
  const [inputBackup, setInputBackup] = useState('');
  const soundRef = useRef(null);

  

  const [isLoading, setIsLoading] = useState(false); // Butonun durumunu kontrol eden yeni state



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
    if (!input.trim()) return;
  
    const backup = input;
    setInputBackup(backup);
    setIsLoading(true);
  
    const apiKey = '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';
  
    const userMessage = {
      id: Math.random().toString(36).substring(7),
      text: input,
      sender: 'user',
    };
  
    setInput('');
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    Keyboard.dismiss();
  
    await playLoadingSound(); // -> önce sesi başlat
  
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://example.com',
          'X-Title': 'MyChatApp',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-exp:free',
          messages: [{ role: 'user', content: backup }],
        }),
      });
  
      const data = await res.json();
  
      await stopLoadingSound(); // -> sonra sesi durdur
  
      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          id: Math.random().toString(36).substring(7),
          text: '',
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        typeMessage(data.choices[0].message.content.trim());
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
      setInput(inputBackup);
    }
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
          // Son eklenen bot mesajını güncelliyoruz
          updatedMessages[updatedMessages.length - 1].text = currentText;
          return updatedMessages;
        });
      } else {
        clearInterval(interval); // Yazma tamamlandı
      }
    }, 10); // Karakter arası hız (ms) - ayarlayabilirsin
  };
  

  const renderMessages = () => {
    return messages.map((message) => (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.sender === 'user' ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Markdown style={styles.messageText}>{message.text}</Markdown>
      </View>
    ));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // opsiyonel, bazen gerekebilir
    >
        <ScrollView contentContainerStyle={styles.messageList}>
          {renderMessages()}
          {response && (
            <View style={styles.botMessage}>
              <Text style={styles.messageText}>{response}</Text>
            </View>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Sorunuzu yazın"
            placeholderTextColor="#888"
            style={styles.input}
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={sendMessage}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Gönderiliyor...' : 'Gönder'}
            </Text>
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
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    color: '#000',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
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
