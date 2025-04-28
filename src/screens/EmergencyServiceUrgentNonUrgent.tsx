import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';

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

const EmergencyServiceUrgentNonUrgent = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const selectedService = emergencyServices.find(s => s.id === serviceId);

  const handleCall = async () => {
    try {
      await Linking.openURL('tel:4373401121');
    } catch {
      Alert.alert('Error', 'Unable to make the call. Please dial 437-340-1121 directly.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Is this an urgent situation?</Text>
      <Text style={styles.service}>{selectedService?.icon} {selectedService?.title}</Text>
      <Pressable style={[styles.button, styles.urgent]} onPress={handleCall}>
        <Text style={styles.buttonText}>Yes - Call Now</Text>
        <Text style={styles.phone}>437-340-1121</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.nonUrgent]} onPress={() => navigation.navigate('NonUrgentForm', { serviceId })}>
        <Text style={styles.buttonText}>No - Submit Report</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040404', justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  service: { color: '#ccc', fontSize: 16, marginBottom: 24 },
  button: { borderRadius: 8, padding: 16, marginBottom: 12, alignItems: 'center', width: '100%' },
  urgent: { backgroundColor: '#c70628' },
  nonUrgent: { backgroundColor: '#2c2c2c' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  phone: { color: '#fff', fontSize: 14, marginTop: 4 },
});

export default EmergencyServiceUrgentNonUrgent; 