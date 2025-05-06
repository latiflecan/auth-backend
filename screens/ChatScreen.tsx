import React, { useEffect, useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Audio } from 'expo-av';
import uuid from 'react-native-uuid';

interface Message {
  id: string;
  text?: string;
  audioUrl?: string;
  createdAt: Date;
  type: 'text' | 'audio';
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Message[];
        setMessages(fetchedMessages);
      });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim()) {
      await firestore().collection('messages').add({
        text: inputText,
        createdAt: new Date(),
        type: 'text'
      });
      setInputText('');
    }
  };

  const askMicroPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permission Microphone',
          message: 'L’application a besoin de votre permission pour enregistrer de l’audio',
          buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await askMicroPermission();
    if (!hasPermission) return;

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Erreur en démarrant l’enregistrement', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const id = uuid.v4().toString();

      await firestore().collection('messages').add({
        audioUrl: uri,
        createdAt: new Date(),
        type: 'audio'
      });

      setRecording(null);
    } catch (err) {
      console.error('Erreur à l’arrêt de l’enregistrement', err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        inverted
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.message}>
            {item.type === 'text' ? (
              <Text>{item.text}</Text>
            ) : (
              <Text style={styles.audioText}>🎵 Audio message</Text>
            )}
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Tapez un message"
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Envoyer" onPress={sendMessage} />
      <Button title={isRecording ? 'Arrêter' : 'Enregistrer Audio'} onPress={isRecording ? stopRecording : startRecording} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff'
  },
  message: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 10,
    borderRadius: 4
  },
  audioText: {
    color: '#007AFF',
    fontWeight: 'bold'
  }
});
