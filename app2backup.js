import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard} from 'react-native';
import Markdown from 'react-native-markdown-display'; // Markdown bileşeni için

export default function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState([]); // Mesajları tutacağımız dizi
  const [inputBackup, setInputBackup] = useState('');

  

  const [isLoading, setIsLoading] = useState(false); // Butonun durumunu kontrol eden yeni state

const sendMessage = async () => {
  if (!input.trim()) return; // Boş mesaj gönderilmesin
  const backup = input;
  setInputBackup(backup); // Yedekleme işlemi
  setIsLoading(true); // Butonu devre dışı bırakıyoruz
  // const apiKey = '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'; // OpenRouter Key //github hesap
  const apiKey = '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'; // OpenRouter Key //cevrimxe mail
  
    // Kullanıcı mesajını ekle
    const userMessage = {
      id: Math.random().toString(36).substring(7),
      text: input,
      sender: 'user',
    };

    setInput('');

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    Keyboard.dismiss(); // Klavyeyi kapat

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
          messages: [{ role: 'user', content: input }],
        }),
      });

      const data = await res.json();

      if (data.choices && data.choices.length > 0) {
        const botMessage = {
          id: Math.random().toString(36).substring(7),
          text: data.choices[0].message.content,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else if (data.error) {
        setResponse(`Hata: ${data.error.message}`);
      } else {
        setResponse('Beklenmeyen bir hata oluştu.');
      }
    } catch (error) {
      console.error(error);
      setResponse('Bir hata oluştu.');
    } finally {
      setIsLoading(false); // Butonu tekrar aktif hale getiriyoruz
      setInput(inputBackup); // Inputu sıfırlıyoruz
    }

    // // Inputu sıfırlama
    setInput('');
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Klavye açıldığında uyum sağlamak için
    >
    <View style={styles.container}>
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
        style={[styles.button, isLoading && styles.buttonDisabled]} // Buton inaktifse stil değişiyor
        onPress={sendMessage}
        disabled={isLoading} // Butonu devre dışı bırakıyoruz
      >
        <Text style={styles.buttonText}>{isLoading ? 'Gönderiliyor...' : 'Gönder'}</Text>
      </TouchableOpacity>
      </View>
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
