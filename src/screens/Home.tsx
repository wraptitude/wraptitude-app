import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
  Linking,
  StatusBar,
  Platform,
  BlurView,
} from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import ServiceTracking from './ServiceTracking';
import ServiceHistory from './ServiceHistory';
import KnowledgeBase from './KnowledgeBase';
import ContactUs from './ContactUs';
import Services from './Services';
import Gallery from './Gallery';
import About from './About';
import News from './News';
import NewsDetail from './NewsDetail';
import EmergencyService from './EmergencyService';
import EmergencyServiceUrgentNonUrgent from './EmergencyServiceUrgentNonUrgent';
import NonUrgentForm from './NonUrgentForm';
import FreeQuote from './FreeQuote';
import Profile from './Profile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

interface HomeProps {
  route: {
    params: {
      onSignOut: () => void;
      isGuestMode: boolean;
    };
  };
  navigation: any;
}

type Screen = 'menu' | 'tracking' | 'history' | 'services' | 'knowledge' | 'gallery' | 'about' | 'contact' | 'profile' | 'news' | 'newsDetail' | 'emergency' | 'emergencyUrgentNonUrgent' | 'nonUrgentForm' | 'quote' | 'profile';

const Home: React.FC<HomeProps> = ({ route, navigation }) => {
  const { toSignIn } = useAuthenticator();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [quoteSourceScreen, setQuoteSourceScreen] = useState<Screen>('menu');
  const [selectedEmergencyService, setSelectedEmergencyService] = useState<string>('');
  const [scrollY, setScrollY] = useState(0);

  // Animation refs for buttons
  const buttonScales = {
    tracking: useRef(new Animated.Value(1)).current,
    history: useRef(new Animated.Value(1)).current,
    profile: useRef(new Animated.Value(1)).current,
    knowledge: useRef(new Animated.Value(1)).current,
    contact: useRef(new Animated.Value(1)).current,
    profile: useRef(new Animated.Value(1)).current,
    services: useRef(new Animated.Value(1)).current,
    gallery: useRef(new Animated.Value(1)).current,
    about: useRef(new Animated.Value(1)).current,
    news: useRef(new Animated.Value(1)).current,
    emergency: useRef(new Animated.Value(1)).current,
    quote: useRef(new Animated.Value(1)).current,
  };

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate header opacity based on scroll position
    if (currentScreen === 'menu') {
      Animated.timing(headerOpacity, {
        toValue: scrollY > 20 ? 0.95 : 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [scrollY, currentScreen]);

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScreenTransition = (screen: Screen) => {
    // Check if user is trying to access protected features while in guest mode
    const protectedScreens: Screen[] = ['tracking', 'history', 'emergency', 'emergencyUrgentNonUrgent', 'nonUrgentForm', 'profile'];
    
    if (route.params.isGuestMode && protectedScreens.includes(screen)) {
      // Show login prompt for protected features
      Alert.alert(
        '登入要求',
        '請先登入以存取此功能。',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '登入',
            // onPress: () => navigation.navigate('Auth')
            onPress: handleSignOut
          }
        ]
      );
      return;
    }
    
    // Continue with normal screen transition for public features or authenticated users
    if (screen === 'quote') {
      setQuoteSourceScreen(currentScreen);
    } else if (screen === 'emergencyUrgentNonUrgent' || screen === 'nonUrgentForm') {
      // We don't change quoteSourceScreen here
    }
    
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(screen);
      screenOpacity.setValue(0);
      screenTranslateY.setValue(-10);
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSignOut = async () => {
    try {
      route.params.onSignOut();
      await signOut();
      console.log('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEmergencyCall = async () => {
    try {
      await Linking.openURL('tel:+85255617766');
    } catch (error) {
      Alert.alert(
        '錯誤',
        '無法撥打電話。請直接撥打 +852 5561 7766。',
        [{ text: '確定', style: 'default' }]
      );
    }
  };

  const menuItems = [
    { id: 'tracking', icon: 'directions-car', title: '服務追蹤', description: '追蹤您的車輛服務進度' },
    { id: 'history', icon: 'history', title: '服務歷史', description: '查看您過往的服務記錄' },
    // { id: 'emergency', icon: 'warning', title: 'Emergency Service', description: 'Call for emergency service' },
    { id: 'services', icon: 'build', title: '我們的服務', description: '探索我們的專業服務' },
    { id: 'knowledge', icon: 'book', title: '知識庫', description: '了解汽車貼膜知識' },
    // { id: 'news', icon: 'newspaper', title: '最新消息', description: '最新更新資訊' },
    { id: 'about', icon: 'person', title: '關於我們', description: '了解更多關於 hktc' },
    { id: 'quote', icon: 'calculate', title: '免費報價', description: '為您的車輛獲取即時報價' },
    { id: 'contact', icon: 'phone', title: '聯絡我們', description: '與我們聯繫' },
    { id: 'profile', icon: 'person', title: '個人資料', description: '管理您的帳戶' },
  ];

  const renderFooterIcon = (iconName: string, isActive: boolean) => {
    const getIconColor = () => {
      if (isActive) return '#FFFFFF';
      return 'rgba(255, 255, 255, 0.7)';
    };

    switch (iconName) {
      case 'home':
        return <Icon name="home" size={24} color={getIconColor()} />;
      case 'profile':
        return <Icon name="person" size={24} color={getIconColor()} />;
      case 'quote':
        return <Icon name="calculate" size={24} color={getIconColor()} />;
      case 'tracking':
        return <Icon name="directions-car" size={24} color={getIconColor()} />;
      default:
        return <Icon name="home" size={24} color={getIconColor()} />;
    }
  };

  const renderScreen = () => {
    const content = () => {
      switch (currentScreen) {
        case 'tracking':
          return <ServiceTracking />;
        case 'history':
          return <ServiceHistory />;
        case 'knowledge':
          return <KnowledgeBase />;
        case 'contact':
          return <ContactUs />;
        case 'profile':
          return <Profile />;
        case 'services':
          return <Services onGetQuote={handleGetQuote} />;
        case 'gallery':
          return <Gallery />;
        case 'about':
          return <About />;
        case 'news':
          return (
            <News
              onPostPress={(post) => {
                setSelectedPost(post);
                handleScreenTransition('newsDetail');
              }}
            />
          );
        case 'newsDetail':
          return <NewsDetail post={selectedPost!} />;
        // case 'emergency':
        //   return <EmergencyService onServiceSelect={handleEmergencyServiceSelect} />;
        case 'emergencyUrgentNonUrgent':
          return (
            <EmergencyServiceUrgentNonUrgent 
              serviceId={selectedEmergencyService}
              onNonUrgentSelect={handleNonUrgentSelect}
              onGoBack={() => setCurrentScreen('emergency')}
            />
          );
        case 'nonUrgentForm':
          return (
            <NonUrgentForm 
              serviceId={selectedEmergencyService}
              onGoBack={() => setCurrentScreen('emergencyUrgentNonUrgent')}
              onSubmitSuccess={() => setCurrentScreen('menu')}
            />
          );
        case 'quote':
          return (
            <FreeQuote 
              selectedService={selectedService} 
              onGoBack={() => {
                setCurrentScreen(quoteSourceScreen);
              }}
            />
          );
        case 'profile':
          return <Profile />;
        default:
          return (
            <View style={styles.menuContainer}>
              {menuItems.map((item) => {
                // Check if this is a protected feature
                const isProtected = ['tracking', 'history', 'emergency', 'profile'].includes(item.id);
                const isLocked = isProtected && route.params.isGuestMode;
                
                return (
                  <Animated.View 
                    key={item.id} 
                    style={[
                      { 
                        transform: [{ scale: buttonScales[item.id] || new Animated.Value(1) }],
                        marginBottom: 10,
                        opacity: isLocked ? 0.7 : 1, // Dim protected features in guest mode
                      }
                    ]}
                  >
                    <Pressable
                      style={({pressed}) => [
                        styles.menuButton,
                        item.id === 'emergency' && styles.emergencyButton,
                        item.id === 'quote' && styles.quoteButton,
                        pressed && styles.menuButtonPressed
                      ]}
                      onPress={() => {
                        animatePress(buttonScales[item.id]);
                        handleScreenTransition(item.id as Screen);
                      }}
                      accessibilityLabel={item.title}
                    >
                      <LinearGradient
                        colors={
                          item.id === 'emergency' 
                            ? ['rgba(217, 42, 42, 0.4)', 'rgba(199, 6, 40, 0.7)'] 
                            : item.id === 'quote'
                              ? ['rgba(37, 118, 235, 0.4)', 'rgba(59, 130, 246, 0.7)']
                              : ['rgba(15, 15, 15, 0.7)', 'rgba(10, 10, 10, 0.85)']
                        }
                        style={styles.menuButtonGradient}
                      >
                        <View style={[
                          styles.iconContainer, 
                          item.id === 'emergency' && styles.emergencyIconContainer,
                          item.id === 'quote' && styles.quoteIconContainer
                        ]}>
                          <LinearGradient
                            colors={
                              item.id === 'emergency' 
                                ? ['rgba(255, 150, 150, 0.2)', 'rgba(199, 6, 40, 0.3)'] 
                                : item.id === 'quote'
                                  ? ['rgba(150, 190, 255, 0.2)', 'rgba(59, 130, 246, 0.3)']
                                  : ['rgba(50, 50, 50, 0.3)', 'rgba(40, 40, 40, 0.5)']
                            }
                            style={styles.iconGradient}
                          >
                            <Icon 
                              name={item.icon === 'emergency' ? 'warning' : item.icon} 
                              size={26} 
                              color={
                                item.id === 'emergency' 
                                  ? '#ff9494' 
                                  : item.id === 'quote'
                                    ? '#a8cbff'
                                    : '#FFFFFF'
                              } 
                            />
                          </LinearGradient>
                        </View>
                        <Text style={[
                          styles.menuTitle,
                          (item.id === 'emergency' || item.id === 'quote') && styles.specialMenuTitle
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                        
                        {/* Show lock icon for protected features in guest mode */}
                        {isLocked && (
                          <View style={styles.lockIconContainer}>
                            <Icon name="lock" size={18} color="#FFFFFF" />
                          </View>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          );
      }
    };

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: screenOpacity,
          transform: [{ translateY: screenTranslateY }],
        }}
      >
        {content()}
      </Animated.View>
    );
  };

  const handleGetQuote = (serviceType: string) => {
    setSelectedService(serviceType);
    handleScreenTransition('quote');
  };

  const handleEmergencyServiceSelect = (serviceId: string) => {
    setSelectedEmergencyService(serviceId);
    handleScreenTransition('emergencyUrgentNonUrgent');
  };

  const handleNonUrgentSelect = () => {
    handleScreenTransition('nonUrgentForm');
  };

  if (isSigningOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#c70628" size="large" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/images/4.jpeg')}
      style={styles.container}
      blurRadius={8}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.overlay}>
        <View style={styles.mainContainer}>
          {/* Header with glass effect */}
          <Animated.View 
            style={[
              styles.header,
              { 
                opacity: headerOpacity,
                backgroundColor: scrollY > 20 ? 'rgba(10, 10, 10, 0.85)' : 'transparent',
                borderBottomWidth: scrollY > 20 ? 1 : 0,
              }
            ]}
          >
            <View style={styles.headerContent}>
              {currentScreen === 'menu' ? (
                <>
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('../assets/images/HKTC_LOGO_NEW.png')}
                      style={styles.logo}
                      resizeMode="contain"
                    />
                  </View>
                  <Pressable 
                    style={({pressed}) => [
                      styles.signOutButton,
                      pressed && styles.signOutButtonPressed
                    ]} 
                    onPress={handleSignOut}
                  >
                    {/* <Icon name="logout" size={22} color="#FFFFFF" />
                     <Icon name="login" size={22} color="#FFFFFF" /> */}
                     {route.params.isGuestMode ? (
                      <Text style={styles.signOutText}>登入</Text>
                     ) : (
                      <Text style={styles.signOutText}>登出</Text>
                     )}
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={({pressed}) => [
                      styles.backButton,
                      pressed && styles.backButtonPressed
                    ]}
                    onPress={() => {
                      if (currentScreen === 'newsDetail') {
                        setCurrentScreen('news');
                      } else if (currentScreen === 'quote') {
                        setCurrentScreen(quoteSourceScreen);
                      } else if (currentScreen === 'emergencyUrgentNonUrgent') {
                        setCurrentScreen('emergency');
                      } else if (currentScreen === 'nonUrgentForm') {
                        setCurrentScreen('emergencyUrgentNonUrgent');
                      } else {
                        setCurrentScreen('menu');
                      }
                    }}
                  >
                    <Icon name="arrow-back-ios" size={20} color="#FFFFFF" />
                  </Pressable>
                  <Text style={styles.screenTitle}>
                    {currentScreen === 'newsDetail' 
                      ? '最新消息' 
                      : currentScreen === 'emergencyUrgentNonUrgent' || currentScreen === 'nonUrgentForm'
                        ? '緊急服務'
                        : menuItems.find((item) => item.id === currentScreen)?.title}
                  </Text>
                </>
              )}
            </View>
          </Animated.View>

          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
              scrollEventThrottle={16}
            >
              {renderScreen()}
            </ScrollView>
          </View>

          {/* Footer with glass effect */}
          <View style={styles.footerNav}>
            <Pressable
              style={[styles.footerTab, activeTab === 'home' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('home');
                handleScreenTransition('menu');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('home', activeTab === 'home')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'home' && styles.footerTextActive
              ]}>
                首頁
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.footerTab, activeTab === 'tracking' && styles.footerTabActive]}
              onPress={() => {
                if (route.params.isGuestMode) {
                  // Show login prompt
                  Alert.alert(
                    '登入要求',
                    '請先登入以存取追蹤功能。',
                    [
                      {
                        text: '取消',
                        style: 'cancel'
                      },
                      {
                        text: '登入',
                        // onPress: () => navigation.navigate('Auth')
                        onPress: handleSignOut
                      }
                    ]
                  );
                  return;
                }
                setActiveTab('tracking');
                handleScreenTransition('tracking');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('tracking', activeTab === 'tracking')}
                {route.params.isGuestMode && (
                  <View style={styles.footerLockIcon}>
                    <Icon name="lock" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'tracking' && styles.footerTextActive
              ]}>
                追蹤
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.footerTab, activeTab === 'quote' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('quote');
                handleScreenTransition('quote');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('quote', activeTab === 'quote')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'quote' && styles.footerTextActive
              ]}>
                報價
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.footerTab, activeTab === 'profile' && styles.footerTabActive]}
              onPress={() => {
                if (route.params.isGuestMode) {
                  // Show login prompt
                  Alert.alert(
                    '登入要求',
                    '請先登入以存取您的個人資料。',
                    [
                      {
                        text: '取消',
                        style: 'cancel'
                      },
                      {
                        text: '登入',
                        // onPress: () => navigation.navigate('Auth')
                        onPress: handleSignOut
                      }
                    ]
                  );
                  return;
                }
                setActiveTab('profile');
                handleScreenTransition('profile');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('profile', activeTab === 'profile')}
                {route.params.isGuestMode && (
                  <View style={styles.footerLockIcon}>
                    <Icon name="lock" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'profile' && styles.footerTextActive
              ]}>
                個人資料
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');
const buttonWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 44, // Manual padding for status bar
  },
  header: {
    paddingVertical: 12,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 140,
    height: 40,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signOutButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  signOutText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: '600',
    // letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    marginTop: 44, // Account for header
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to clear footer
    paddingTop: 20,
  },
  menuContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: buttonWidth,
    height: buttonWidth * 1.1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  menuButtonGradient: {
    flex: 1,
    // padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{scale: 0.98}],
  },
  emergencyButton: {
    shadowColor: '#c70628',
    shadowOpacity: 0.3,
  },
  quoteButton: {
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  emergencyIconContainer: {
    backgroundColor: 'rgba(199, 6, 40, 0.1)',
    borderColor: 'rgba(255, 125, 125, 0.3)',
    borderWidth: 1,
    shadowColor: '#c70628',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  quoteIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(159, 200, 255, 0.3)',
    borderWidth: 1,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  specialMenuTitle: {
    fontWeight: '700',
  },
  menuDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#040404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16, // Account for iOS home indicator
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footerTabActive: {
    // No visible styles - using indicator instead
  },
  footerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    marginBottom: 4,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  footerTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  lockIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledFooterTab: {
    opacity: 0.7,
  },
  footerLockIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#c70628',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;