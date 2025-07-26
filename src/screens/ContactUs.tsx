import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleMake: '',
    vehicleModelYear: '',
    serviceType: 'Tinted Windows',
    message: '',
  });

  const contactInfo = [
    {
      icon: '📍',
      title: '地址',
      description: '我們位於加拿大安大略省美麗的萬錦市。',
      value: '23 Laidlaw Blvd Unit 3, Markham',
      action: () => Linking.openURL('https://maps.app.goo.gl/fu4c8t3dBP48Jnrd8'),
    },
    {
      icon: '📞',
      title: '電話',
      description: '致電我們進行查詢或緊急服務',
      value: '(437) 340-1121',
      action: () => Linking.openURL('tel:4373401121'),
    },
    {
      icon: '📧',
      title: '電子郵件',
      description: '隨時發送您的問題給我們',
      value: 'wraptitude.ca@gmail.com',
      action: () => Linking.openURL('mailto:wraptitude.ca@gmail.com'),
    },
  ];

  const handleSubmit = () => {
    // Here you would typically send the form data to your backend
    Alert.alert(
      '報價請求已發送',
      '感謝您的興趣。我們將很快與您聯繫！',
      [{ text: '確定' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Get In Touch Section */}
        <View style={styles.section}>
          <Text style={styles.mainTitle}>聯絡我們</Text>
          <Text style={styles.description}>
            如果您想了解更多關於我們的汽車貼膜和升級服務，
            請隨時與我們聯繫。我們永遠不會太忙而無法回答您的問題，
            並討論我們如何幫助您將車輛升級到新的高度。
          </Text>
        </View>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          {contactInfo.map((info, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.contactCard,
                pressed && styles.cardPressed
              ]}
              onPress={info.action}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardIcon}>{info.icon}</Text>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>{info.title}</Text>
                  <Text style={styles.cardDescription}>{info.description}</Text>
                  <Text style={styles.cardValue}>{info.value}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Business Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.hoursTitle}>OPENING HOURS</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Monday - Saturday</Text>
              <Text style={styles.timeText}>11:00am – 7:00pm</Text>
            </View>
            <View style={styles.hoursDivider} />
            <View style={styles.hoursRow}>
              <Text style={styles.dayText}>Sunday</Text>
              <Text style={styles.timeText}>Closed</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingBottom: 100, // Space for footer
  },
  section: {
    padding: 20,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#A0A0A0',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  cardsContainer: {
    padding: 20,
    gap: 16,
  },
  contactCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardPressed: {
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 13,
    color: '#A0A0A0',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardValue: {
    fontSize: 15,
    color: '#c70628',
    fontWeight: '600',
  },
  hoursSection: {
    padding: 20,
    marginBottom: 20,
  },
  hoursTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  hoursCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  hoursDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  dayText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 15,
    color: '#c70628',
    fontWeight: '600',
  },
  formSection: {
    margin: 20,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  picker: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ContactUs; 