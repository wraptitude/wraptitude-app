import React from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

import { useBranch } from '../branch/BranchContext';
import { colors } from '../styles/theme';

export type DashboardScreen =
  | 'tracking' | 'history' | 'services' | 'knowledge' | 'gallery'
  | 'about' | 'contact' | 'news' | 'emergency' | 'quote' | 'chatbot';

interface HomeDashboardProps {
  isGuestMode: boolean;
  onNavigate: (screen: DashboardScreen) => void;
}

const featuredServices = [
  { title: 'Window Tinting', image: require('../assets/images/tinting.webp') },
  { title: 'Vinyl Wrap', image: require('../assets/images/wrap.webp') },
  { title: 'Ceramic Coating', image: require('../assets/images/ceramic.webp') },
  { title: 'Paint Protection Film', image: require('../assets/images/ppf.webp') },
];

const exploreLinks: { title: string; subtitle: string; icon: string; screen: DashboardScreen }[] = [
  { title: 'AI Assistant', subtitle: 'Ask about our services', icon: 'smart-toy', screen: 'chatbot' },
  { title: 'Knowledge Base', subtitle: 'Answers and car care tips', icon: 'auto-stories', screen: 'knowledge' },
  { title: 'Gallery', subtitle: 'See our work', icon: 'collections', screen: 'gallery' },
  { title: 'News', subtitle: 'Stories and updates', icon: 'article', screen: 'news' },
  { title: 'Contact Us', subtitle: 'Find your selected shop', icon: 'location-on', screen: 'contact' },
  { title: 'About Wraptitude', subtitle: 'Our team and story', icon: 'info-outline', screen: 'about' },
];

