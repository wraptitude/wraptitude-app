import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useBranch } from '../branch/BranchContext';
import { branchApi, publicBranchApi } from '../branch/api';
import { colors } from '../styles/theme';

// Update the props interface
interface FreeQuoteProps {
  selectedService?: string;
  onGoBack?: () => void;  // Optional callback for going back
}

const FreeQuote: React.FC<FreeQuoteProps> = ({
  selectedService,
  onGoBack,
}) => {
  const { branchId, branch } = useBranch();
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
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        setFormData(prevData => ({
          ...prevData,
          name: userAttributes.name || '',
          email: userAttributes.email || '',
          phone: userAttributes.phone_number?.replace('+1', '') || '',
        }));
      } catch {
        // Guest quotes collect contact details in the form.
      }
    })();
  }, []);

  // Update the selectedService when it changes
  useEffect(() => {
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceType: selectedService,
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setFormError('Please add your name, email and phone number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid phone number.');
      return;
    }

    try {
      setFormError(null);
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

      const payload = {
        branchId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: formData.vehicleYear,
        serviceType: formData.serviceType,
        message: formData.message,
        image: imageBase64,
      };
      const session = await fetchAuthSession();
      const submit = session.tokens?.idToken ? branchApi : publicBranchApi;
      await submit('/' + (session.tokens?.idToken ? 'customer' : 'public') + '/quotes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSubmitted(true);

    } catch (error) {
      setFormError('Your request could not be sent. Please try again.');
      console.error('Error submitting quote:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}><Icon name="check" size={34} color={colors.text} /></View>
        <Text style={styles.successTitle}>Request sent</Text>
        <Text style={styles.successText}>
          Your {branch.name} quote request is on its way. Our team will contact you using the details you provided.
        </Text>
        <Pressable
          style={styles.successButton}
          onPress={() => onGoBack ? onGoBack() : setSubmitted(false)}
          accessibilityRole="button"
        >
          <Text style={styles.successButtonText}>{onGoBack ? 'Continue exploring' : 'Start another quote'}</Text>
        </Pressable>
      </View>
    );
  }

  const handleImagePick = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.1,
    });

    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setFormData(prev => ({
        ...prev,
        image: { uri },
      }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <View style={styles.branchBadge}>
            <Icon name="place" size={16} color={colors.redLight} />
            <Text style={styles.branchBadgeText}>{branch.name} location</Text>
          </View>
          <Text style={styles.title}>Tell us about your car.</Text>
          <Text style={styles.description}>
            Share a few details and our {branch.name} team will get back to you with a free quote.
          </Text>
        </View>

        {formError && (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Icon name="error-outline" size={19} color={colors.redLight} />
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}

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
                autoComplete="name"
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
                autoComplete="email"
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
                autoComplete="tel"
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
              <Text style={styles.label}>Vehicle Image <Text style={styles.optional}>(optional)</Text></Text>
              <Pressable
                style={({ pressed }) => [
                  styles.imageUploadButton,
                  pressed && styles.buttonPressed,
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
              loading && styles.buttonDisabled,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 14,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    lineHeight: 35,
  },
  description: {
    fontSize: 15,
    color: colors.muted,
    lineHeight: 22,
  },
  branchBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.redTint, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 13 },
  branchBadgeText: { color: colors.redLight, fontSize: 12, fontWeight: '700', marginLeft: 4 },
  errorBanner: { marginHorizontal: 16, marginBottom: 2, borderWidth: 1, borderColor: '#71313D', backgroundColor: colors.redTint, borderRadius: 12, padding: 13, flexDirection: 'row', alignItems: 'center' },
  errorText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20, marginLeft: 10 },
  formSectionsContainer: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  optional: { color: colors.muted, fontWeight: '400' },
  required: {
    color: '#c70628',
  },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 11,
    padding: 12,
    minHeight: 50,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.red,
    borderRadius: 12,
    padding: 16,
    minHeight: 54,
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
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  successTitle: { color: colors.text, fontSize: 28, fontWeight: '800' },
  successText: { color: colors.muted, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12, marginBottom: 26 },
  successButton: { backgroundColor: colors.red, minHeight: 52, width: '100%', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  successButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});

export default FreeQuote;
