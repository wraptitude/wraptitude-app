import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define the interface for props
interface EmergencyServiceProps {
  onServiceSelect: (serviceId: string) => void;
}

const emergencyServices = [
  {
    id: 'collision',
    icon: 'car-crash',
    iconFallback: '🚗',
    title: '車輛碰撞',
    description: '車輛事故或碰撞的緊急協助'
  },
  {
    id: 'other',
    icon: 'help',
    iconFallback: '❓',
    title: '其他緊急情況',
    description: '需要立即協助的其他情況'
  },
];

const EmergencyService: React.FC<EmergencyServiceProps> = ({ onServiceSelect }) => {
  // Animation refs for buttons
  const buttonScales = {
    collision: useRef(new Animated.Value(1)).current,
    other: useRef(new Animated.Value(1)).current,
    call: useRef(new Animated.Value(1)).current,
  };

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

  const handleEmergencyCall = async () => {
    try {
      await Linking.openURL('tel:4373401121');
    } catch (error) {
      Alert.alert(
        '錯誤',
        '無法撥打電話。請直接撥打 437-340-1121。',
        [{ text: '確定', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>緊急服務</Text>
          <Text style={styles.description}>
            選擇您遇到的緊急情況類型，或撥打我們的熱線尋求立即協助。
          </Text>
        </View>

        <View style={styles.servicesContainer}>
          {emergencyServices.map((service) => (
            <Animated.View 
              key={service.id} 
              style={{
                transform: [{ scale: buttonScales[service.id] }]
              }}
            >
              <Pressable
                style={styles.serviceCard}
                onPress={() => {
                  animatePress(buttonScales[service.id]);
                  onServiceSelect(service.id);
                }}
              >
                <View style={styles.serviceIconContainer}>
                  <Icon name={service.icon} size={32} color="#FFFFFF" />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#FFFFFF" style={styles.arrowIcon} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.callSection}>
          <Text style={styles.callSectionTitle}>24/7 緊急熱線</Text>
          <Text style={styles.callSectionDescription}>
            需要立即協助嗎？撥打我們的緊急服務熱線。
          </Text>
          <Animated.View
            style={{
              transform: [{ scale: buttonScales.call }],
              width: '100%',
            }}
          >
            <Pressable
              style={styles.callButton}
              onPress={() => {
                animatePress(buttonScales.call);
                handleEmergencyCall();
              }}
            >
              <Icon name="call" size={24} color="#FFFFFF" style={styles.callIcon} />
              <Text style={styles.callButtonText}>437-340-1121</Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} color="#c70628" />
            <Text style={styles.infoTitle}>何時撥打緊急服務</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>車輛碰撞或事故</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>車輛被困在危險地點</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={16} color="#c70628" />
            <Text style={styles.infoText}>任何需要立即協助的情況</Text>
          </View>
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
  servicesContainer: {
    padding: 16,
    gap: 12,
  },
  serviceCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    lineHeight: 20,
  },
  arrowIcon: {
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  callSection: {
    padding: 20,
    alignItems: 'center',
  },
  callSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  callSectionDescription: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  callButton: {
    backgroundColor: '#c70628',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  callIcon: {
    marginRight: 10,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
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
});

export default EmergencyService; 