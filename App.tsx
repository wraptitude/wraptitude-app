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
import { Authenticator, ThemeProvider, useAuthenticator, useTheme } from '@aws-amplify/ui-react-native';
import awsconfig from './src/aws-exports';
import { SignIn } from '@aws-amplify/ui-react-native/dist/Authenticator/Defaults/SignIn';
import { Picker } from '@react-native-picker/picker';
import { signIn, getCurrentUser } from 'aws-amplify/auth';
import Home from './src/screens/Home';

// Configure Amplify
Amplify.configure(awsconfig);

// SignOutButton component
function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button title="Sign Out" onPress={signOut} />;
}

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
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
        <View style={styles.headerContainer}>
          <Image
            source={require('./src/assets/images/wraptitude.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      );
    },
  };
  const MySignIn = () => {
    return (
      <View>
        <Text style={styles.signInText}>My Sign In</Text>
      </View>
    );
  };
// const { toForgotPassword } = useAuthenticator();
  // Custom Sign In component
  const CustomSignIn = ({ fields, ...props }) => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+1');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Get navigation methods from useAuthenticator
    const { toForgotPassword, toSignUp } = useAuthenticator();

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
            case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD':
              RNAlert.alert('Action Required', 'Please update your password.');
              break;
            default:
              console.log('Additional step required:', nextStep.signInStep);
          }
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        RNAlert.alert(
          'Error',
          error.message || 'Failed to sign in. Please check your credentials.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={styles.signInContainer}>
        <Text style={styles.signInTitle}>Sign In</Text>
        
        <View style={styles.phoneFieldContainer}>
          <View style={styles.countryCodePicker}>
            <Picker
              selectedValue={selectedCode}
              onValueChange={setSelectedCode}
              style={styles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="+1" value="+1" color="#FFFFFF" />
              <Picker.Item label="+44" value="+44" color="#FFFFFF" />
              <Picker.Item label="+86" value="+86" color="#FFFFFF" />
              <Picker.Item label="+81" value="+81" color="#FFFFFF" />
            </Picker>
          </View>
          <TextInput
            style={styles.phoneInput}
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
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable 
          style={[
            styles.signInButton,
            isLoading && styles.signInButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </Pressable>

        <View style={styles.linksContainer}>
          <Pressable onPress={toForgotPassword}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>
          <Pressable onPress={toSignUp}>
            <Text style={styles.linkText}>Create Account</Text>
          </Pressable>
        </View>

        {/* <Authenticator.SignIn
          {...props}
          headerText=""
          hideSignIn={true}
        /> */}
      </View>
    );
  };

  const CustomSignUp = ({ fields, ...props }) => {
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
        await Auth.signUp({
          username: fullNumber,
          password,
          attributes: {
            email,
            name,
            phone_number: fullNumber
          }
        });
        RNAlert.alert(
          'Success',
          'Account created successfully! Please check your phone for verification code.',
          [{ text: 'OK', onPress: toSignIn }]
        );
      } catch (error: any) {
        console.error('Sign up error:', error);
        RNAlert.alert('Error', error.message || 'Failed to create account');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpTitle}>Create Account</Text>
        
        {/* Phone Number Input */}
        <Text style={styles.inputLabel}>Phone Number</Text>
        <View style={styles.phoneFieldContainer}>
          <View style={styles.countryCodePicker}>
            <Picker
              selectedValue={selectedCode}
              onValueChange={setSelectedCode}
              style={styles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="+1" value="+1" color="#FFFFFF" />
              <Picker.Item label="+44" value="+44" color="#FFFFFF" />
              <Picker.Item label="+86" value="+86" color="#FFFFFF" />
              <Picker.Item label="+81" value="+81" color="#FFFFFF" />
            </Picker>
          </View>
          <TextInput
            style={styles.phoneInput}
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
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password Input */}
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Please confirm your Password"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Email Input */}
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          placeholderTextColor="#7c7c7c"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Name Input */}
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Name"
          placeholderTextColor="#7c7c7c"
          value={name}
          onChangeText={setName}
        />

        {/* Sign Up Button */}
        <Pressable 
          style={[
            styles.signUpButton,
            isLoading && styles.signUpButtonDisabled
          ]}
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </Pressable>

        {/* Sign In Link */}
        <Pressable onPress={toSignIn} style={styles.signInLink}>
          <Text style={styles.signInLinkText}>Sign In</Text>
        </Pressable>
      </View>
    );
  };
  const CustomForgotPassword = ({ fields, ...props }) => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+1');
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

    const handleSendCode = async () => {
      if (!phoneNumber) {
        RNAlert.alert('Error', 'Please enter your phone number');
        return;
      }

      setIsLoading(true);
      try {
        const fullNumber = `${selectedCode}${phoneNumber.replace(/\D/g, '')}`;
        await Auth.forgotPassword(fullNumber);
        RNAlert.alert(
          'Code Sent',
          'Please check your phone for the verification code.'
        );
      } catch (error: any) {
        console.error('Reset password error:', error);
        RNAlert.alert('Error', error.message || 'Failed to send code');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordTitle}>Reset Password</Text>
        
        <Text style={styles.inputLabel}>Enter your phone number</Text>
        <View style={styles.phoneFieldContainer}>
          <View style={styles.countryCodePicker}>
            <Picker
              selectedValue={selectedCode}
              onValueChange={setSelectedCode}
              style={styles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="+1" value="+1" color="#FFFFFF" />
              <Picker.Item label="+44" value="+44" color="#FFFFFF" />
              <Picker.Item label="+86" value="+86" color="#FFFFFF" />
              <Picker.Item label="+81" value="+81" color="#FFFFFF" />
            </Picker>
          </View>
          <TextInput
            style={styles.phoneInput}
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
            styles.sendCodeButton,
            isLoading && styles.buttonDisabled
          ]}
          onPress={handleSendCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send code</Text>
          )}
        </Pressable>

        <Pressable onPress={toSignIn} style={styles.backToSignIn}>
          <Text style={styles.backToSignInText}>Back to Sign In</Text>
        </Pressable>
      </View>
    );
  };
  // If authenticated, show Home directly
  if (isAuthenticated) {
    return <Home onSignOut={() => setIsAuthenticated(false)} />;
  }

  return (
    <ThemeProvider  
    theme={{
      tokens: {
        colors: {
          background: {
            primary: '#040404',
            secondary: '#040404',
          },
          primary: {
            10: '#FF0000',
            20: '#FF0000',
            40: '#FF0000',
            60: '#FF0000',
            80: '#c70628',//sign in button & forgot password & create account
            90: '#FF0000',
            100: '#FF0000',
          },
          neutral: {
            // 10: '#ff4b4b',
            // 20: '#ff4b4b',  
            // 40: '#ff4b4b',
            60: '#7c7c7c',//email &PW框
            80: '#7c7c7c',//enter your email & enter your password
            90: '#FFFFFF',//email &PW
            100: '#FFFFFF',//sign in
          },
        },
      },
    }}
  >
    <Authenticator.Provider>
    <Authenticator
    Header={components.Header}
        components={{
          SignIn: CustomSignIn,
          SignUp: CustomSignUp,
          ForgotPassword: CustomForgotPassword,
        }}
      >

        <View />
      </Authenticator>
    </Authenticator.Provider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#040404',
  },
  logoImage: {
    width: 200,
    height: 100, // Adjust these dimensions based on your logo's aspect ratio
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  signInContainer: {
    padding: 20,
    backgroundColor: '#040404',
  },
  signInTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    // fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 5,
  },
  phoneFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  countryCodePicker: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
  },
  passwordInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  signInButton: {
    backgroundColor: '#FF0000',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 15,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpContainer: {
    padding: 20,
    backgroundColor: '#040404',
  },
  signUpTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#7c7c7c',
    borderRadius: 4,
    padding: 10,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#c70628',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signInLinkText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordContainer: {
    padding: 20,
    backgroundColor: '#040404',
  },
  forgotPasswordTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sendCodeButton: {
    backgroundColor: '#c70628',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToSignIn: {
    alignItems: 'center',
    marginTop: 20,
  },
  backToSignInText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
