import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

interface UserInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
}

const UserInfoForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+1'
  });

  const { signOut, user } = useAuthenticator();

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Get the user's ID token for authentication
      const userSub = user?.userId;

      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userSub}`, // Add your auth token here
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: `${formData.countryCode}${formData.phoneNumber.replace(/\D/g, '')}`
        })
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'Information saved successfully!',
          [{ text: 'OK', onPress: () => console.log('Success') }]
        );
      } else {
        throw new Error('Failed to save information');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save information. Please try again.',
        [{ text: 'OK', onPress: () => console.log('Error') }]
      );
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Complete Your Profile</Text>
      
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#7c7c7c"
        value={formData.firstName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#7c7c7c"
        value={formData.lastName}
        onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
      />

      <View style={styles.phoneContainer}>
        <View style={styles.countryCodePicker}>
          <Picker
            selectedValue={formData.countryCode}
            onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
            style={styles.picker}
            dropdownIconColor="#FFFFFF"
          >
            <Picker.Item label="+1" value="+1" color="#FFFFFF" />
            <Picker.Item label="+44" value="+44" color="#FFFFFF" />
            <Picker.Item label="+86" value="+86" color="#FFFFFF" />
            <Picker.Item label="+81" value="+81" color="#FFFFFF" />
          </Picker>
        </View>
        <TextInput
          style={styles.phoneInput}
          placeholder="(XXX) XXX-XXXX"
          placeholderTextColor="#7c7c7c"
          keyboardType="phone-pad"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
        />
      </View>

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#c70628" />
        ) : (
          <>
            <Button
              title="Save Information"
              onPress={handleSubmit}
              color="#c70628"
            />
            <Button
              title="Sign Out"
              onPress={signOut}
              color="#7c7c7c"
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    marginBottom: 15,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  countryCodePicker: {
    width: 100,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    marginRight: 10,
  },
  picker: {
    color: '#FFFFFF',
    height: 50,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  buttonContainer: {
    gap: 10,
    marginTop: 20,
  },
});

export default UserInfoForm; 