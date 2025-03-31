import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';

const FreeQuote: React.FC = () => {
  const route = useRoute();
  const selectedService = route.params?.selectedService;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: selectedService || 'Window Tinting',
    // serviceType: 'Window Tinting',
    message: '',
    image: null as null | { uri: string },
  });

  useEffect(() => {
    (async () => {
      const userAttributes = await fetchUserAttributes();
      if (userAttributes) {
        setFormData(prevData => ({
          ...prevData,
          name: userAttributes.name || '',
          email: userAttributes.email || '',
          phone: userAttributes.phone_number?.replace('+1', '') || '',
        }));
      }
    })();
  }, []);

  const services = [
    'Window Tinting',
    'Vinyl Wrap',
    'Ceramic Coating',
    'Paint Protection Film (PPF)',
  ];

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (Name, Email, Phone)',
        [{ text: 'OK' }]
      );
      return;
    }

    // Here you would typically send the data to your backend
    Alert.alert(
      'Quote Request Sent',
      'Thank you for your interest! We will contact you shortly with a detailed quote.',
      [{ text: 'OK' }]
    );
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        image: { uri: result.assets[0].uri }
      }));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Get Your Free Quote</Text>
        <Text style={styles.description}>
          Fill out the form below and we'll provide you with a detailed quote for your vehicle enhancement needs.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, formData.name ? styles.filledInput : null]}
              placeholder="Enter your name"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, formData.email ? styles.filledInput : null]}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, formData.phone ? styles.filledInput : null]}
              placeholder="Enter your phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Make</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., BMW, Tesla, Porsche"
              placeholderTextColor="#666"
              value={formData.vehicleMake}
              onChangeText={(text) => setFormData({...formData, vehicleMake: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Model</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Model 3, M3, 911"
              placeholderTextColor="#666"
              value={formData.vehicleModel}
              onChangeText={(text) => setFormData({...formData, vehicleModel: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Year</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2024"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.vehicleYear}
              onChangeText={(text) => setFormData({...formData, vehicleYear: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.serviceType}
                style={styles.picker}
                dropdownIconColor="#fff"
                onValueChange={(value) => setFormData({...formData, serviceType: value})}
              >
                {services.map((service) => (
                  <Picker.Item 
                    key={service} 
                    label={service} 
                    value={service}
                    color="#FFFFFF"
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us more about your requirements"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={formData.message}
              onChangeText={(text) => setFormData({...formData, message: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Upload Vehicle Image</Text>
            <Pressable 
              style={styles.imageUploadButton} 
              onPress={handleImagePick}
            >
              <Text style={styles.imageUploadText}>
                {formData.image ? 'Change Image' : 'Select Image'}
              </Text>
            </Pressable>
            {formData.image && (
              <Image 
                source={formData.image} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </View>

          <Pressable 
            style={styles.submitButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Get Quote</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  submitButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  required: {
    color: '#c70628',
    fontSize: 14,
  },
  filledInput: {
    borderColor: '#c70628',
    backgroundColor: 'rgba(199,6,40,0.1)',
  },
  imageUploadButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageUploadText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default FreeQuote; 