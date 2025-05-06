import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 10
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10
  },
  sendButton: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 16
  },
  messageText: {
    fontSize: 16,
    marginVertical: 4
  },
  audioMessage: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginVertical: 4
  }
});
