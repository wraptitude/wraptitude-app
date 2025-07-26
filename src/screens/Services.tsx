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
    id: 'tinting',
    title: '車窗貼膜',
    description: '專業車窗貼膜服務，阻擋紫外線，減少眩光，增強隱私性。',
    features: [
      '紫外線防護：阻擋高達99%的有害紫外線',
      '隔熱效果：保持車內涼爽',
      '隱私與安全：增強乘客隱私',
      '減少眩光：提升駕駛安全性',
    ],
    image: require('../assets/images/tinting.webp'), // Add your service image
    // duration: '2-4 hours',
    // warranty: '5 years',
  },
  {
    id: 'wrap',
    title: '車身貼膜',
    description: '使用我們的優質車身貼膜服務改造您的車輛。從多種顏色和表面處理中選擇。',
    features: [
      '漆面保護：保護原廠漆面',
      '個性化：無限顏色選擇',
      '可逆性：移除時不會損傷',
      '經濟實惠：相比重新噴漆更划算',
    ],
    image: require('../assets/images/wrap.webp'), // Add your service image
    // duration: '3-5 days',
    // warranty: '3 years',
  },
  {
    id: 'ceramic',
    title: '陶瓷鍍膜',
    description: '長效保護，維持您車輛的光澤並提供卓越的保護。',
    features: [
      '疏水性：防水防污',
      '紫外線防護：防止漆面氧化',
      '化學抗性：防護污染物',
      '增強光澤：維持展廳般的光澤',
    ],
    image: require('../assets/images/ceramic.webp'), // Add your service image
    // duration: '2-3 days',
    // warranty: '5 years',
  },
  {
    id: 'ppf',
    title: '漆面保護膜 (PPF)',
    description: '對抗石頭撞擊、刮痕和環境損害的終極保護。',
    features: [
      '自癒合：修復輕微刮痕',
      '撞擊防護：防護石頭撞擊',
      '隱形護盾：幾乎無法察覺',
      '保值：維持車輛狀況',
    ],
    image: require('../assets/images/ppf.webp'), // Add your service image
    // duration: '2-3 days',
    // warranty: '10 years',
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
});

export default Services; 