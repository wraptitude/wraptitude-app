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
} from 'react-native';
import { signOut } from 'aws-amplify/auth';


interface HomeProps {
  onSignOut: () => void;
}



const Home: React.FC<HomeProps> = ({ onSignOut }) => {



  const handleSignOut = async () => {
    try {
      onSignOut();
      await signOut();
      console.log('Signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  return (
    <View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const buttonWidth = (width - 60) / 2;



export default Home; 