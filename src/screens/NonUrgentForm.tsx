import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, TextInput, Alert,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const emergencyServices = [
    {
      id: 'collision',
      icon: '🚗',
      title: 'Vehicle Collision',
      description: 'Emergency assistance for vehicle accidents or collisions'
    },
    {
      id: 'window',
      icon: '🪟',
      title: 'Window Damage',
      description: 'Broken windows or window system malfunction'
    },
    {
      id: 'lock',
      icon: '🔐',
      title: 'Lock Issues',
      description: 'Car lock or central locking system problems'
    },
    {
      id: 'alarm',
      icon: '🚨',
      title: 'Security Alarm',
      description: 'Alarm system malfunction or continuous triggering'
    },
    {
      id: 'film_damage',
      icon: '📜',
      title: 'Film Damage',
      description: 'Damaged or peeling window film or wrap'
    },
    {
      id: 'film_quality',
      icon: '⚠️',
      title: 'Film Quality Issues',
      description: 'Bubbling, discoloration, or other quality concerns'
    },
    {
      id: 'overheat',
      icon: '🌡️',
      title: 'Heat Protection',
      description: 'Overheating issues during heat waves'
    },
    {
      id: 'other',
      icon: '❓',
      title: 'Other Emergencies',
      description: 'Other situations requiring immediate assistance'
    },
  ];

const NonUrgentForm = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const selectedService = emergencyServices.find(s => s.id === serviceId);

  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<{ uri: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.7 });
      if (result.assets && result.assets[0]) setPhoto({ uri: result.assets[0].uri });
    } catch {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
      if (result.assets && result.assets[0]) setPhoto({ uri: result.assets[0].uri });
    } catch {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleAddOrChangePhoto = () => {
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
    setSubmitting(true);
    try {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const imageBase64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      const apiResponse = await fetch('https://xb4ot97nih.execute-api.us-east-2.amazonaws.com/PROD', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: `Emergency - ${selectedService?.title} (Non-Urgent)`,
          image: imageBase64,
          details,
        }),
      });

      if (!apiResponse.ok) throw new Error('Failed to submit report');

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review and respond within 2 business days.',
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Non-Urgent {selectedService?.title} Report</Text>
          <Text style={styles.formDescription}>Take or select a photo and submit your report. We will respond within 2 business days.</Text>
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Pressable style={styles.retakeButton} onPress={handleAddOrChangePhoto}>
                <Text style={styles.buttonText}>Change Photo</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.photoButton} onPress={handleAddOrChangePhoto}>
              <Text style={styles.buttonText}>Add Photo</Text>
            </Pressable>
          )}
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLabel}>Additional Details (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your emergency situation..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={details}
              onChangeText={setDetails}
              textAlignVertical="top"
            />
          </View>
          <Pressable
            style={[styles.submitButton, (!photo || submitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!photo || submitting}
          >
            <Text style={styles.buttonText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040404' },
  formContainer: { padding: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  formDescription: { fontSize: 14, color: '#cccccc', marginBottom: 20 },
  photoContainer: { marginBottom: 16 },
  photo: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  photoButton: { backgroundColor: '#2c2c2c', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 16, flex: 1, marginHorizontal: 4 },
  retakeButton: { backgroundColor: '#2c2c2c', borderRadius: 8, padding: 12, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  textInputContainer: { marginBottom: 16 },
  textInputLabel: { color: '#FFFFFF', fontSize: 14, marginBottom: 8 },
  textInput: { backgroundColor: '#2c2c2c', borderRadius: 8, padding: 12, color: '#FFFFFF', borderWidth: 1, borderColor: '#333', minHeight: 100, maxHeight: 150, fontSize: 14 },
  submitButton: { backgroundColor: '#c70628', borderRadius: 8, padding: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#666', opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default NonUrgentForm; 