import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
  action?: () => void;
}

const ContactUs: React.FC = () => {
  const contactInfo: ContactInfo[] = [
    {
      icon: '📞',
      label: 'Phone',
      value: '437-340-1121',
      action: () => Linking.openURL('tel:4373401121'),
    },
    {
      icon: '📧',
      label: 'Email',
      value: 'wraptitude.ca@gmail.com',
      action: () => Linking.openURL('mailto:wraptitude.ca@gmail.com'),
    },
    {
      icon: '📍',
      label: 'Address',
      value: '23 Laidlaw Blvd Unit 3, Markham, ON L3P 1W5',
      action: () => Linking.openURL('https://maps.app.goo.gl/fu4c8t3dBP48Jnrd8'),
    },
    {
      icon: '⏰',
      label: 'Business Hours',
      value: 'Mon-Sat 11:00-19:00',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>
      <ScrollView style={styles.content}>
        {contactInfo.map((info, index) => (
          <Pressable
            key={index}
            style={styles.contactCard}
            onPress={info.action}
            disabled={!info.action}
          >
            <Text style={styles.icon}>{info.icon}</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.label}>{info.label}</Text>
              <Text style={styles.value}>{info.value}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  label: {
    color: '#7c7c7c',
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ContactUs; 