import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import ServiceTracking from './ServiceTracking';
import ServiceHistory from './ServiceHistory';
import KnowledgeBase from './KnowledgeBase';
import ContactUs from './ContactUs';
import Services from './Services';

interface HomeProps {
  onSignOut: () => void;
}

type Screen = 'menu' | 'tracking' | 'history' | 'services' | 'knowledge' | 'gallery' | 'about' | 'contact' | 'news';

const Home: React.FC<HomeProps> = ({ onSignOut }) => {
  const { toSignIn } = useAuthenticator();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  
  // Add animation values for each button
  const buttonScales = {
    tracking: useRef(new Animated.Value(1)).current,
    history: useRef(new Animated.Value(1)).current,
    knowledge: useRef(new Animated.Value(1)).current,
    contact: useRef(new Animated.Value(1)).current,
    services: useRef(new Animated.Value(1)).current,
    // emergency: useRef(new Animated.Value(1)).current,
  };

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateY = useRef(new Animated.Value(0)).current;

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
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
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentScreen(screen);
      screenOpacity.setValue(0);
      screenTranslateY.setValue(-20);
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
      onSignOut();
      await signOut();
      console.log('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'tracking',
      icon: '🚗',
      title: 'Service Tracking',
      description: 'Track your vehicle service progress'
    },
    {
      id: 'history',
      icon: '📋',
      title: 'Service History',
      description: 'View your past services'
    },
    {
      id: 'services',
      icon: '🛠️',
      title: 'Our Services',
      description: 'Explore our professional services'
    },
    {
      id: 'knowledge',
      icon: '📚',
      title: 'Knowledge Base',
      description: 'Learn about car films'
    },
    {
      id: 'gallery',
      icon: '📸',
      title: 'Gallery',
      description: 'View our recent work'
    },
    {
      id: 'news',
      icon: '📰',
      title: 'News',
      description: 'Latest updates'
    },
    {
      id: 'about',
      icon: '👥',
      title: 'About Us',
      description: 'Learn more about Wraptitude'
    },
    {
      id: 'emergency', 
      icon: '🚨',
      title: 'Emergency Service',
      description: 'Call for emergency service'
    },
    {
      id: 'contact',
      icon: '📞',
      title: 'Contact Us',
      description: 'Get in touch'
    },
  ];

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
        default:
          return (
            <View style={styles.menuContainer}>
              {menuItems.map((item) => (
                <Animated.View 
                  key={item.id}
                  style={[{ transform: [{ scale: buttonScales[item.id] || new Animated.Value(1) }] }]}
                >
                  <Pressable 
                    style={styles.menuButton}
                    onPress={() => {
                      animatePress(buttonScales[item.id]);
                      handleScreenTransition(item.id as Screen);
                    }}
                  >
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          );
      }
    };

    return (
      <Animated.View style={{
        flex: 1,
        opacity: screenOpacity,
        transform: [{ translateY: screenTranslateY }],
      }}>
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
      blurRadius={5}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {currentScreen === 'menu' ? (
                <>
                  <Image 
                    source={require('../assets/images/wraptitude-logo.webp')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Pressable 
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                  >
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable 
                    style={styles.backButton}
                    onPress={() => setCurrentScreen('menu')}
                  >
                    <Text style={styles.backButtonText}>← Back</Text>
                  </Pressable>
                  <Text style={styles.screenTitle}>
                    {menuItems.find(item => item.id === currentScreen)?.title}
                  </Text>
                </>
              )}
            </View>
          </View>

          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {currentScreen === 'menu' && (
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome to Wraptitude</Text>
                <Text style={styles.welcomeDescription}>
                  Professional car film services with over 10 years of experience.
                  Specializing in window tinting, vinyl wraps, ceramic coating, and paint protection.
                </Text>
              </View>
            )}

            {currentScreen === 'menu' ? (
              <View style={styles.menuContainer}>
                {menuItems.map((item) => (
                  <Animated.View 
                    key={item.id}
                    style={[{ transform: [{ scale: buttonScales[item.id] || new Animated.Value(1) }] }]}
                  >
                    <Pressable 
                      style={styles.menuButton}
                      onPress={() => {
                        animatePress(buttonScales[item.id]);
                        handleScreenTransition(item.id as Screen);
                      }}
                    >
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            ) : (
              renderScreen()
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');
const buttonWidth = (width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'rgba(10,10,10,0.95)',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  signOutButton: {
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  signOutText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: 'rgba(26,26,26,0.9)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeDescription: {
    color: '#7c7c7c',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#040404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
  },
  menuButton: {
    width: buttonWidth,
    height: buttonWidth * 1.2,
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderRadius: 16,
    marginBottom: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  menuTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  menuDescription: {
    color: '#7c7c7c',
    fontSize: 12,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default Home; 