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
import LinearGradient from 'react-native-linear-gradient';

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
        source={require('../assets/images/4.jpeg')}
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
        </View> 
      </View>

      {/* Highlights Grid */}
      <View style={styles.highlightsContainer}>
        <Text style={styles.highlightsTitle}>為什麼選擇我們</Text>
        
        <View style={styles.highlightBox}>

            <View style={styles.highlightContent}>
              <View style={styles.highlightIconContainer}>

                  <Text style={styles.highlightIcon}>🎯</Text>

              </View>
              <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightTitle}>專業 • 就是專一服務</Text>
                <Text style={styles.highlightText}>
                  專營透明保護膜服務，絕非普通汽車美容。沒有打蠟、洗車、鍍膜、噴油等服務，專注於汽車貼膜專業技術。
                </Text>
              </View>
            </View>

        </View>

        <View style={styles.highlightBox}>

            <View style={styles.highlightContent}>
              <View style={styles.highlightIconContainer}>

                  <Text style={styles.highlightIcon}>💰</Text>

              </View>
              <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightTitle}>價錢透明 • 簡單易明</Text>
                <Text style={styles.highlightText}>
                  價格只計算車身用料，對客戶更公平。絕對不會以客戶車價作收費標準。施工期僅需兩天。
                </Text>
              </View>
            </View>

        </View>

        <View style={styles.highlightBox}>

            <View style={styles.highlightContent}>
              <View style={styles.highlightIconContainer}>

                  <Text style={styles.highlightIcon}>🛡️</Text>

              </View>
              <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightTitle}>世界級品牌</Text>
                <Text style={styles.highlightText}>
                  選用世界級品牌 PPF 及 VINYL WRAP，提供最高品質的汽車保護膜服務，確保您的愛車得到最佳保護。
                </Text>
              </View>
            </View>

        </View>

        <View style={styles.highlightBox}>

            <View style={styles.highlightContent}>
              <View style={styles.highlightIconContainer}>

                  <Text style={styles.highlightIcon}>✂️</Text>

              </View>
              <View style={styles.highlightTextContainer}>
                <Text style={styles.highlightTitle}>手工裁膜技術</Text>
                <Text style={styles.highlightText}>
                  專業的手工裁膜技術，確保每一寸保護膜都完美貼合您的車輛，提供最佳的保護效果。
                </Text>
              </View>
            </View>

        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>

          <Text style={styles.contactTitle}>聯絡我們</Text>
          
          <View style={styles.contactItemsContainer}>
            <Pressable onPress={handleOpenMaps} style={styles.contactItem}>
              <View style={styles.contactIconContainer}>

                  <Text style={styles.contactIcon}>📍</Text>

              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>地址</Text>
                <Text style={styles.contactValue}>屯門沛榮里德榮工業大廈地下 B1</Text>
              </View>
            </Pressable>

            <Pressable onPress={handlePhoneCall} style={styles.contactItem}>
              <View style={styles.contactIconContainer}>

                  <Text style={styles.contactIcon}>📞</Text>

              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>電話</Text>
                <Text style={styles.contactValue}>+852 5561 7766</Text>
              </View>
            </Pressable>

            <Pressable onPress={handleEmail} style={styles.contactItem}>
              <View style={styles.contactIconContainer}>

                  <Text style={styles.contactIcon}>📧</Text>
   
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>電子郵件</Text>
                <Text style={styles.contactValue}>hktrendycar@gmail.com</Text>
              </View>
            </Pressable>

            <View style={styles.contactItem}>
              <View style={styles.contactIconContainer}>
 
                  <Text style={styles.contactIcon}>🕒</Text>

              </View>
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
    height: 350,
    justifyContent: 'flex-end',
  },
  heroImage: {
    resizeMode: 'cover',
    opacity: 0.7,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  missionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  missionIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
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
  highlightGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  highlightContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  highlightIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightIcon: {
    fontSize: 30,
  },
  highlightTextContainer: {
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
  contactSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  contactCard: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItemsContainer: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contactIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 24,
    color: '#FFFFFF',
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
    fontWeight: '500',
  },
});

export default About; 