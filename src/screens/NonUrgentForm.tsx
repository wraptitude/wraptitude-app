import React, { useState, useEffect, useRef } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image, 
  TextInput, 
  Alert,
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define props interface
interface NonUrgentFormProps {
  serviceId: string;
  onGoBack: () => void;
  onSubmitSuccess: () => void;
}

const emergencyServices = [
  {
    id: 'collision',
    icon: 'car-crash',
    title: '車輛碰撞',
    description: '車輛事故或碰撞的緊急協助'
  },
  {
    id: 'other',
    icon: 'help',
    title: '其他緊急情況',
    description: '需要立即協助的其他情況'
  },
];

const NonUrgentForm: React.FC<NonUrgentFormProps> = ({ 
  serviceId, 
  onGoBack,
  onSubmitSuccess
}) => {
  const selectedService = emergencyServices.find(s => s.id === serviceId);

  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userAttributes, setUserAttributes] = useState<any>(null);
  
  // Animation refs for buttons
  const takePhotoButtonScale = useRef(new Animated.Value(1)).current;
  const submitButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const attrs = await fetchUserAttributes();
        setUserAttributes(attrs);
      } catch {
        Alert.alert('錯誤', '無法獲取用戶資訊。');
      }
    };
    fetchAttributes();
  }, []);

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.7 });
      if (result.assets && result.assets[0]) setPhoto({ uri: result.assets[0].uri });
    } catch {
      Alert.alert('錯誤', '拍照失敗。請重試。');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
      if (result.assets && result.assets[0]) setPhoto({ uri: result.assets[0].uri });
    } catch {
      Alert.alert('錯誤', '選擇圖片失敗。請重試。');
    }
  };

  const handleAddOrChangePhoto = () => {
    animatePress(takePhotoButtonScale);
    
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Pick Image',
          onPress: handlePickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert('Photo Required', 'Please take or select a photo before submitting.');
      return;
    }
    if (!userAttributes) {
      Alert.alert('User Info Missing', 'User information is required to submit the report.');
      return;
    }
    
    animatePress(submitButtonScale);
    setSubmitting(true);
    
    try {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const apiResponse = await fetch('https://x58qaqacwc.execute-api.us-east-2.amazonaws.com/PROD', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userAttributes.sub,
          name: userAttributes.name,
          email: userAttributes.email,
          phone: userAttributes.phone_number,
          serviceType: `Emergency - ${selectedService?.title} (Non-Urgent)`,
          image: imageBase64,
          details,
        }),
      });

      if (!apiResponse.ok) throw new Error('Failed to submit report');

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review and respond within 2 business days.',
        [{ text: 'OK', onPress: onSubmitSuccess }]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Non-Urgent Report</Text>
            <Text style={styles.subtitle}>{selectedService?.title}</Text>
            <Text style={styles.description}>
              Submit a report with photo evidence for non-urgent situations. 
              Our team will review and respond within 2 business days.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Icon name="photo-camera" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Photo Evidence</Text>
            </View>
            
            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <Animated.View style={{
                  transform: [{ scale: takePhotoButtonScale }],
                  width: '100%',
                }}>
                  <Pressable 
                    style={styles.changePhotoButton} 
                    onPress={handleAddOrChangePhoto}
                  >
                    <Icon name="photo-camera" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Change Photo</Text>
                  </Pressable>
                </Animated.View>
              </View>
            ) : (
              <View style={styles.noPhotoContainer}>
                <Icon name="photo-camera" size={40} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.noPhotoText}>No photo added yet</Text>
                <Animated.View style={{
                  transform: [{ scale: takePhotoButtonScale }],
                  width: '100%',
                }}>
                  <Pressable 
                    style={styles.addPhotoButton} 
                    onPress={handleAddOrChangePhoto}
                  >
                    <Icon name="add-a-photo" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Add Photo</Text>
                  </Pressable>
                </Animated.View>
              </View>
            )}
          </View>

          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Icon name="notes" size={20} color="#FFFFFF" />
              <Text style={styles.sectionTitle}>Additional Details</Text>
            </View>
            
            <Text style={styles.inputLabel}>Describe your situation (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Provide details about your emergency situation..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Icon name="info" size={20} color="#c70628" />
              <Text style={styles.infoTitle}>Submission Information</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={16} color="#c70628" />
              <Text style={styles.infoText}>Report will be reviewed within 2 business days</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={16} color="#c70628" />
              <Text style={styles.infoText}>You will be contacted by our team via email or phone</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={16} color="#c70628" />
              <Text style={styles.infoText}>Clear photos help us process your report faster</Text>
            </View>
          </View>

          <Animated.View style={{
            transform: [{ scale: submitButtonScale }],
            width: '100%',
            padding: 16,
            marginBottom: 20,
          }}>
            <Pressable
              style={[
                styles.submitButton, 
                (!photo || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!photo || submitting}
            >
              {submitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loadingText}>Submitting report...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="send" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </View>
              )}
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* <Pressable style={styles.backButton} onPress={onGoBack}>
        <Icon name="arrow-back" size={20} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable> */}
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
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#c70628',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  formCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 16,
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
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  photoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  noPhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    gap: 12,
  },
  noPhotoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  addPhotoButton: {
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(199, 6, 40, 0.5)',
    width: '100%',
  },
  changePhotoButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#A0A0A0',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#c70628',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(120, 120, 120, 0.5)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NonUrgentForm; 