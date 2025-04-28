import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const emergencyServices = [
    {
      id: 'collision',
      icon: '🚗',
      title: 'Vehicle Collision',
      description: 'Emergency assistance for vehicle accidents or collisions',
      phoneNumbers: ['437-340-1121', '437-340-1122'],
    },
    {
      id: 'window',
      icon: '🪟',
      title: 'Window Damage',
      description: 'Broken windows or window system malfunction',
      phoneNumbers: ['437-340-1133'],
    },
    {
      id: 'lock',
      icon: '🔐',
      title: 'Lock Issues',
      description: 'Car lock or central locking system problems',
      phoneNumbers: ['437-340-1144'],
    },
    {
      id: 'alarm',
      icon: '🚨',
      title: 'Security Alarm',
      description: 'Alarm system malfunction or continuous triggering',
      phoneNumbers: ['437-340-1155', '437-340-1156'],
    },
    {
      id: 'film_damage',
      icon: '📜',
      title: 'Film Damage',
      description: 'Damaged or peeling window film or wrap',
      phoneNumbers: ['437-340-1166'],
    },
    {
      id: 'film_quality',
      icon: '⚠️',
      title: 'Film Quality Issues',
      description: 'Bubbling, discoloration, or other quality concerns',
      phoneNumbers: ['437-340-1177'],
    },
    {
      id: 'overheat',
      icon: '🌡️',
      title: 'Heat Protection',
      description: 'Overheating issues during heat waves',
      phoneNumbers: ['437-340-1188'],
    },
    {
      id: 'other',
      icon: '❓',
      title: 'Other Emergencies',
      description: 'Other situations requiring immediate assistance',
      phoneNumbers: ['437-340-1199'],
    },
  ];

const EmergencyServiceUrgentNonUrgent = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const selectedService = emergencyServices.find(s => s.id === serviceId);

  const handleCall = async () => {
    if (!selectedService?.phoneNumbers || selectedService.phoneNumbers.length === 0) {
      Alert.alert('Error', 'No phone number available for this service.');
      return;
    }
    if (selectedService.phoneNumbers.length === 1) {
      // Only one number, call directly
      try {
        await Linking.openURL(`tel:${selectedService.phoneNumbers[0].replace(/-/g, '')}`);
      } catch {
        Alert.alert('Error', `Unable to make the call. Please dial ${selectedService.phoneNumbers[0]} directly.`);
      }
    } else {
      // Multiple numbers, let user choose
      Alert.alert(
        'Choose a number to call',
        '',
        selectedService.phoneNumbers.map(num => ({
          text: num,
          onPress: async () => {
            try {
              await Linking.openURL(`tel:${num.replace(/-/g, '')}`);
            } catch {
              Alert.alert('Error', `Unable to make the call. Please dial ${num} directly.`);
            }
          }
        })).concat({ text: 'Cancel', style: 'cancel' })
      );
    }
  };

  return (
    <View style={styles.root}>
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.question}>Is this an urgent situation?</Text>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceIcon}>{selectedService?.icon}</Text>
          <Text style={styles.serviceTitle}>{selectedService?.title}</Text>
          <Text style={styles.serviceDesc}>{selectedService?.description}</Text>
        </View>
        <Pressable style={[styles.button, styles.urgent]} onPress={handleCall}>
          <Text style={styles.buttonText}>Yes - Call Now</Text>
          {selectedService?.phoneNumbers?.map((num, idx) => (
            <Text style={styles.phone} key={idx}>{num}</Text>
          ))}
        </Pressable>
        <Pressable
          style={[styles.button, styles.nonUrgent]}
          onPress={() => navigation.navigate('NonUrgentForm', { serviceId })}
        >
          <Text style={styles.buttonText}>No - Submit Report</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#181818' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c70628',
    paddingTop: 48, // for status bar
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  backButton: { marginRight: 8 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },

  content: { flex: 1, alignItems: 'center', padding: 24 },
  question: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' },
  serviceCard: {
    backgroundColor: '#232323',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: { fontSize: 36, marginBottom: 8 },
  serviceTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  serviceDesc: { color: '#bbb', fontSize: 14, textAlign: 'center' },

  button: { borderRadius: 8, padding: 16, marginBottom: 14, alignItems: 'center', width: '100%' },
  urgent: { backgroundColor: '#c70628' },
  nonUrgent: { backgroundColor: '#2c2c2c' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  phone: { color: '#fff', fontSize: 14, marginTop: 4 },
});

export default EmergencyServiceUrgentNonUrgent; 