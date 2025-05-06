import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { styles } from '../styles/chatStyles';
import { API_URL } from '../config';

type ChatMessage = {
  id: string;
  text?: string;
  audioUrl?: string;
  createdAt: string;
  type: 'text' | 'audio';
};

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const requestMicroPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permission Microphone',
          message: 'Cette app a besoin de votre micro pour enregistrer des messages vocaux.',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Refuser',
          buttonPositive: 'Accepter',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission refusée', 'Impossible d’utiliser le micro.');
      }
    }
  };

  useEffect(() => {
    requestMicroPermission();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/messages`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
    }
  };

  const handleSend = async () => {
    if (message.trim() === '') return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message, type: 'text' }),
      });

      if (response.ok) {
        setMessage('');
        fetchMessages();
      } else {
        Alert.alert('Erreur', 'Impossible d’envoyer le message');
      }
    } catch (error) {
      Alert.alert('Erreur réseau', 'Impossible de joindre le serveur');
    }
  };

  const handleRecord = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission refusée');
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de démarrer l’enregistrement.');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'audioMessage.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('type', 'audio');

      const response = await fetch(`${API_URL}/messages/audio`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchMessages();
      } else {
        Alert.alert('Erreur', 'Envoi audio échoué.');
      }

      setRecording(null);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d’arrêter l’enregistrement.');
    }
  };

  const playAudio = async (uri: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lire l’audio.');
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View style={styles.message}>
      {item.type === 'text' ? (
        <Text>{item.text}</Text>
      ) : (
        <TouchableOpacity onPress={() => playAudio(item.audioUrl!)}>
          <Text style={styles.audioText}>🔊 Écouter le message vocal</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Votre message"
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.buttonText}>📨 Envoyer</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={recording ? handleStopRecording : handleRecord}
        style={styles.recordButton}
      >
        <Text style={styles.buttonText}>
          {recording ? '⏹️ Stop' : '🎤 Enregistrer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatScreen;
