import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../config/api';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        navigation.navigate('Home', { user: email });
      } else {
        Alert.alert('Erreur', data.error || 'Connexion échouée');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Serveur inaccessible');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
      <TextInput style={styles.input} placeholder="Mot de passe" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Connexion" onPress={handleLogin} />
      <Button title="Mot de passe oublié ?" onPress={() => navigation.navigate('ForgotPassword')} />
      <Button title="Créer un compte" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 }
});
