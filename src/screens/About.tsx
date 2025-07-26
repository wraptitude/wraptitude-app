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
  Pressable,
} from 'react-native';

const About: React.FC = () => {
  const handlePhoneCall = async () => {
    try {
      await Linking.openURL('tel:+85255617766');
    } catch (error) {
      console.error('Failed to make phone call:', error);
      Alert.alert('錯誤', '無法撥打電話。請重試。');
    }
  };

  const handleEmail = async () => {
    try {
      await Linking.openURL('mailto:hktrendycar@gmail.com?subject=查詢');
    } catch (error) {
      Alert.alert('錯誤', '無法開啟郵件客戶端。請重試。');
    }
  };

  const handleOpenMaps = async () => {
    try {
      const url = 'https://maps.app.goo.gl/qFSq4tjRnuvmyhxe7';
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to coordinates if the direct link doesn't work
        await Linking.openURL('https://www.google.com/maps/search/?api=1&query=屯門沛榮里德榮工業大廈地下B1');
      }
    } catch (error) {
      Alert.alert('錯誤', '無法開啟地圖。請重試。');
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
          <Text style={styles.mainTitle}>關於 HKTC</Text>
          <Text style={styles.heroText}>
            專業汽車貼膜服務，專營透明保護膜 PPF 及顏色貼膜 VINYL WRAP
          </Text>
        </View>
      </ImageBackground>

      {/* Mission Statement */}
      <View style={styles.missionContainer}>
        <View style={styles.missionCard}>
          <View style={styles.missionIconContainer}>
            <Text style={styles.missionIcon}>💫</Text>
          </View>
          <Text style={styles.missionTitle}>我們的承諾</Text>
          <Text style={styles.missionText}>
            在 HKTC，我們專營透明保護膜服務，絕非普通汽車美容。我們手工裁膜技術、選用世界級品牌 PPF 及 VINYL WRAP 的精品施工，
            讓您的汽車保持原始狀態外，更能為您的愛車增添了格外保護及時尚的觸感。
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
            <Text style={styles.highlightIcon}>🎯</Text>
            <Text style={styles.highlightTitle}>專業 • 就是專一服務</Text>
            <Text style={styles.highlightText}>
              專營透明保護膜服務，絕非普通汽車美容。沒有打蠟、洗車、鍍膜、噴油等服務，專注於汽車貼膜專業技術。
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightIcon}>💰</Text>
            <Text style={styles.highlightTitle}>價錢透明 • 簡單易明</Text>
            <Text style={styles.highlightText}>
              價格只計算車身用料，對客戶更公平。絕對不會以客戶車價作收費標準。施工期僅需兩天。
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightIcon}>🛡️</Text>
            <Text style={styles.highlightTitle}>世界級品牌</Text>
            <Text style={styles.highlightText}>
              選用世界級品牌 PPF 及 VINYL WRAP，提供最高品質的汽車保護膜服務，確保您的愛車得到最佳保護。
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightIcon}>✂️</Text>
            <Text style={styles.highlightTitle}>手工裁膜技術</Text>
            <Text style={styles.highlightText}>
              專業的手工裁膜技術，確保每一寸保護膜都完美貼合您的車輛，提供最佳的保護效果。
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>聯絡我們</Text>
        
        <View style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>地址</Text>
              <Text style={styles.contactValue}>屯門沛榮里德榮工業大廈地下 B1</Text>
              <Pressable onPress={handleOpenMaps} style={styles.contactButton}>
                <Text style={styles.contactButtonText}>開啟地圖</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>電話</Text>
              <Text style={styles.contactValue}>+852 5561 7766</Text>
              <Pressable onPress={handlePhoneCall} style={styles.contactButton}>
                <Text style={styles.contactButtonText}>撥打電話</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📧</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>電子郵件</Text>
              <Text style={styles.contactValue}>hktrendycar@gmail.com</Text>
              <Pressable onPress={handleEmail} style={styles.contactButton}>
                <Text style={styles.contactButtonText}>發送郵件</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>🕒</Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>營業時間</Text>
              <Text style={styles.contactValue}>週一至週六 10:00 - 19:00</Text>
            </View>
          </View>
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
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: 'transparent',
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#c70628',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contactButton: {
    backgroundColor: '#c70628',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default About; 