import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';

const About: React.FC = () => {
  const handlePhoneCall = async () => {
    try {
      await Linking.openURL('tel:4373401121');
    } catch (error) {
      console.error('Failed to make phone call:', error);
      Alert.alert('Error', 'Could not make phone call. Please try again.');
    }
  };

  const handleEmail = async () => {
    try {
      await Linking.openURL('mailto:wraptitude.ca@gmail.com?subject=Inquiry from App');
    } catch (error) {
      Alert.alert('Error', 'Could not open email client. Please try again.');
    }
  };

  const handleOpenMaps = async () => {
    try {
      const url = 'https://maps.app.goo.gl/fu4c8t3dBP48Jnrd8';
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to coordinates if the direct link doesn't work
        await Linking.openURL('https://www.google.com/maps/search/?api=1&query=23+Laidlaw+Blvd+Unit+3+Markham');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open Maps. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <ImageBackground
        source={require('../assets/images/about-us-img.webp')}
        style={styles.hero}
        // blurRadius={3}
      >
        <View style={styles.heroOverlay}>
          <Text style={styles.mainTitle}>About Wraptitude</Text>
          <Text style={styles.heroText}>
            Professional car wrapping services with over 10 years of experience
          </Text>
        </View>
      </ImageBackground>

      {/* Mission Statement */}
      <View style={styles.missionContainer}>
        <View style={styles.missionCard}>
          <View style={styles.missionIconContainer}>
            <Text style={styles.missionIcon}>💫</Text>
          </View>
          <Text style={styles.missionTitle}>Our Commitment</Text>
          <Text style={styles.missionText}>
            At Wraptitude, we value every client that walks into our shop. You can count on our installers 
            each with 5 – 10+ years of experience in providing high quality, professional car wrapping services.
          </Text>
          {/* <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10+</Text>
              <Text style={styles.statLabel}>Years Experience</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Happy Clients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
          </View> */}
        </View>
      </View>

      {/* Highlights Grid */}
      <View style={styles.highlightsContainer}>
        {/* <Text style={styles.highlightsTitle}>Why Choose Us</Text> */}
        
        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.highlightIcon}>🎯</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.highlightTitle}>Our Mission</Text>
              <Text style={styles.highlightText}>
                To improve the aesthetic and durability of your vehicle
              </Text>
            </View>
          </View>
          <View style={[styles.highlightAccent, { backgroundColor: '#c70628' }]} />
        </View>

        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.highlightIcon}>⚡</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.highlightTitle}>Premium Equipment</Text>
              <Text style={styles.highlightText}>
                High-end anti-dust system that minimize 99.9% of dust for perfect finishing
              </Text>
            </View>
          </View>
          <View style={[styles.highlightAccent, { backgroundColor: '#FF9500' }]} />
        </View>

        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.highlightIcon}>👥</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.highlightTitle}>Expert Team</Text>
              <Text style={styles.highlightText}>
                8 qualified installers with 5-10+ years of professional experience
              </Text>
            </View>
          </View>
          <View style={[styles.highlightAccent, { backgroundColor: '#32D74B' }]} />
        </View>
      </View>

      {/* Founder Section */}
      <View style={styles.founderSection}>
        <Text style={styles.sectionTitle}>Meet Our Founder</Text>
        <View style={styles.founderCard}>
          <Image 
            source={require('../assets/images/rex-big-boss.webp')}
            style={styles.founderImage}
            resizeMode="cover"
          />
          <View style={styles.founderContent}>
            <Text style={styles.founderName}>Rex</Text>
            <Text style={styles.founderText}>
              Hey, thanks for visiting my website. I started Wraptitude because I wanted to bring high quality 
              car wrapping to Ontario. We only use the best materials at our Markham location, giving your vehicle 
              an amazing, long-lasting finish.
            </Text>
          </View>
        </View>
      </View>

      {/* Innovation Section */}
      <View style={styles.innovationSection}>
        <View style={styles.innovationHeader}>
          <View style={styles.innovationTitleContainer}>
            <Text style={styles.sectionTitle}>Innovation & Growth</Text>
            {/* <Text style={styles.innovationSubtitle}>Pushing boundaries in car wrapping excellence</Text> */}
          </View>
        </View>

        <View style={styles.innovationContent}>
          <View style={styles.innovationCard}>
            <Image 
              source={require('../assets/images/about-us-img.webp')}
              style={styles.innovationImage}
              resizeMode="cover"
            />
            <View style={styles.innovationOverlay} />
            
            {/* <View style={styles.innovationStats}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>50+</Text>
                <Text style={styles.statLabel}>Global Workshops</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>20+</Text>
                <Text style={styles.statLabel}>New Techniques</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>15+</Text>
                <Text style={styles.statLabel}>Industry Awards</Text>
              </View>
            </View> */}

            <View style={styles.innovationTextContainer}>
              <Text style={styles.innovationHeadline}>We're constantly innovating</Text>
              <Text style={styles.innovationText}>
              In recent years, we've broadened our global presence through workshops and seminars worldwide, focusing on enhancing skills and creativity. These experiences deepen our understanding of diverse markets and global trends, empowering us to innovate effectively. Moving forward, our commitment to continuous learning and collaboration drives our leadership in delivering impactful solutions globally.
              </Text>
              {/* <View style={styles.bulletPoints}>
                <Text style={styles.bulletPoint}>• Master cutting-edge wrapping techniques</Text>
                <Text style={styles.bulletPoint}>• Adopt latest industry technologies</Text>
                <Text style={styles.bulletPoint}>• Participate in international training</Text>
                <Text style={styles.bulletPoint}>• Lead in sustainable practices</Text>
              </View> */}
            </View>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Visit Us</Text>
          <TouchableOpacity onPress={handleOpenMaps}>
            <Text style={[styles.contactText, { textDecorationLine: 'underline' }]}>
              23 Laidlaw Blvd Unit 3, Markham
            </Text>
          </TouchableOpacity>
          <Text style={styles.contactText}>Mon-Sat: 11:00am – 7:00pm</Text>
          <Text style={styles.contactText}>Sunday: Closed</Text>
        </View>
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contact</Text>
          <TouchableOpacity onPress={handlePhoneCall}>
            <Text style={[styles.contactText, { textDecorationLine: 'underline' }]}>
              (437) 340-1121
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={[styles.contactText, { textDecorationLine: 'underline' }]}>
              wraptitude.ca@gmail.com
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  hero: {
    height: 300,
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  missionContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  missionCard: {
    backgroundColor: '#262626',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  missionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(199,6,40,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionIcon: {
    fontSize: 36,
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c70628',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  highlightsContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  highlightsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  highlightBox: {
    backgroundColor: '#262626',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  highlightContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightIcon: {
    fontSize: 30,
  },
  textContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  highlightAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 4,
    height: '100%',
  },
  founderSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  founderCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#262626',
  },
  founderImage: {
    width: '100%',
    height: 300,
  },
  founderContent: {
    padding: 20,
  },
  founderName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  founderText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
  },
  innovationSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  innovationHeader: {
    marginBottom: 24,
  },
  innovationTitleContainer: {
    alignItems: 'center',
  },
  innovationSubtitle: {
    fontSize: 16,
    color: '#c70628',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  innovationContent: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  innovationCard: {
    backgroundColor: '#262626',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  innovationImage: {
    width: '100%',
    height: 250,
  },
  innovationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  innovationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(199,6,40,0.1)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c70628',
    marginBottom: 4,
  },
  innovationTextContainer: {
    padding: 24,
  },
  innovationHeadline: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  innovationText: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletPoints: {
    marginTop: 16,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 24,
    marginLeft: 8,
  },
  contactSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
});

export default About; 