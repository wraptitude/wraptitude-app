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
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { launchImageLibrary } from 'react-native-image-picker';

// Add props interface
interface FreeQuoteProps {
  selectedService?: string;
}

const FreeQuote: React.FC<FreeQuoteProps> = ({ selectedService }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: selectedService || 'Window Tinting',
    message: '',
    image: null as null | { uri: string },
  });

  const [loading, setLoading] = useState(false);

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

  // Update the selectedService when it changes
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceType: selectedService
      }));
    }
  }, [selectedService]);

  const services = [
    'Window Tinting',
    'Vinyl Wrap',
    'Ceramic Coating',
    'Paint Protection Film (PPF)',
  ];

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields (Name, Email, Phone)',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64 if it exists
      let imageBase64 = null;
      console.log('123')
      if (formData.image) {
        const response = await fetch(formData.image.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      console.log('456')
      const response = await fetch('https://xb4ot97nih.execute-api.us-east-2.amazonaws.com/PROD', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          serviceType: formData.serviceType,
          message: formData.message,
          image: imageBase64, // Send base64 string
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit quote request: ${response.status} ${errorText}`);
      }

      Alert.alert(
        'Quote Request Sent',
        'Thank you for your interest! We will contact you shortly with a detailed quote.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to submit quote request. Please try again later.',
        [{ text: 'OK' }]
      );
      console.error('Error submitting quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.01,
    });

    if (result.assets && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        image: { uri: result.assets[0].uri }
      }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>GET YOUR FREE QUOTE</Text>
          <Text style={styles.description}>
            Fill out the form below and we'll provide you with a detailed quote for your vehicle enhancement needs.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.form}>
            {/* Personal Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
              </View>
            </View>

            {/* Vehicle Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Make</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., BMW, Tesla, Porsche"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={formData.vehicleMake}
                  onChangeText={(text) => setFormData({ ...formData, vehicleMake: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Model</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Model 3, M3, 911"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={formData.vehicleModel}
                  onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2024"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="numeric"
                  value={formData.vehicleYear}
                  onChangeText={(text) => setFormData({ ...formData, vehicleYear: text })}
                />
              </View>
            </View>

            {/* Service Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Service Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.serviceType}
                    style={styles.picker}
                    dropdownIconColor="#fff"
                    onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
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
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  multiline
                  numberOfLines={4}
                  value={formData.message}
                  onChangeText={(text) => setFormData({ ...formData, message: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Image</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.imageUploadButton,
                    // pressed && styles.buttonPressed
                  ]}
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
            </View>

            {/* Submit Button Container */}
            {/* <View style={styles.submitButtonContainer}>
              <TouchableOpacity 
                style={({ pressed }) => [
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                  pressed && styles.buttonPressed
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text style={styles.loadingText}>
                      Submitting request...{"\n"}This may take a few moments
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>GET YOUR QUOTE</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View> */}
            <View style={styles.inputGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.getQuoteButton,
                  // pressed && styles.buttonPressed,
                  loading && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.imageUploadText}>
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text style={styles.loadingText}>
                      Submitting request...{"\n"}This may take a few moments
                    </Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>GET YOUR QUOTE</Text>
                  </View>
                )}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'transparent',
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for footer
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  formCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    margin: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  formSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  required: {
    color: '#c70628',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
  },
  imageUploadButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageUploadText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  getQuoteButton: {
    backgroundColor: '#b30523',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    backgroundColor: '#b30523',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default FreeQuote; 
