import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import ServiceTracking from './ServiceTracking';
import { getCurrentUser} from 'aws-amplify/auth';


interface HomeProps {
  onSignOut: () => void;
}

const Home: React.FC<HomeProps> = ({ onSignOut }) => {
  const [userAttributes, setUserAttributes] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
        console.log('User:', attributes);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);
  
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      // Then update state and clean up auth
      onSignOut();
      await signOut();
      console.log('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
          <Text style={styles.headerTitle}>Welcome {userAttributes?.name}</Text>
          <Pressable 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <ServiceTracking />
      </SafeAreaView>
    </View>
  );
};

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
});

export default Home; 