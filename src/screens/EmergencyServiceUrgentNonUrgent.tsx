import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Linking, 
  Alert, 
  ScrollView, 
  Animated, 
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchUserAttributes } from 'aws-amplify/auth';

// Define props interface
interface EmergencyServiceUrgentNonUrgentProps {
  serviceId: string;
  onNonUrgentSelect: () => void;
  onGoBack: () => void;
}

const emergencyServices = [
  {
    id: 'collision',
    icon: 'car-crash',
    iconFallback: '🚗',
    title: '車輛碰撞',
    description: '車輛事故或碰撞的緊急協助',
    phoneNumbers: ['647-836-8026', '416-990-2218', '416-302-2203'],
  },
  {
    id: 'other',
    icon: 'help',
    iconFallback: '❓',
    title: '其他緊急情況',
    description: '需要立即協助的其他情況',
    phoneNumbers: ['437-340-1121'],
  },
];

const EmergencyServiceUrgentNonUrgent: React.FC<EmergencyServiceUrgentNonUrgentProps> = ({ 
  serviceId, 
  onNonUrgentSelect, 
  onGoBack 
}) => {
  const selectedService = emergencyServices.find(s => s.id === serviceId);
  const [userAttributes, setUserAttributes] = useState(null);
  
  // Animation refs for buttons
  const urgentButtonScale = useRef(new Animated.Value(1)).current;
  const nonUrgentButtonScale = useRef(new Animated.Value(1)).current;

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

  const sendReferenceApi = async (phoneNumber) => {
    if (!userAttributes) return;
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

        // Display confirmation after call
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
    animatePress(urgentButtonScale);
    
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
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>Emergency Action Required</Text>
          <Text style={styles.description}>
            Please select the appropriate action based on the urgency of your situation.
          </Text>
        </View>

        <View style={styles.serviceCardContainer}>
          <View style={styles.serviceCard}>
            <View style={styles.serviceIconContainer}>
              <Icon 
                name={selectedService?.icon || 'help'} 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
            <Text style={styles.serviceTitle}>{selectedService?.title}</Text>
            <Text style={styles.serviceDescription}>{selectedService?.description}</Text>
          </View>
        </View>

        <View style={styles.questionSection}>
          <View style={styles.questionBadge}>
            <Icon name="priority-high" size={18} color="#FFFFFF" />
            <Text style={styles.questionText}>Is this an urgent situation?</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Animated.View style={{
            transform: [{ scale: urgentButtonScale }],
            width: '100%',
          }}>
            <Pressable 
              style={styles.urgentButton} 
              onPress={handleCall}
            >
              <View style={styles.buttonContent}>
                <Icon name="call" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>Yes - Call Now</Text>
                  <Text style={styles.buttonDescription}>For immediate assistance</Text>
                </View>
              </View>
              {selectedService?.phoneNumbers?.map((num, idx) => (
                <Text style={styles.phoneNumber} key={idx}>{num}</Text>
              ))}
            </Pressable>
          </Animated.View>

          <Animated.View style={{
            transform: [{ scale: nonUrgentButtonScale }],
            width: '100%',
          }}>
            <Pressable
              style={styles.nonUrgentButton}
              onPress={() => {
                animatePress(nonUrgentButtonScale);
                onNonUrgentSelect();
              }}
            >
              <View style={styles.buttonContent}>
                <Icon name="note-add" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTitle}>No - Submit Report</Text>
                  <Text style={styles.buttonDescription}>We'll respond within 2 business days</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color="#c70628" />
            <Text style={styles.infoTitle}>When is it urgent?</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>Vehicle damage requiring immediate attention</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>Vehicle in an unsafe location or condition</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>Immediate assistance needed</Text>
          </View>
        </View>
      </ScrollView>
      
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
    marginBottom: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  serviceCardContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(199, 6, 40, 0.5)',
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 20,
  },
  questionSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  questionBadge: {
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(199, 6, 40, 0.5)',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  optionsContainer: {
    padding: 16,
    gap: 16,
  },
  urgentButton: {
    backgroundColor: '#c70628',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  nonUrgentButton: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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

export default EmergencyServiceUrgentNonUrgent;
