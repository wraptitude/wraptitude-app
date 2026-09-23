import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  Alert as RNAlert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Amplify } from 'aws-amplify';
import { Authenticator, ThemeProvider, useAuthenticator } from '@aws-amplify/ui-react-native';
import awsconfig from './src/aws-exports';
import { Picker } from '@react-native-picker/picker';
import { signIn, getCurrentUser, signUp, signOut, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import Home from './src/screens/Home';
import { appStyles } from './src/styles/appStyles';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BranchProvider } from './src/branch/BranchContext';
import VersionGate from './src/update/VersionGate';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/styles/theme';

// Configure Amplify
Amplify.configure(awsconfig);

const Stack = createNativeStackNavigator();

// Add this theme object before your App component
const theme = {
  tokens: {
    colors: {
      background: {
        primary: 'transparent',
        secondary: 'transparent',
      },
      primary: {
        10: colors.red,
        20: colors.red,
        40: colors.red,
        60: colors.red,
        80: colors.red,
        90: colors.red,
        100: colors.red,
      },
      neutral: {
        60: colors.subtle,
        80: colors.muted,
        90: colors.text,
        100: colors.text,
      },
    },
  },
};


function App(): React.JSX.Element {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Add a proper sign out function
  const handleSignOut = async () => {
    if (isGuestMode) {
      setIsGuestMode(false);
      return;
    }
    try {
      await signOut();
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const components = {
    Header() {
      return (
        <View style={appStyles.headerContainer}>
          <Image
            source={require('./src/assets/images/wraptitude-logo.webp')}
            style={appStyles.logoImage}
            resizeMode="contain"
          />
        </View>
      );
    },
  };
  const CustomSignIn = () => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+1');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Get navigation methods from useAuthenticator
    const { toSignUp, toForgotPassword } = useAuthenticator();

    const formatPhoneNumber = (text: string) => {
      const cleaned = text.replace(/\D/g, '');

      switch (cleaned.length) {
        case 0:
          return '';
        case 1:
        case 2:
        case 3:
          return `(${cleaned}`;
        case 4:
        case 5:
        case 6:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        default:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    };

    const handleSubmit = async () => {
      if (!phoneNumber || !password) {
        RNAlert.alert('Error', 'Please enter both phone number and password');
        return;
      }

      setIsLoading(true);
      try {
        const fullNumber = `${selectedCode}${phoneNumber.replace(/\D/g, '')}`;
        const { isSignedIn, nextStep } = await signIn({
          username: fullNumber,
          password: password,
        });

        if (isSignedIn) {
          setIsAuthenticated(true);
        } else if (nextStep) {
          switch (nextStep.signInStep) {
            case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
              RNAlert.alert('Verification Required', 'Please check your phone for a verification code.');
              break;
            case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
              RNAlert.alert('Action Required', 'Please update your password.');
              break;
            default:
              RNAlert.alert('Additional verification required', 'Please complete the sign-in step before accessing your account.');
          }
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        RNAlert.alert('Unable to sign in', 'Please check your phone number and password.');
      } finally {
        setIsLoading(false);
      }
    };

    return (

      <ScrollView style={appStyles.rootContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={appStyles.signInContainer}>
          <Text style={appStyles.signUpTitle}>Welcome back.</Text>
          <Text style={appStyles.formSubtitle}>Sign in to follow your services and manage your visits.</Text>

          <Text style={appStyles.inputLabel}>Phone number</Text>
          <View style={appStyles.phoneFieldContainer}>
            <View style={appStyles.countryCodePicker}>

              <Picker
                selectedValue={selectedCode}
                onValueChange={setSelectedCode}
                style={appStyles.picker}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="+1" value="+1" color="#FFFFFF" />
              </Picker>
            </View>
            <TextInput
              style={appStyles.phoneInput}
              placeholder="(XXX) XXX-XXXX"
              placeholderTextColor="#7c7c7c"
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={14}
              value={phoneNumber}
              onChangeText={(text) => {
                const formatted = formatPhoneNumber(text);
                setPhoneNumber(formatted);
              }}
            />
          </View>

          <Text style={appStyles.inputLabel}>Password</Text>
          <TextInput
            style={appStyles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#7c7c7c"
            secureTextEntry
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[
              appStyles.signUpButton,
              isLoading && appStyles.signInButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={appStyles.signUpButtonText}>Sign In</Text>
            )}
          </Pressable>
          {/* Sign In Link */}
          <Pressable onPress={toSignUp} style={appStyles.signInLink} accessibilityRole="button">
            <Text style={appStyles.signInLinkText}>Create Account</Text>
          </Pressable>

          <Pressable onPress={toForgotPassword} style={appStyles.signInLink} accessibilityRole="button">
            <Text style={appStyles.signInLinkText}>Forgot Password?</Text>
          </Pressable>

          <Pressable onPress={() => setIsGuestMode(true)} style={appStyles.guestModeButton} accessibilityRole="button">
            <Text style={appStyles.guestModeText}>Continue as Guest</Text>
          </Pressable>
        </View>
      </ScrollView>

    );
  };

  const CustomSignUp = () => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+1');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const { toSignIn } = useAuthenticator();

    const formatPhoneNumber = (text: string) => {
      const cleaned = text.replace(/\D/g, '');

      switch (cleaned.length) {
        case 0:
          return '';
        case 1:
        case 2:
        case 3:
          return `(${cleaned}`;
        case 4:
        case 5:
        case 6:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        default:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    };

    const handleSignUp = async () => {
      if (!phoneNumber || !password || !confirmPassword || !email || !name) {
        RNAlert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (password !== confirmPassword) {
        RNAlert.alert('Error', 'Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const fullNumber = `${selectedCode}${phoneNumber.replace(/\D/g, '')}`;
        const { isSignUpComplete, nextStep } = await signUp({
          username: fullNumber,
          password: password,
          options: {
            userAttributes: {
              email: email,
              name: name,
            },
          },
        });

        if (isSignUpComplete) {
          RNAlert.alert(
            'Success',
            'Account created successfully! Please sign in.',
            [{ text: 'OK', onPress: () => toSignIn() }]
          );
        } else if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
          RNAlert.alert(
            'Verification Required',
            'Please check your phone for the verification code.'
          );
        }
      } catch (error: any) {
        console.error('Sign up error:', error);
        RNAlert.alert('Error', error.message || 'Failed to create account');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <ScrollView style={appStyles.rootContainer} contentContainerStyle={appStyles.signUpContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={appStyles.signUpTitle}>Create Account</Text>
        <Text style={appStyles.formSubtitle}>Create one account for both Wraptitude locations.</Text>

        {/* Phone Number Input */}
        <Text style={appStyles.inputLabel}>Phone Number</Text>
        <View style={appStyles.phoneFieldContainer}>
          <View style={appStyles.countryCodePicker}>
            <Picker
              selectedValue={selectedCode}
              onValueChange={setSelectedCode}
              style={appStyles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="+1" value="+1" color="#FFFFFF" />
              <Picker.Item label="+44" value="+44" color="#FFFFFF" />
              <Picker.Item label="+86" value="+86" color="#FFFFFF" />
              <Picker.Item label="+81" value="+81" color="#FFFFFF" />
            </Picker>
          </View>
          <TextInput
            style={appStyles.phoneInput}
            placeholder="(XXX) XXX-XXXX"
            placeholderTextColor="#7c7c7c"
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={14}
            value={phoneNumber}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              setPhoneNumber(formatted);
            }}
          />
        </View>

        {/* Password Input */}
        <Text style={appStyles.inputLabel}>Password</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Enter your Password"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password Input */}
        <Text style={appStyles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Please confirm your Password"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Email Input */}
        <Text style={appStyles.inputLabel}>Email</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Enter your Email"
          placeholderTextColor="#7c7c7c"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        {/* Name Input */}
        <Text style={appStyles.inputLabel}>Name</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Enter your Name"
          placeholderTextColor="#7c7c7c"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />

        {/* Sign Up Button */}
        <Pressable
          style={[
            appStyles.signUpButton,
            isLoading && appStyles.signUpButtonDisabled,
          ]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={appStyles.signUpButtonText}>Create Account</Text>
          )}
        </Pressable>

        {/* Sign In Link */}
        <Pressable onPress={toSignIn} style={appStyles.signInLink}>
          <Text style={appStyles.signInLinkText}>Sign In</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // Custom Forgot Password component
  const CustomForgotPassword = () => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+1');
    const [verificationCode, setVerificationCode] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [codeSent, setCodeSent] = React.useState(false);

    const { toSignIn } = useAuthenticator();

    const formatPhoneNumber = (text: string) => {
      const cleaned = text.replace(/\D/g, '');

      switch (cleaned.length) {
        case 0:
          return '';
        case 1:
        case 2:
        case 3:
          return `(${cleaned}`;
        case 4:
        case 5:
        case 6:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        default:
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    };

    const handleSendCode = async () => {
      if (!phoneNumber) {
        RNAlert.alert('Error', 'Please enter your phone number');
        return;
      }

      setIsLoading(true);
      try {
        const fullNumber = `${selectedCode}${phoneNumber.replace(/\D/g, '')}`;
        await resetPassword({
          username: fullNumber,
        });

        setCodeSent(true);
        RNAlert.alert(
          'Code Sent',
          'A verification code has been sent to your email.'
        );
      } catch (error: any) {
        console.error('Reset password error:', error);
        RNAlert.alert('Error', error.message || 'Failed to send verification code');
      } finally {
        setIsLoading(false);
      }
    };

    const handleConfirmReset = async () => {
      if (!verificationCode || !newPassword || !confirmNewPassword) {
        RNAlert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        RNAlert.alert('Error', 'Passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        RNAlert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      setIsLoading(true);
      try {
        const fullNumber = `${selectedCode}${phoneNumber.replace(/\D/g, '')}`;
        await confirmResetPassword({
          username: fullNumber,
          confirmationCode: verificationCode,
          newPassword: newPassword,
        });

        RNAlert.alert(
          'Success',
          'Password reset successfully! You can now sign in with your new password.',
          [{ text: 'OK', onPress: () => toSignIn() }]
        );
      } catch (error: any) {
        console.error('Confirm reset password error:', error);
        RNAlert.alert('Error', error.message || 'Failed to reset password');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={appStyles.rootContainer}>
        <ScrollView contentContainerStyle={appStyles.forgotPasswordContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={appStyles.forgotPasswordTitle}>
            {codeSent ? 'Reset Password' : 'Forgot Password'}
          </Text>
          <Text style={appStyles.formSubtitle}>We’ll help you get back into your account.</Text>

          {!codeSent ? (
            <>
              <Text style={appStyles.inputLabel}>Phone Number</Text>
              <View style={appStyles.phoneFieldContainer}>
                <View style={appStyles.countryCodePicker}>
                  <Picker
                    selectedValue={selectedCode}
                    onValueChange={setSelectedCode}
                    style={appStyles.picker}
                    dropdownIconColor="#FFFFFF"
                  >
                    <Picker.Item label="+1" value="+1" color="#FFFFFF" />
                    <Picker.Item label="+44" value="+44" color="#FFFFFF" />
                    <Picker.Item label="+86" value="+86" color="#FFFFFF" />
                    <Picker.Item label="+81" value="+81" color="#FFFFFF" />
                  </Picker>
                </View>
                <TextInput
                  style={appStyles.phoneInput}
                  placeholder="(XXX) XXX-XXXX"
                  placeholderTextColor="#7c7c7c"
                  keyboardType="phone-pad"
                  maxLength={14}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    const formatted = formatPhoneNumber(text);
                    setPhoneNumber(formatted);
                  }}
                />
              </View>

              <Pressable
                style={[
                  appStyles.sendCodeButton,
                  isLoading && appStyles.buttonDisabled,
                ]}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={appStyles.buttonText}>Send Code</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={appStyles.inputLabel}>Verification Code</Text>
              <TextInput
                style={appStyles.input}
                placeholder="Enter verification code"
                placeholderTextColor="#7c7c7c"
                keyboardType="number-pad"
                value={verificationCode}
                onChangeText={setVerificationCode}
              />

              <Text style={appStyles.inputLabel}>New Password</Text>
              <TextInput
                style={appStyles.input}
                placeholder="Enter new password"
                placeholderTextColor="#7c7c7c"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={appStyles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={appStyles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#7c7c7c"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />

              <Pressable
                style={[
                  appStyles.sendCodeButton,
                  isLoading && appStyles.buttonDisabled,
                ]}
                onPress={handleConfirmReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={appStyles.buttonText}>Reset Password</Text>
                )}
              </Pressable>
            </>
          )}

          <Pressable onPress={toSignIn} style={appStyles.backToSignIn}>
            <Text style={appStyles.backToSignInText}>Back to Sign In</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  };
  if (isCheckingAuth) {
    return (
      <View style={appStyles.loadingContainer}>
        <Image source={require('./src/assets/images/wraptitude-logo.webp')} style={appStyles.logoImage} resizeMode="contain" />
        <ActivityIndicator color={colors.red} style={appStyles.loadingIndicator} />
      </View>
    );
  }

  if (isAuthenticated || isGuestMode) {
    return (
      <View style={appStyles.rootContainer}>
        <ThemeProvider>
          <Authenticator.Provider>
            <BranchProvider>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen
                    name="Home"
                    component={Home as React.ComponentType<any>}
                    options={{ headerShown: false }}
                    initialParams={{ onSignOut: handleSignOut, isGuestMode: isGuestMode }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </BranchProvider>
          </Authenticator.Provider>
        </ThemeProvider>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('./src/assets/images/wrap.webp')}
      style={appStyles.backgroundImage}
      resizeMode="cover"
      blurRadius={8}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ThemeProvider theme={theme}>
        <Authenticator.Provider>
          <View style={appStyles.rootContainer}>
            <Authenticator
              Header={components.Header}
              components={{
                SignIn: CustomSignIn,
                SignUp: CustomSignUp,
                ForgotPassword: CustomForgotPassword,
              }}
            />
          </View>
        </Authenticator.Provider>
      </ThemeProvider>
    </ImageBackground>

  );

}

export default function RootApp(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <VersionGate>
        <App />
      </VersionGate>
    </SafeAreaProvider>
  );
}
