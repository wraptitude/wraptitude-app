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
    };
  };
}

type Screen = 'menu' | 'tracking' | 'history' | 'services' | 'knowledge' | 'gallery' | 'about' | 'contact' | 'news' | 'newsDetail' | 'emergency' | 'emergencyUrgentNonUrgent' | 'nonUrgentForm' | 'quote' | 'profile';

const Home: React.FC<HomeProps> = ({ route }) => {
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
      await Linking.openURL('tel:4373401121');
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to make the call. Please dial 437-340-1121 directly.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const menuItems = [
    { id: 'tracking', icon: 'directions-car', title: 'Service Tracking', description: 'Track your vehicle service progress' },
    { id: 'history', icon: 'history', title: 'Service History', description: 'View your past services' },
    { id: 'emergency', icon: 'emergency', title: 'Emergency Service', description: 'Call for emergency service' },
    { id: 'services', icon: 'build', title: 'Our Services', description: 'Explore our professional services' },
    { id: 'knowledge', icon: 'book', title: 'Knowledge Base', description: 'Learn about car films' },
    { id: 'news', icon: 'newspaper', title: 'News', description: 'Latest updates' },
    { id: 'about', icon: 'person', title: 'About Us', description: 'Learn more about Wraptitude' },
    { id: 'quote', icon: 'calculate', title: 'Free Quote', description: 'Get an instant quote for your vehicle' },
    { id: 'contact', icon: 'phone', title: 'Contact Us', description: 'Get in touch' },
  ];

  const renderFooterIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Icon name="home" size={24} color="#FFFFFF" />;
      case 'profile':
        return <Icon name="person" size={24} color="#FFFFFF" />;
      case 'quote':
        return <Icon name="calculate" size={24} color="#FFFFFF" />;
      case 'tracking':
        return <Icon name="directions-car" size={24} color="#FFFFFF" />;
      default:
        return <Icon name="home" size={24} color="#FFFFFF" />;
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
        case 'emergency':
          return <EmergencyService onServiceSelect={handleEmergencyServiceSelect} />;
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
              {menuItems.map((item) => (
                <Animated.View 
                  key={item.id} 
                  style={[
                    { transform: [{ scale: buttonScales[item.id] || new Animated.Value(1) }] }
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
                            : ['rgba(40, 40, 40, 0.7)', 'rgba(30, 30, 30, 0.95)']
                      }
                      style={styles.menuButtonGradient}
                    >
                      <View style={[
                        styles.iconContainer, 
                        item.id === 'emergency' && styles.emergencyIconContainer,
                        item.id === 'quote' && styles.quoteIconContainer
                      ]}>
                        <Icon 
                          name={item.icon} 
                          size={24} 
                          color={
                            item.id === 'emergency' || item.id === 'quote' 
                              ? '#FFFFFF' 
                              : '#FFFFFF'
                          } 
                        />
                      </View>
                      <Text style={[
                        styles.menuTitle,
                        (item.id === 'emergency' || item.id === 'quote') && styles.specialMenuTitle
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))}
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
      source={require('../assets/images/1.jpg')}
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
                      source={require('../assets/images/wraptitude-logo.webp')}
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
                    <Icon name="logout" size={22} color="#FFFFFF" />
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
                      ? 'News' 
                      : currentScreen === 'emergencyUrgentNonUrgent' || currentScreen === 'nonUrgentForm'
                        ? 'Emergency Service'
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
                {renderFooterIcon('home')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'home' && styles.footerTextActive
              ]}>
                Home
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.footerTab, activeTab === 'tracking' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('tracking');
                handleScreenTransition('tracking');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('tracking')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'tracking' && styles.footerTextActive
              ]}>
                Tracking
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
                {renderFooterIcon('quote')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'quote' && styles.footerTextActive
              ]}>
                Quote
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.footerTab, activeTab === 'profile' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('profile');
                handleScreenTransition('profile');
              }}
            >
              <View style={styles.footerIcon}>
                {renderFooterIcon('profile')}
              </View>
              <Text style={[
                styles.footerText, 
                activeTab === 'profile' && styles.footerTextActive
              ]}>
                Profile
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
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 44, // Manual padding for status bar
  },
  header: {
    paddingVertical: 12,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signOutButton: {
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  signOutText: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButtonGradient: {
    flex: 20,
    // padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{scale: 0.98}],
  },
  emergencyButton: {
    shadowColor: '#c70628',
    shadowOpacity: 0.4,
  },
  quoteButton: {
    shadowColor: '#3b82f6',
    shadowOpacity: 0.4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emergencyIconContainer: {
    backgroundColor: 'rgba(199, 6, 40, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quoteIconContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
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
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16, // Account for iOS home indicator
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
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
});

export default Home;