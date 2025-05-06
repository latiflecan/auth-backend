import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation, route }: any) => {
  const user = route.params?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenue, {user || 'utilisateur'} !</Text>
      <Button title="Accéder au chat" onPress={() => navigation.navigate('Chat', { user })} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  welcome: { fontSize: 20, marginBottom: 20 }
});
