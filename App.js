import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import ReactNativeBiometrics from 'react-native-biometrics';
import KeyStore, {ACCESSIBLE} from 'react-native-secure-key-store';
import * as SecureStore from 'expo-secure-store';

const App = () => {
  const [note, setNote] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [storeKey, setStoreKey] = useState('');

  useEffect(() => {
    ReactNativeBiometrics.biometricKeysExist().then((resultObject) => {
      const {keysExist} = resultObject;
      if (keysExist) {
        setIsRegistered(true);
      } else {
        createKeys();
      }
    });
  });

  const handleLogin = async () => {
    if (!isLogged) {
      ReactNativeBiometrics.createSignature({
        promptMessage: 'Sign in',
        payload: 'logging',
      }).then((resultObject) => {
        const {success, signature} = resultObject;
        if (success) {
          const newKey = signature.replace(/[^\w]/g, '');
          setStoreKey(newKey);
          setIsLogged(true);
          readTest();
        }
      });
    } else {
      setIsLogged(false);
      setNote('');
      setStoreKey('');
    }
  };

  const handleDelete = async () => {
    try {
      await SecureStore.deleteItemAsync(storeKey);
      setNote('');
    } catch (e) {
      console.log(e);
    }
  };

  const handleSave = async () => {
    handleRemember(storeKey, note);
  };

  const handleNoteChange = (text) => {
    if (isLogged === true) {
      setNote(text);
    } else {
      Alert.alert('You are not logged in.');
    }
  };

  const createKeys = async () => {
    ReactNativeBiometrics.createKeys('Confirm fingerprint').then(
      (resultObject) => {
        const {publicKey} = resultObject;
      },
    );
  };
  const readTest = async () => {
    handleRead();
  };

  handleRemember = async (key, val) => {
    try {
      await SecureStore.setItemAsync(key, val);
    } catch (e) {
      console.log(e);
    }
  };

  handleRead = async () => {
    console.log(storeKey);
    try {
      const val = await SecureStore.getItemAsync(storeKey);
      if (val) {
        setNote(val);
      } else {
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SECRET NOTEPAD</Text>
      <TextInput
        style={styles.note}
        multiline={true}
        textAlignVertical={'top'}
        value={note}
        onChangeText={(text) => handleNoteChange(text)}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => handleLogin()}>
        <Text style={styles.submitButtonText}>
          {' '}
          {isLogged ? 'Logout' : 'Login'}{' '}
        </Text>
      </TouchableOpacity>

      {isLogged && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleSave()}>
          <Text style={styles.submitButtonText}> Save </Text>
        </TouchableOpacity>
      )}
      {isLogged && (
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleDelete()}>
          <Text style={styles.submitButtonText}> Delete </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  login: {
    display: 'flex',
    flexDirection: 'row',
  },
  header: {
    marginTop: 40,
    fontSize: 40,
    fontWeight: 'bold',
  },
  password: {
    margin: 4,
    height: 40,
    width: 180,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#000000',
    padding: 10,
    margin: 7,
    height: 40,
    width: 150,
  },
  submitButtonText: {
    color: 'white',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  note: {
    height: 500,
    width: 350,
    marginTop: 20,
    fontSize: 25,
    borderColor: 'gray',
    borderWidth: 1,
    overflow: 'scroll',
    padding: 10,
  },
});

export default App;
