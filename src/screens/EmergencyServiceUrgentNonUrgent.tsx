import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchUserAttributes } from 'aws-amplify/auth';

const emergencyServices = [
  {
    id: 'collision',
    icon: '🚗',
    title: 'Vehicle Collision',
    description: 'Emergency assistance for vehicle accidents or collisions',
    phoneNumbers: ['416-990-2218', '416-302-2203'],
  },
  {
    id: 'other',
    icon: '❓',
    title: 'Other Emergencies',
    description: 'Other situations requiring immediate assistance',
    phoneNumbers: ['437-340-1121'],
  },
];

const EmergencyServiceUrgentNonUrgent = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const selectedService = emergencyServices.find(s => s.id === serviceId);
  const [userAttributes, setUserAttributes] = useState(null);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const attrs = await fetchUserAttributes();
        setUserAttributes(attrs);
      } catch (error) {
        console.log('Error fetching user attributes:', error);
      }
    };
    fetchAttributes();
  }, []);

  const sendReferenceApi = async (phoneNumber) => {
    if (!userAttributes) return;
    console.log('sendReferenceApi: phoneNumber', phoneNumber);
    console.log('sendReferenceApi: userAttributes', userAttributes);
    try {
      await fetch('https://rlnduprsc5.execute-api.us-east-2.amazonaws.com/PROD', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userAttributes.sub,
          userName: userAttributes.name,
          userEmail: userAttributes.email,
          userPhone: userAttributes.phone_number,
          serviceType: selectedService?.title,
          servicePhoneNumber: phoneNumber,
        }),
      });
    } catch (error) {
      console.log('Error sending reference data:', error);
    }
  };

  const makePhoneCall = async (phoneNumber) => {
    try {
      const supported = await Linking.canOpenURL(`tel:${phoneNumber.replace(/-/g, '')}`);
      
      if (supported) {
        await Linking.openURL(`tel:${phoneNumber.replace(/-/g, '')}`);

        // 彈出確認視窗，打完電話後按「Yes」才 send
        Alert.alert(
          'Call Completed?',
          'Have you completed the call?',
          [
            {
              text: 'Yes',
              onPress: async () => {
                await sendReferenceApi(phoneNumber);
              },
            },
            {
              text: 'No',
              style: 'cancel',
            },
          ]
        );

        return true;
      } else {
        Alert.alert('Error', 'Phone calls are not supported on this device.');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', `Unable to make the call. Please dial ${phoneNumber} directly.`);
      return false;
    }
  };

  const handleCall = async () => {
    if (!selectedService?.phoneNumbers || selectedService.phoneNumbers.length === 0) {
      Alert.alert('Error', 'No phone number available for this service.');
      return;
    }

    if (selectedService.phoneNumbers.length === 1) {
      await makePhoneCall(selectedService.phoneNumbers[0]);
    } else {
      Alert.alert(
        'Choose a number to call',
        '',
        selectedService.phoneNumbers.map(num => ({
          text: num,
          onPress: async () => {
            await makePhoneCall(num);
          },
        })).concat({ text: 'Cancel', style: 'cancel' })
      );
    }
  };

  return (
    <View style={styles.root}>
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
