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

// Add props interface
interface ServicesProps {
  onGetQuote?: (serviceType: string) => void;
}

const services = [
  {
    id: 'ppf',
    title: '透明保護膜 PPF',
    description: '香港的優質汽車自動修復保護膜服務，為您的車輛提供卓越的防護，強效抵禦碎石、刮痕和路面雜物。',
    features: [
      '自動修復功能：輕微刮擦時能自動修復',
      '卓越保護性能：抗刮、抗衝擊、耐磨損',
      '強效抗紫外線：減少漆面褪色及老化',
      '高度透明無痕：幾乎無法察覺，不影響美觀',
      '展現個人風格：光面及啞面透明PPF選擇',
    ],
    image: require('../assets/images/gloss-ppf.png'),
  },
  {
    id: 'colorppf',
    title: '顏料保護膜 COLOR PPF',
    description: '現時已擁有超過 150 款顏色選擇的 COLOR PPF，其特性早已超越轉色膜，除了具有多種顏色和紋理選擇外，還擁有自動修復功能。',
    features: [
      '超過 150 款顏色選擇',
      '啞光、亮面、金屬質感選擇',
      '厚度、光澤度、跣水能力優勝',
      '保養年期較長',
      '擁有自動修復功能',
      '獨家提供各大車廠原廠車漆保護膜',
    ],
    image: require('../assets/images/color-ppf.png'), // You might want to add a specific color PPF image
  },
  {
    id: 'vinylwrap',
    title: '顏色貼膜 VINYL WRAP',
    description: '汽車顏色貼膜是一種流行的汽車改裝方式，旨在改變汽車外觀車身。主要由高品質的聚氯乙烯（PVC）材料製成。',
    features: [
      '多種顏色和紋理選擇',
      '啞光、亮面、金屬質感',
      '滿足個性化需求',
      '高品質 PVC 材料',
      '專業施工技術',
    ],
    image: require('../assets/images/vinyl.png'),
  },
];

const Services: React.FC<ServicesProps> = ({ onGetQuote }) => {
  const handleGetQuote = (serviceType: string) => {
    if (onGetQuote) {
      onGetQuote(serviceType);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>我們的專業服務</Text>
        
        {/* Add company highlights section */}
        <View style={styles.highlightsSection}>
          <Text style={styles.highlightsTitle}>HKTC 服務特色</Text>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>專業 • 就是專一服務 - 專營透明保護膜服務，絕非普通汽車美容</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>價錢透明 • 簡單易明 - 價格只計算車身用料，對客戶更公平</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>10+ 年經驗 • 7500+ 車輛服務</Text>
          </View>
          <View style={styles.highlightItem}>
            <Text style={styles.highlightBullet}>•</Text>
            <Text style={styles.highlightText}>施工期僅需兩天</Text>
          </View>
        </View>

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
              
              {/* <View style={styles.serviceInfo}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{service.duration}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Warranty</Text>
                  <Text style={styles.infoValue}>{service.warranty}</Text>
                </View>
              </View> */}

              <Text style={styles.featuresTitle}>主要特色：</Text>
              {service.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              <Pressable 
                style={({ pressed }) => [
                  styles.quoteButton,
                  pressed && styles.buttonPressed
                ]}
                onPress={() => handleGetQuote(service.title)}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.quoteButtonText}>獲取報價</Text>
                  {/* <Text style={styles.buttonSubtext}>Free Consultation</Text> */}
                </View>
              </Pressable>
            </View>
          </View>
        ))}
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
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    padding: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  serviceCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  serviceImage: {
    width: '100%',
    height: 200,
  },
  serviceContent: {
    padding: 20,
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#A0A0A0',
    lineHeight: 22,
    marginBottom: 20,
  },
  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingVertical: 4,
  },
  featureBullet: {
    color: '#c70628',
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  featureText: {
    color: '#A0A0A0',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
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
    // fontSize: 16,
    fontWeight: '600',
  },
  // quoteButton: {
  //   backgroundColor: '#c70628',
  //   borderRadius: 12,
  //   paddingVertical: 16,
  //   paddingHorizontal: 24,
  //   alignItems: 'center',
  //   marginTop: 24,
  //   borderWidth: 1.5,
  //   borderColor: '#FFFFFF',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.3,
  //   shadowRadius: 6,
  //   elevation: 8,
  // },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // quoteButtonText: {
  //   color: '#FFFFFF',
  //   fontSize: 18,
  //   fontWeight: '700',
  //   letterSpacing: 1,
  //   textTransform: 'uppercase',
  //   marginBottom: 4,
  //   textShadowColor: 'rgba(0, 0, 0, 0.3)',
  //   textShadowOffset: { width: 0, height: 2 },
  //   textShadowRadius: 2,
  // },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.9,
    backgroundColor: '#b30523',
    borderColor: 'rgba(255, 255, 255, 1)',
    transform: [{ scale: 0.98 }],
  },
  highlightsSection: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  highlightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  highlightBullet: {
    color: '#c70628',
    fontSize: 16,
    marginRight: 8,
    marginTop: -2,
  },
  highlightText: {
    color: '#A0A0A0',
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
});

export default Services; 