import React, { useState, useRef } from 'react';
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
import FreeQuote from './FreeQuote';

interface HomeProps {
  route: {
    params: {
      onSignOut: () => void;
    };
  };
}

type Screen = 'menu' | 'tracking' | 'history' | 'services' | 'knowledge' | 'gallery' | 'about' | 'contact' | 'news' | 'newsDetail' | 'emergency' | 'quote';

const Home: React.FC<HomeProps> = ({ route }) => {
  const { toSignIn } = useAuthenticator();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  // Animation refs for buttons
  const buttonScales = {
    tracking: useRef(new Animated.Value(1)).current,
    history: useRef(new Animated.Value(1)).current,
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

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.92,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScreenTransition = (screen: Screen) => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(screen);
      screenOpacity.setValue(0);
      screenTranslateY.setValue(-10);
      Animated.parallel([
        Animated.timing(screenOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateY, {
          toValue: 0,
          duration: 100,
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
    { id: 'tracking', icon: '🚗', title: 'Service Tracking', description: 'Track your vehicle service progress' },
    { id: 'history', icon: '📋', title: 'Service History', description: 'View your past services' },
    { id: 'services', icon: '🛠️', title: 'Our Services', description: 'Explore our professional services' },
    { id: 'knowledge', icon: '📚', title: 'Knowledge Base', description: 'Learn about car films' },
    { id: 'news', icon: '📰', title: 'News', description: 'Latest updates' },
    { id: 'about', icon: '👥', title: 'About Us', description: 'Learn more about Wraptitude' },
    { id: 'quote', icon: '💰', title: 'Free Quote', description: 'Get an instant quote for your vehicle' },
    { id: 'contact', icon: '📞', title: 'Contact Us', description: 'Get in touch' },
  ];

  const renderFooterIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return '🏠';
      case 'profile':
        return '👤';
      case 'quote':
        return '💰';
      case 'contact':
        return '📞';
      default:
        return '🏠';
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
          return <Services />;
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
          return <EmergencyService />;
        case 'quote':
          return <FreeQuote />;
        default:
          return (
            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <Animated.View key={item.id} style={[{ transform: [{ scale: buttonScales[item.id] || new Animated.Value(1) }] }]}>
                  <Pressable
                    style={[styles.menuButton, item.id === 'quote' && styles.quoteButton]}
                    onPress={() => {
                      animatePress(buttonScales[item.id]);
                      handleScreenTransition(item.id as Screen);
                    }}
                    accessibilityLabel={item.title}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[styles.menuTitle, item.id === 'quote' && styles.quoteTitle]}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
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
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.overlay}>
        <View style={styles.mainContainer}>
          <View style={styles.header}>
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
                  <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={styles.backButton}
                    onPress={() => {
                      if (currentScreen === 'newsDetail') {
                        setCurrentScreen('news');
                      } else {
                        setCurrentScreen('menu');
                      }
                    }}
                  >
                    <Text style={styles.backButtonText}>←</Text>
                  </Pressable>
                  <Text style={styles.screenTitle}>
                    {currentScreen === 'newsDetail' ? 'News' : menuItems.find((item) => item.id === currentScreen)?.title}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {renderScreen()}
            </ScrollView>
          </View>

          <View style={styles.footerNav}>
            <Pressable
              style={[styles.footerTab, activeTab === 'profile' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('profile');
                handleScreenTransition('tracking');
              }}
            >
              <Text style={styles.footerIcon}>{renderFooterIcon('profile')}</Text>
              <Text style={styles.footerText}>Profile</Text>
            </Pressable>

            <Pressable
              style={[styles.footerTab, activeTab === 'home' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('home');
                handleScreenTransition('menu');
              }}
            >
              <Text style={styles.footerIcon}>{renderFooterIcon('home')}</Text>
              <Text style={styles.footerText}>Home</Text>
            </Pressable>

            <Pressable
              style={[styles.footerTab, activeTab === 'quote' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('quote');
                handleScreenTransition('quote');
              }}
            >
              <Text style={styles.footerIcon}>{renderFooterIcon('quote')}</Text>
              <Text style={styles.footerText}>Quote</Text>
            </Pressable>

            <Pressable
              style={[styles.footerTab, activeTab === 'contact' && styles.footerTabActive]}
              onPress={() => {
                setActiveTab('contact');
                handleScreenTransition('contact');
              }}
            >
              <Text style={styles.footerIcon}>{renderFooterIcon('contact')}</Text>
              <Text style={styles.footerText}>Contact</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');
const buttonWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mainContainer: {
    flex: 1,
    paddingTop: 44, // Manual padding for status bar
  },
  header: {
    paddingVertical: 8,
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
    width: 120,
    height: 40,
  },
  backButton: {
    padding: 12,
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
    letterSpacing: 0.5,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(199, 6, 40, 0.4)',
  },
  signOutText: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to clear footer
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
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quoteButton: {
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    borderColor: '#c70628',
  },
  menuIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quoteTitle: {
    color: '#c70628',
    fontWeight: '700',
  },
  menuDescription: {
    color: '#A0A0A0',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#040404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingBottom: 16, // Reduced to avoid excessive spacing
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  footerTabActive: {
    backgroundColor: 'rgba(199, 6, 40, 0.15)',
    borderTopWidth: 2,
    borderTopColor: '#c70628',
  },
  footerIcon: {
    fontSize: 22,
    marginBottom: 4,
    color: '#FFFFFF',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Home;