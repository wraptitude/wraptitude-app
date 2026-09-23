import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, Keyboard, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

import BranchSelector from '../branch/BranchSelector';
import { useBranch } from '../branch/BranchContext';
import { BranchId } from '../branch/config';
import { colors } from '../styles/theme';
import About from './About';
import AIChatbot from './AIChatbot';
import ContactUs from './ContactUs';
import EmergencyService from './EmergencyService';
import EmergencyServiceUrgentNonUrgent from './EmergencyServiceUrgentNonUrgent';
import FreeQuote from './FreeQuote';
import Gallery from './Gallery';
import HomeDashboard, { DashboardScreen } from './HomeDashboard';
import KnowledgeBase from './KnowledgeBase';
import News from './News';
import NewsDetail from './NewsDetail';
import NonUrgentForm from './NonUrgentForm';
import Profile from './Profile';
import ServiceHistory from './ServiceHistory';
import ServiceTracking from './ServiceTracking';
import Services from './Services';

interface HomeProps {
  route: {
    params: {
      onSignOut: () => Promise<void> | void;
      isGuestMode: boolean;
    };
  };
}

interface BlogPost {
  id: string;
  image: string;
  category: string;
  date: string;
  author: string;
  title: string;
  description: string;
  content: string;
}

type Screen = DashboardScreen | 'menu' | 'profile' | 'newsDetail' | 'emergencyUrgentNonUrgent' | 'nonUrgentForm';
type MainTab = 'menu' | 'tracking' | 'quote' | 'profile';

const screenTitles: Record<Screen, string> = {
  menu: 'Home',
  tracking: 'Service Tracking',
  history: 'Service History',
  services: 'Our Services',
  knowledge: 'Knowledge Base',
  gallery: 'Gallery',
  about: 'About Us',
  contact: 'Contact Us',
  profile: 'My Profile',
  news: 'News',
  newsDetail: 'News',
  emergency: 'Emergency Service',
  emergencyUrgentNonUrgent: 'Emergency Service',
  nonUrgentForm: 'Emergency Request',
  quote: 'Free Quote',
  chatbot: 'AI Assistant',
};

const tabs: { screen: MainTab; label: string; icon: string }[] = [
  { screen: 'menu', label: 'Home', icon: 'home' },
  { screen: 'tracking', label: 'Tracking', icon: 'directions-car' },
  { screen: 'quote', label: 'Quote', icon: 'request-quote' },
  { screen: 'profile', label: 'Profile', icon: 'person' },
];

const protectedScreens = new Set<Screen>([
  'tracking', 'history', 'emergency', 'emergencyUrgentNonUrgent', 'nonUrgentForm', 'profile',
]);

