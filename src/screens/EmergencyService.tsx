import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const emergencyServices = [
  {
    id: 'collision',
    icon: '🚗',
    title: 'Vehicle Collision',
    description: 'Emergency assistance for vehicle accidents or collisions'
  },
  {
    id: 'other',
    icon: '❓',
    title: 'Other Emergencies',
    description: 'Other situations requiring immediate assistance'
  },
];

const EmergencyService = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState('');

  const handleEmergencyCall = async () => {
    try {
      await Linking.openURL('tel:4373401121');
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to make the call. Please dial 437-340-1121 directly.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Services</Text>
        <Text style={styles.headerDescription}>
          Select the type of emergency you're experiencing
        </Text>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedService}
          onValueChange={(value) => {
            setSelectedService(value);
            if (value) {
              navigation.navigate('EmergencyServiceUrgentNonUrgent', { serviceId: value });
            }
          }}
          style={styles.picker}
          dropdownIconColor="#FFFFFF"
        >
          <Picker.Item label="Select a service..." value="" color="#FFFFFF" />
          {emergencyServices.map((service) => (
            <Picker.Item
              key={service.id}
              label={`${service.icon} ${service.title}`}
              value={service.id}
              color="#FFFFFF"
            />
          ))}
        </Picker>
      </View>

      {/* <View style={styles.servicesContainer}>
        {emergencyServices.map((service) => (
          <Pressable
            key={service.id}
            style={styles.serviceCard}
            onPress={handleEmergencyCall}
          >
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <View style={styles.callButton}>
              <Text style={styles.callButtonText}>Call Now</Text>
              <Text style={styles.phoneNumber}>437-340-1121</Text>
            </View>
          </Pressable>
        ))}
      </View> */}

      {/* <View style={styles.footer}>
        <Text style={styles.footerText}>
          24/7 Emergency Service Hotline
        </Text>
        <Pressable
          style={styles.mainCallButton}
          onPress={handleEmergencyCall}
        >
          <Text style={styles.mainCallButtonText}>437-340-1121</Text>
        </Pressable>
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 24,
  },
  pickerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
  },
  servicesContainer: {
    padding: 20,
  },
  serviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 16,
  },
  callButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  phoneNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  footerText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 12,
  },
  mainCallButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  mainCallButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default EmergencyService; 