export default function HomeDashboard({ isGuestMode, onNavigate }: HomeDashboardProps): React.JSX.Element {
  const { branch } = useBranch();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={require('../assets/images/wrap.webp')}
        imageStyle={styles.heroImage}
        style={styles.hero}
      >
        <LinearGradient
          colors={['rgba(8,9,11,0.28)', 'rgba(8,9,11,0.78)', '#0A0B0D']}
          style={styles.heroShade}
        >
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>WRAP WITH ATTITUDE</Text>
            <Text style={styles.heroTitle}>Your car, your statement.</Text>
            <Text style={styles.heroDescription}>
              Premium wraps, tint and protection at our {branch.name} studio.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}
              onPress={() => onNavigate('quote')}
              accessibilityRole="button"
              accessibilityLabel={`Get a free quote from ${branch.name}`}
            >
              <Text style={styles.heroButtonText}>Get a free quote</Text>
              <Icon name="arrow-forward" size={20} color={colors.text} />
            </Pressable>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.section}>
        <View style={styles.locationCard}>
          <View style={styles.locationIcon}>
            <Icon name="place" size={22} color={colors.redLight} />
          </View>
          <View style={styles.locationCopy}>
            <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
            <Text style={styles.locationTitle}>{branch.name}</Text>
            <Text style={styles.locationAddress} numberOfLines={2}>{branch.address}</Text>
          </View>
          <Pressable
            style={styles.locationArrow}
            onPress={() => onNavigate('contact')}
            accessibilityRole="button"
            accessibilityLabel={`View ${branch.name} contact information`}
          >
            <Icon name="chevron-right" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your service</Text>
        <Text style={styles.sectionSubtitle}>Everything you need, right where you need it.</Text>
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            onPress={() => onNavigate('tracking')}
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}><Icon name="directions-car" size={25} color={colors.text} /></View>
            <Text style={styles.actionTitle}>Track service</Text>
            <Text style={styles.actionDescription}>{isGuestMode ? 'Sign in to follow progress' : 'Follow your car’s progress'}</Text>
            {isGuestMode && <Icon name="lock-outline" size={16} color={colors.muted} style={styles.lockIcon} />}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
            onPress={() => onNavigate('history')}
            accessibilityRole="button"
          >
            <View style={styles.actionIcon}><Icon name="history" size={25} color={colors.text} /></View>
            <Text style={styles.actionTitle}>Service history</Text>
            <Text style={styles.actionDescription}>{isGuestMode ? 'Sign in to see your visits' : 'Your previous visits'}</Text>
            {isGuestMode && <Icon name="lock-outline" size={16} color={colors.muted} style={styles.lockIcon} />}
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [styles.emergencyCard, pressed && styles.pressed]}
          onPress={() => onNavigate('emergency')}
          accessibilityRole="button"
        >
          <View style={styles.emergencyIcon}><Icon name="support-agent" size={24} color={colors.redLight} /></View>
          <View style={styles.emergencyCopy}>
            <Text style={styles.emergencyTitle}>Need urgent help?</Text>
            <Text style={styles.emergencyDescription}>Emergency support for {branch.name}</Text>
          </View>
          <Icon name="arrow-forward" size={21} color={colors.redLight} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore services</Text>
          <Pressable onPress={() => onNavigate('services')} accessibilityRole="button">
            <Text style={styles.seeAll}>See all  →</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.serviceRow}>
          {featuredServices.map((service) => (
            <Pressable
              key={service.title}
              style={({ pressed }) => [styles.serviceCard, pressed && styles.pressed]}
              onPress={() => onNavigate('services')}
              accessibilityRole="button"
              accessibilityLabel={`Explore ${service.title}`}
            >
              <Image source={service.image} style={styles.serviceImage} resizeMode="cover" />
              <Text style={styles.serviceName} numberOfLines={2}>{service.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>More to discover</Text>
        <View style={styles.exploreList}>
          {exploreLinks.map((link) => (
            <Pressable
              key={link.screen}
              style={({ pressed }) => [styles.exploreRow, pressed && styles.pressed]}
              onPress={() => onNavigate(link.screen)}
              accessibilityRole="button"
            >
              <View style={styles.exploreIcon}><Icon name={link.icon} size={21} color={colors.text} /></View>
              <View style={styles.exploreCopy}>
                <Text style={styles.exploreTitle}>{link.title}</Text>
                <Text style={styles.exploreSubtitle}>{link.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={22} color={colors.subtle} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 28 },
  hero: { height: 350, marginHorizontal: 16, marginTop: 12, borderRadius: 24, overflow: 'hidden' },
  heroImage: { borderRadius: 24 },
  heroShade: { flex: 1, justifyContent: 'flex-end' },
  heroCopy: { padding: 24, paddingBottom: 26 },
  eyebrow: { color: '#FFC7D0', fontSize: 11, fontWeight: '800', letterSpacing: 2.2, marginBottom: 9 },
  heroTitle: { color: colors.text, fontSize: 30, fontWeight: '800', lineHeight: 35, maxWidth: 270 },
  heroDescription: { color: '#EAEBED', fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 300 },
  heroButton: { backgroundColor: colors.red, borderRadius: 12, marginTop: 22, minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroButtonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  section: { marginTop: 26, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  sectionSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16 },
  locationIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redTint, marginRight: 13 },
  locationCopy: { flex: 1 },
  locationLabel: { color: colors.redLight, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  locationTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 3 },
  locationAddress: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  locationArrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, minHeight: 160, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16 },
  actionIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  actionTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  actionDescription: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  lockIcon: { position: 'absolute', top: 18, right: 17 },
  emergencyCard: { marginTop: 12, backgroundColor: colors.redTint, borderColor: '#6B2633', borderWidth: 1, borderRadius: 18, padding: 16, minHeight: 78, flexDirection: 'row', alignItems: 'center' },
  emergencyIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#4A1B24', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  emergencyCopy: { flex: 1 },
  emergencyTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emergencyDescription: { color: '#E2B5BD', fontSize: 12, marginTop: 4 },
  seeAll: { color: colors.redLight, fontSize: 14, fontWeight: '700' },
  serviceRow: { gap: 12, paddingRight: 16 },
  serviceCard: { width: 142, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  serviceImage: { width: '100%', height: 104 },
  serviceName: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 19, padding: 12, minHeight: 62 },
  exploreList: { marginTop: 14, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  exploreRow: { flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingHorizontal: 14, borderBottomColor: colors.border, borderBottomWidth: 1 },
  exploreIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  exploreCopy: { flex: 1 },
  exploreTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  exploreSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  pressed: { opacity: 0.77 },
});
