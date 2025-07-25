import React, { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform,
  Image,
  TextInput,
  Pressable,
  Alert as RNAlert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Button } from 'react-native';
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator, AuthenticatorProps, ThemeProvider, useAuthenticator, useTheme } from '@aws-amplify/ui-react-native';
import awsconfig from './src/aws-exports';
import { SignIn } from '@aws-amplify/ui-react-native/dist/Authenticator/Defaults/SignIn';
import { Picker } from '@react-native-picker/picker';
import { signIn, getCurrentUser, signUp, signOut, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import Home from './src/screens/Home';
import { appStyles } from './src/styles/appStyles';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Services from './src/screens/Services';
import FreeQuote from './src/screens/FreeQuote';
import EmergencyService from './src/screens/EmergencyService';
import EmergencyServiceUrgentNonUrgent from './src/screens/EmergencyServiceUrgentNonUrgent';
import NonUrgentForm from './src/screens/NonUrgentForm';

// Configure Amplify
Amplify.configure(awsconfig);

const Stack = createNativeStackNavigator();

// Add this theme object before your App component
const theme = {
  tokens: {
    colors: {
      background: {
        primary: 'transparent', // Ensure Authenticator background is transparent
        secondary: 'transparent',
      },
      primary: {
        10: '#FF0000',
        20: '#FF0000',
        40: '#FF0000',
        60: '#FF0000',
        80: '#c70628', //sign in button & forgot password & create account
        90: '#FF0000',
        100: '#FF0000',
      },
      neutral: {
        60: '#7c7c7c', //email &PW框
        80: '#7c7c7c', //enter your email & enter your password
        90: '#FFFFFF', //email &PW
        100: '#FFFFFF', //sign in
      },
    },
  },
};


type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={appStyles.sectionContainer}>
      <Text
        style={[
          appStyles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          appStyles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
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
    }
  };

  // Add a proper sign out function
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const safePadding = '5%';

  useEffect(() => {
    if (Platform.OS === 'android') {
      SplashScreen.hide();
    }
  }, []);

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
  // const { toForgotPassword } = useAuthenticator();
  // Custom Sign In component
  const CustomSignIn = ({ fields, ...props }) => {
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
          password: password
        });

        if (isSignedIn) {
          console.log('Successfully signed in');
          setIsAuthenticated(true); // Update auth state
        } else if (nextStep) {
          switch (nextStep.signInStep) {
            case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
              RNAlert.alert('Verification Required', 'Please check your phone for a verification code.');
              break;
            case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
              RNAlert.alert('Action Required', 'Please update your password.');
              break;
            default:
              console.log('Additional step required:', nextStep.signInStep);
              setIsAuthenticated(true); // Update auth state
          }
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        RNAlert.alert(
          'Error',
          'Incorrect phone number or password' || 'Failed to sign in. Please check your credentials.'
          // error.message || 'Failed to sign in. Please check your credentials.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    return (

      <View style={appStyles.rootContainer}>

        <View style={appStyles.signInContainer}>
          <View style={appStyles.overlay} />
          {/* <View style={appStyles.formContainer}> */}
          <Text style={appStyles.signUpTitle}>Sign In</Text>

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
              maxLength={14}
              value={phoneNumber}
              onChangeText={(text) => {
                const formatted = formatPhoneNumber(text);
                setPhoneNumber(formatted);
              }}
            />
          </View>

          <TextInput
            style={appStyles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#7c7c7c"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[
              appStyles.signUpButton,
              isLoading && appStyles.signInButtonDisabled
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
          <Pressable onPress={toSignUp} style={appStyles.signInLink}>
            <Text style={appStyles.signInLinkText}>Create Account</Text>
          </Pressable>

          <Pressable onPress={toForgotPassword} style={appStyles.signInLink}>
            <Text style={appStyles.signInLinkText}>Forgot Password?</Text>
          </Pressable>

          <Pressable onPress={() => setIsGuestMode(true)} style={appStyles.signInLink}>
            <Text style={appStyles.guestModeText}>Continue as Guest</Text>
          </Pressable>
        </View>
      </View>

    );
  };

  const CustomSignUp = (props: AuthenticatorProps) => {
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
        const { isSignUpComplete, userId, nextStep } = await signUp({
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
      <View style={appStyles.signUpContainer}>
        <View style={appStyles.overlay} />
        <Text style={appStyles.signUpTitle}>Create Account</Text>

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
        />

        {/* Sign Up Button */}
        <Pressable
          style={[
            appStyles.signUpButton,
            isLoading && appStyles.signUpButtonDisabled
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
      </View>
    );
  };

  // Custom Forgot Password component
  const CustomForgotPassword = ({ fields, ...props }) => {
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
          username: fullNumber
        });
        
        setCodeSent(true);
        RNAlert.alert(
          'Code Sent',
          'A verification code has been sent to your phone number.'
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
          newPassword: newPassword
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
        <View style={appStyles.forgotPasswordContainer}>
          <View style={appStyles.overlay} />
          <Text style={appStyles.forgotPasswordTitle}>
            {codeSent ? 'Reset Password' : 'Forgot Password'}
          </Text>

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
                  isLoading && appStyles.buttonDisabled
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
                  isLoading && appStyles.buttonDisabled
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
        </View>
      </View>
    );
  };
  // If authenticated, show Home directly
  if (isAuthenticated || isGuestMode) {
    return (
      <ImageBackground
        source={require('./src/assets/images/1.jpg')} // Your background image
        style={appStyles.backgroundImage}
        resizeMode="cover"
      >
        <ThemeProvider>
          <Authenticator.Provider>
            <View style={{ flex: 1, backgroundColor: '#040404' }}>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{ headerShown: false }}
                    initialParams={{ onSignOut: handleSignOut, isGuestMode: isGuestMode }}
                  />
                  <Stack.Screen
                    name="Services"
                    component={Services}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="FreeQuote"
                    component={FreeQuote}
                    options={{
                      headerShown: true,
                      headerTitle: "Free Quote",
                      headerBackTitle: "Back",
                      headerStyle: {
                        backgroundColor: '#040404',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                    }}
                  />
                  <Stack.Screen name="EmergencyService" component={EmergencyService}
                    options={{
                      headerShown: true,
                      headerTitle: "Emergency Service",
                      headerBackTitle: "Back",
                      headerStyle: {
                        backgroundColor: '#040404',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                    }} />
                  <Stack.Screen name="EmergencyServiceUrgentNonUrgent" component={EmergencyServiceUrgentNonUrgent}
                    options={{
                      headerShown: true,
                      headerTitle: "Emergency Service",
                      headerBackTitle: "Back",
                      headerStyle: {
                        backgroundColor: '#040404',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                    }} />
                  <Stack.Screen name="NonUrgentForm" component={NonUrgentForm}
                    options={{
                      headerShown: true,
                      headerTitle: "Non-Urgent Form",
                      headerBackTitle: "Back",
                      headerStyle: {
                        backgroundColor: '#040404',
                      },
                      headerTintColor: '#fff',
                      headerTitleStyle: {
                        fontWeight: 'bold',
                      },
                    }} />
                </Stack.Navigator>
              </NavigationContainer>
              {/* <Home onSignOut={() => setIsAuthenticated(false)} /> */}
            </View>
          </Authenticator.Provider>
        </ThemeProvider>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('./src/assets/images/1.jpg')} // Your background image
      style={appStyles.backgroundImage}
      resizeMode="cover"
    >
      <ThemeProvider theme={theme}>
        <Authenticator.Provider>
          <View style={appStyles.rootContainer}>
            {/* <Text>.</Text> */}
            <Authenticator
              Header={components.Header}
              components={{
                SignIn: CustomSignIn,
                SignUp: CustomSignUp,
                ForgotPassword: CustomForgotPassword,
              }}
            >
            </Authenticator>
          </View>
        </Authenticator.Provider>
      </ThemeProvider>
    </ImageBackground>

  );

}

export default App;
