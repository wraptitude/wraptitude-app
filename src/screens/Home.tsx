import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { signOut } from 'aws-amplify/auth';

interface HomeProps {
  onSignOut: () => void;
}

const Home: React.FC<HomeProps> = ({ onSignOut }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut(); // Update parent's auth state
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome</Text>
        <Pressable 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Add your home page content here */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Dashboard</Text>
          {/* Add dashboard items */}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {/* Add activity items */}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
});

export default Home; 