const Home: React.FC<HomeProps> = ({ route }) => {
  const { branchId, selectionVersion, setBranchId } = useBranch();
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedEmergencyService, setSelectedEmergencyService] = useState('');
  const [quoteSource, setQuoteSource] = useState<Screen>('menu');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const previousSelectionVersion = useRef(selectionVersion);
  const isGuestMode = route.params.isGuestMode;

  useEffect(() => {
    if (previousSelectionVersion.current !== selectionVersion) {
      previousSelectionVersion.current = selectionVersion;
      setCurrentScreen('menu');
      setSelectedPost(null);
      setSelectedService(null);
      setSelectedEmergencyService('');
      setQuoteSource('menu');
    }
  }, [selectionVersion]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }
    setIsSigningOut(true);
    try {
      await route.params.onSignOut();
    } catch {
      Alert.alert('Unable to sign out', 'Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const navigateTo = (screen: Screen) => {
    if (isGuestMode && protectedScreens.has(screen)) {
      Alert.alert('Sign in required', 'Sign in to view your services or request emergency help.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Sign in', onPress: () => { handleSignOut().catch(() => undefined); } },
      ]);
      return;
    }
    if (screen === 'quote' && currentScreen !== 'quote') {
      setQuoteSource(currentScreen);
      if (currentScreen !== 'services') {
        setSelectedService(null);
      }
    }
    setCurrentScreen(screen);
  };

  const changeBranch = (nextBranchId: BranchId) => {
    if (nextBranchId === branchId) {
      return;
    }
    if (currentScreen === 'quote' || currentScreen === 'nonUrgentForm') {
      Alert.alert(
        'Switch location?',
        'Your unfinished form will be cleared when you switch locations.',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Switch location', onPress: () => setBranchId(nextBranchId) },
        ],
      );
    } else {
      setBranchId(nextBranchId);
    }
  };

  const goBack = useCallback(() => {
    if (currentScreen === 'newsDetail') {
      setCurrentScreen('news');
    } else if (currentScreen === 'quote') {
      setCurrentScreen(quoteSource);
    } else if (currentScreen === 'emergencyUrgentNonUrgent') {
      setCurrentScreen('emergency');
    } else if (currentScreen === 'nonUrgentForm') {
      setCurrentScreen('emergencyUrgentNonUrgent');
    } else {
      setCurrentScreen('menu');
    }
  }, [currentScreen, quoteSource]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 'menu') {
        return false;
      }
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [currentScreen, goBack]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <HomeDashboard isGuestMode={isGuestMode} onNavigate={navigateTo} />;
      case 'tracking': return <ServiceTracking />;
      case 'history': return <ServiceHistory />;
      case 'services':
        return <Services onGetQuote={(service) => {
          setSelectedService(service);
          setQuoteSource('services');
          setCurrentScreen('quote');
        }} />;
      case 'knowledge': return <KnowledgeBase />;
      case 'gallery': return <Gallery />;
      case 'about': return <About />;
      case 'contact': return <ContactUs />;
      case 'profile': return <Profile />;
      case 'news':
        return <News onPostPress={(post) => {
          setSelectedPost(post);
          setCurrentScreen('newsDetail');
        }} />;
      case 'newsDetail': return selectedPost ? <NewsDetail post={selectedPost} /> : null;
      case 'emergency':
        return <EmergencyService onServiceSelect={(service) => {
          setSelectedEmergencyService(service);
          setCurrentScreen('emergencyUrgentNonUrgent');
        }} />;
      case 'emergencyUrgentNonUrgent':
        return <EmergencyServiceUrgentNonUrgent
          serviceId={selectedEmergencyService}
          onNonUrgentSelect={() => setCurrentScreen('nonUrgentForm')}
          onGoBack={() => setCurrentScreen('emergency')}
        />;
      case 'nonUrgentForm':
        return <NonUrgentForm
          serviceId={selectedEmergencyService}
          onGoBack={() => setCurrentScreen('emergencyUrgentNonUrgent')}
          onSubmitSuccess={() => setCurrentScreen('menu')}
        />;
      case 'quote':
        return <FreeQuote selectedService={selectedService ?? undefined} onGoBack={goBack} />;
      case 'chatbot': return <AIChatbot />;
      default: return null;
    }
  };

  if (isSigningOut) {
    return <View style={styles.loading}><ActivityIndicator color={colors.red} size="large" /></View>;
  }

  const activeTab = tabs.find((tab) => tab.screen === currentScreen)?.screen;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} translucent={false} />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {currentScreen === 'menu' ? (
            <Image source={require('../assets/images/wraptitude-logo.webp')} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={styles.detailHeading}>
              <Pressable
                style={styles.backButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Icon name="arrow-back" size={23} color={colors.text} />
              </Pressable>
              <Text style={styles.screenTitle} numberOfLines={1}>{screenTitles[currentScreen]}</Text>
            </View>
          )}
          {currentScreen === 'menu' && (
            <Pressable
              style={styles.signButton}
              onPress={() => { handleSignOut().catch(() => undefined); }}
              accessibilityRole="button"
              accessibilityLabel={isGuestMode ? 'Sign in' : 'Sign out'}
            >
              <Text style={styles.signText}>{isGuestMode ? 'Sign in' : 'Sign out'}</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.branchRow}>
          <Text style={styles.branchLabel}>SELECT LOCATION</Text>
          <BranchSelector onChange={changeBranch} />
        </View>
      </View>

      <View style={styles.body} key={`${currentScreen}:${selectionVersion}`}>
        {renderScreen()}
      </View>

      {!keyboardVisible && <View style={styles.bottomNav} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const active = activeTab === tab.screen;
          const locked = isGuestMode && (tab.screen === 'tracking' || tab.screen === 'profile');
          return (
            <Pressable
              key={tab.screen}
              style={styles.bottomTab}
              onPress={() => navigateTo(tab.screen)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={locked ? `${tab.label}, sign in required` : tab.label}
            >
              <View style={[styles.tabIconWrap, active && styles.activeIconWrap]}>
                <Icon name={tab.icon} size={23} color={active ? colors.text : colors.muted} />
                {locked && <Icon name="lock" size={11} color={colors.redLight} style={styles.tabLock} />}
              </View>
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerRow: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 150, height: 38 },
  detailHeading: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginRight: 12 },
  screenTitle: { color: colors.text, fontSize: 19, fontWeight: '700', flex: 1 },
  signButton: { minHeight: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  signText: { color: colors.redLight, fontSize: 14, fontWeight: '700' },
  branchRow: { marginTop: 8 },
  branchLabel: { color: colors.subtle, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  body: { flex: 1 },
  bottomNav: { flexDirection: 'row', backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8, paddingBottom: 5 },
  bottomTab: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: { width: 52, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  activeIconWrap: { backgroundColor: colors.red },
  tabLock: { position: 'absolute', top: 0, right: 7 },
  tabLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 3 },
  activeTabLabel: { color: colors.text },
});

export default Home;
