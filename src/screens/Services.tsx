import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const services = [
  {
    id: 'tinting',
    title: 'Window Tinting',
    description: 'Professional window tinting service that blocks UV rays, reduces glare, and enhances privacy.',
    features: [
      'UV Protection: blocks up to 99% of harmful UV rays',
      'Heat Reduction: keeps your car cool',
      'Privacy & Security: enhanced privacy for passengers',
      'Glare Reduction: improved driving safety',
    ],
    image: require('../assets/images/tinting.webp'), // Add your service image
    duration: '2-4 hours',
    warranty: '5 years',
  },
  {
    id: 'wrap',
    title: 'Vinyl Wrap',
    description: 'Transform your vehicle with our premium vinyl wrapping service. Choose from a wide range of colors and finishes.',
    features: [
      'Paint Protection: shields original paint',
      'Customization: unlimited color options',
      'Reversible: removable without damage',
      'Cost-effective: compared to repainting',
    ],
    image: require('../assets/images/wrap.webp'), // Add your service image
    duration: '3-5 days',
    warranty: '3 years',
  },
  {
    id: 'ceramic',
    title: 'Ceramic Coating',
    description: 'Long-lasting protection that maintains your vehicle\'s shine and provides superior protection.',
    features: [
      'Hydrophobic: water and dirt resistant',
      'UV Protection: prevents paint oxidation',
      'Chemical Resistant: protects against contaminants',
      'Enhanced Gloss: maintains showroom shine',
    ],
    image: require('../assets/images/ceramic.webp'), // Add your service image
    duration: '2-3 days',
    warranty: '5 years',
  },
  {
    id: 'ppf',
    title: 'Paint Protection Film (PPF)',
    description: 'Ultimate protection against rock chips, scratches, and environmental damage.',
    features: [
      'Self-Healing: repairs minor scratches',
      'Impact Protection: guards against rock chips',
      'Invisible Shield: virtually undetectable',
      'Preserves Value: maintains vehicle condition',
    ],
    image: require('../assets/images/ppf.webp'), // Add your service image
    duration: '2-3 days',
    warranty: '10 years',
  },
];

const Services: React.FC = () => {
  const navigation = useNavigation();

  const handleGetQuote = (serviceType: string) => {
    console.log('serviceType', serviceType);
    navigation.navigate('FreeQuote', { selectedService: serviceType });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Our Professional Services</Text>
      
      {services.map((service) => (
        <View key={service.id} style={styles.serviceCard}>
          <Image
            source={service.image}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          
          <View style={styles.serviceContent}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            
            <View style={styles.serviceInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{service.duration}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Warranty</Text>
                <Text style={styles.infoValue}>{service.warranty}</Text>
              </View>
            </View>

            <Text style={styles.featuresTitle}>Key Features:</Text>
            {service.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}

            <Pressable 
              style={styles.quoteButton}
              onPress={() => handleGetQuote(service.title)}
            >
              <Text style={styles.quoteButtonText}>Get a Quote</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 20,
    textAlign: 'center',
  },
  serviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceImage: {
    width: '100%',
    height: 200,
  },
  serviceContent: {
    padding: 20,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 15,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#262626',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    color: '#c70628',
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  featureText: {
    color: '#cccccc',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  quoteButton: {
    backgroundColor: '#c70628',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  quoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Services; 