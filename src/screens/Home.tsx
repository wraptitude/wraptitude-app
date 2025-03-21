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
} from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import ServiceTracking from './ServiceTracking';
import ServiceHistory from './ServiceHistory';
import KnowledgeBase from './KnowledgeBase';
import ContactUs from './ContactUs';

interface HomeProps {
  onSignOut: () => void;
}

type Screen = 'menu' | 'tracking' | 'history' | 'knowledge' | 'contact';

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
        default:
          return (
            <View style={styles.menuContainer}>
              <Animated.View style={[{ transform: [{ scale: buttonScales.tracking }] }]}>
                <Pressable 
                  style={styles.menuButton}
                  onPress={() => {
                    animatePress(buttonScales.tracking);
                    handleScreenTransition('tracking');
                  }}
                >
                  <Text style={styles.menuIcon}>🚗</Text>
                  <Text style={styles.menuText}>Service Tracking</Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[{ transform: [{ scale: buttonScales.history }] }]}>
                <Pressable 
                  style={styles.menuButton}
                  onPress={() => {
                    animatePress(buttonScales.history);
                    handleScreenTransition('history');
                  }}
                >
                  <Text style={styles.menuIcon}>📋</Text>
                  <Text style={styles.menuText}>Service History</Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[{ transform: [{ scale: buttonScales.knowledge }] }]}>
                <Pressable 
                  style={styles.menuButton}
                  onPress={() => {
                    animatePress(buttonScales.knowledge);
                    handleScreenTransition('knowledge');
                  }}
                >
                  <Text style={styles.menuIcon}>📚</Text>
                  <Text style={styles.menuText}>Knowledge Base</Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[{ transform: [{ scale: buttonScales.contact }] }]}>
                <Pressable 
                  style={styles.menuButton}
                  onPress={() => {
                    animatePress(buttonScales.contact);
                    handleScreenTransition('contact');
                  }}
                >
                  <Text style={styles.menuIcon}>📞</Text>
                  <Text style={styles.menuText}>Contact Us</Text>
                </Pressable>
              </Animated.View>
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
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {currentScreen === 'menu' ? 'Welcome' : (
              <Pressable onPress={() => setCurrentScreen('menu')}>
                <Text style={styles.backButton}>← Back</Text>
              </Pressable>
            )}
          </Text>
          <Pressable 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        {renderScreen()}
      </SafeAreaView>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  signOutButton: {
    padding: 10,
  },
  signOutText: {
    color: '#c70628',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#040404',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
  },
  menuButton: {
    width: buttonWidth,
    height: buttonWidth,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Home; 