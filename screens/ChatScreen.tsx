import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { API_URL } from '../config/api';
import { styles } from '../styles/chatStyles';

const ChatScreen = ({ route }: any) => {
  const user = route.params?.user || 'Anonyme';
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages.json`);
      const data = await res.json();
      setMessages(data.reverse());
    } catch (err) {
      console.log('Erreur de chargement des messages', err);
    }
  };

  const sendMessage = async () => {
    if (!text) return;
    const res = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: user, text })
    });
    const data = await res.json();
    if (res.ok) {
      setText('');
      fetchMessages();
    } else {
      Alert.alert('Erreur', data.error || 'Échec');
    }
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission refusée');
          return;
        }
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (error) {
      console.error('Erreur démarrage enregistrement', error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      if (!uri) return;

      const file = {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a'
      };

      const formData = new FormData();
      formData.append('audio', file as any);
      formData.append('sender', user);

      const res = await fetch(`${API_URL}/messages/audio`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        fetchMessages();
      } else {
        Alert.alert('Erreur', 'Échec envoi audio');
      }
    } catch (e) {
      console.error('Erreur stop recording', e);
    } finally {
      setRecording(null);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          item.type === 'text' ? (
            <Text style={styles.messageText}>{item.sender} : {item.text}</Text>
          ) : (
            <Text style={styles.audioMessage} onPress={() => {
              const uri = `${API_URL}${item.audio}`;
              Audio.Sound.createAsync({ uri }).then(({ sound }) => sound.playAsync());
            }}>
              🎤 Audio de {item.sender} — Écouter
            </Text>
          )
        }
      />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Message..." />
        <TouchableOpacity onPress={sendMessage}><Text style={styles.sendButton}>Envoyer</Text></TouchableOpacity>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Text style={styles.sendButton}>{recording ? '⏹️' : '🎙️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;
