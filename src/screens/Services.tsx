import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useBranch } from '../branch/BranchContext';
import { colors } from '../styles/theme';

interface ServicesProps {
  onGetQuote?: (serviceType: string) => void;
}

const services = [
  {
    id: 'tinting',
    title: 'Window Tinting',
    description: 'Stay cooler, reduce glare and give every drive a more private feel.',
    features: ['UV protection', 'Heat reduction', 'More privacy', 'Less glare'],
    image: require('../assets/images/tinting.webp'),
  },
  {
    id: 'wrap',
    title: 'Vinyl Wrap',
    description: 'Give your car a new look with a finish that feels entirely yours.',
    features: ['Colour options', 'Original paint protection', 'Reversible finish', 'Custom styling'],
    image: require('../assets/images/wrap.webp'),
  },
  {
    id: 'ceramic',
    title: 'Ceramic Coating',
    description: 'Add long-lasting shine and make everyday care easier.',
    features: ['Hydrophobic finish', 'UV protection', 'Easier cleaning', 'Enhanced gloss'],
    image: require('../assets/images/ceramic.webp'),
  },
  {
    id: 'ppf',
    title: 'Paint Protection Film (PPF)',
    description: 'A nearly invisible layer designed to protect the finish you love.',
    features: ['Rock-chip protection', 'Minor-scratch resistance', 'Clear appearance', 'Preserved finish'],
    image: require('../assets/images/ppf.webp'),
  },
];

const Services: React.FC<ServicesProps> = ({ onGetQuote }) => {
  const { branch } = useBranch();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>AVAILABLE IN {branch.name.toUpperCase()}</Text>
        <Text style={styles.title}>Made for your drive.</Text>
        <Text style={styles.subtitle}>Explore our services and tell us what you have in mind.</Text>
      </View>

      {services.map((service) => (
        <View key={service.id} style={styles.card}>
          <Image source={service.image} style={styles.image} resizeMode="cover" />
          <View style={styles.cardContent}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.description}>{service.description}</Text>
            <View style={styles.features}>
              {service.features.map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Icon name="check-circle" size={17} color={colors.redLight} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <Pressable
              style={({ pressed }) => [styles.quoteButton, pressed && styles.pressed]}
              onPress={() => onGetQuote?.(service.title)}
              disabled={!onGetQuote}
              accessibilityRole="button"
              accessibilityLabel={`Get a quote for ${service.title}`}
            >
              <Text style={styles.quoteButtonText}>Get a free quote</Text>
              <Icon name="arrow-forward" size={19} color={colors.text} />
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 28 },
  intro: { marginBottom: 22 },
  eyebrow: { color: colors.redLight, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 9 },
  title: { color: colors.text, fontSize: 29, fontWeight: '800', lineHeight: 35 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 9 },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderColor: colors.border, borderWidth: 1, overflow: 'hidden', marginBottom: 18 },
  image: { width: '100%', height: 186 },
  cardContent: { padding: 18 },
  serviceTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  features: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginBottom: 12 },
  feature: { width: '50%', flexDirection: 'row', alignItems: 'center', minHeight: 32, paddingRight: 7 },
  featureText: { color: colors.text, fontSize: 12, marginLeft: 6, flexShrink: 1 },
  quoteButton: { backgroundColor: colors.red, minHeight: 50, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  quoteButtonText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.8 },
});

export default Services;
