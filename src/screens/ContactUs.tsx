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
      title: 'Location',
      description: 'We are located in the beautiful city of Markham, Ontario, Canada.',
      value: '23 Laidlaw Blvd Unit 3, Markham',
      action: () => Linking.openURL('https://maps.app.goo.gl/fu4c8t3dBP48Jnrd8'),
    },
    {
      icon: '📞',
      title: 'Phone',
      description: 'Call us for inquiries or emergency service',
      value: '(437) 340-1121',
      action: () => Linking.openURL('tel:4373401121'),
    },
    {
      icon: '📧',
      title: 'Email',
      description: 'Send us your questions anytime',
      value: 'wraptitude.ca@gmail.com',
      action: () => Linking.openURL('mailto:wraptitude.ca@gmail.com'),
    },
  ];

  const handleSubmit = () => {
    // Here you would typically send the form data to your backend
    Alert.alert(
      'Quote Request Sent',
      'Thank you for your interest. We will contact you shortly!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Get In Touch Section */}
        <View style={styles.section}>
          <Text style={styles.mainTitle}>Get In Touch</Text>
          <Text style={styles.description}>
            If you want to learn more about our car wrap and enhancement services, 
            please feel free to reach out. We are never too busy to answer your questions 
            and talk about how we can help upgrade your vehicle to new heights.
          </Text>
        </View>

        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          {contactInfo.map((info, index) => (
            <Pressable
              key={index}
              style={styles.contactCard}
              onPress={info.action}
            >
              <Text style={styles.cardIcon}>{info.icon}</Text>
              <Text style={styles.cardTitle}>{info.title}</Text>
              <Text style={styles.cardDescription}>{info.description}</Text>
              <Text style={styles.cardValue}>{info.value}</Text>
            </Pressable>
          ))}
        </View>

        {/* Quote Form */}
        {/* <View style={styles.formSection}>
          <Text style={styles.formTitle}>Get Your Friction Free Quote</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#666"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Vehicle Make"
            placeholderTextColor="#666"
            value={formData.vehicleMake}
            onChangeText={(text) => setFormData({...formData, vehicleMake: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Vehicle Model & Year"
            placeholderTextColor="#666"
            value={formData.vehicleModelYear}
            onChangeText={(text) => setFormData({...formData, vehicleModelYear: text})}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.serviceType}
              style={styles.picker}
              dropdownIconColor="#fff"
              onValueChange={(value) => setFormData({...formData, serviceType: value})}
            >
              <Picker.Item label="Tinted Windows" value="Tinted Windows" />
              <Picker.Item label="Car Wrap" value="Car Wrap" />
              <Picker.Item label="Ceramic Coating" value="Ceramic Coating" />
              <Picker.Item label="Paint Protection Film (PPF)" value="Paint Protection Film" />
            </Picker>
          </View>

          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Your Message"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={formData.message}
            onChangeText={(text) => setFormData({...formData, message: text})}
          />

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Get Your Friction Free Quote</Text>
          </Pressable>
        </View> */}

        {/* Business Hours */}
        <View style={styles.hoursSection}>
          <Text style={styles.hoursTitle}>Opening Hours</Text>
          <Text style={styles.hoursText}>Monday to Saturday: 11:00am – 7:00pm</Text>
          <Text style={styles.hoursText}>Sunday: Closed</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  cardsContainer: {
    padding: 20,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    color: '#c70628',
    fontWeight: '600',
  },
  formSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#333',
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
  },
  hoursSection: {
    padding: 20,
    alignItems: 'center',
  },
  hoursTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  hoursText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 4,
  },
});

export default ContactUs; 