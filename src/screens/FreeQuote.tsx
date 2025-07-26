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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Update the props interface
interface FreeQuoteProps {
  selectedService?: string;
  onGoBack?: () => void;  // Optional callback for going back
}

const FreeQuote: React.FC<FreeQuoteProps> = ({ 
  selectedService,
  onGoBack 
}) => {
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
    '車窗貼膜',
    '車身貼膜',
    '陶瓷鍍膜',
    '漆面保護膜 (PPF)',
  ];

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert(
        '缺少資訊',
        '請填寫所有必填欄位（姓名、電子郵件、電話）',
        [{ text: '確定' }]
      );
      return;
    }

    try {
      setLoading(true);

      // Convert image to base64 if it exists
      let imageBase64 = null;
      if (formData.image) {
        const response = await fetch(formData.image.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      
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
        '報價申請已送出',
        '感謝您的興趣！我們將盡快與您聯繫，提供詳細報價。',
        [{ text: '確定' }]
      );

    } catch (error) {
      Alert.alert(
        '錯誤',
        '報價申請失敗。請稍後再試。',
        [{ text: '確定' }]
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
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>GET YOUR FREE QUOTE</Text>
          <Text style={styles.description}>
            Fill out the form below and we'll provide you with a detailed quote for your vehicle enhancement needs.
          </Text>
        </View>

        {/* Form Sections as Cards */}
        <View style={styles.formSectionsContainer}>
          {/* Personal Information Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Icon name="person" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            
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

          {/* Vehicle Information Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Icon name="directions-car" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
            </View>
            
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

          {/* Service Details Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Icon name="build" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Service Details</Text>
            </View>
            
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
                  pressed && styles.buttonPressed
                ]}
                onPress={handleImagePick}
              >
                <Icon name="photo-camera" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>
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

          {/* Submit Button */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
              loading && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.loadingText}>Submitting request...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Icon name="send" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.submitButtonText}>SUBMIT QUOTE REQUEST</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for footer
  },
  headerSection: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  formSectionsContainer: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#A0A0A0',
    fontWeight: '500',
    marginBottom: 6,
  },
  required: {
    color: '#c70628',
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 100,
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
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 12,
  },
  submitButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    backgroundColor: '#b30523',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FreeQuote; 
