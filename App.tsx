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
import { Amplify } from 'aws-amplify';
import { Authenticator, AuthenticatorProps, ThemeProvider, useAuthenticator, useTheme } from '@aws-amplify/ui-react-native';
import awsConfig from './src/aws-config';
import { SignIn } from '@aws-amplify/ui-react-native/dist/Authenticator/Defaults/SignIn';
import { Picker } from '@react-native-picker/picker';
import { signIn, getCurrentUser, signUp, signOut } from 'aws-amplify/auth';
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
Amplify.configure(awsConfig);

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
            source={require('./src/assets/images/HKTC_LOGO_NEW.png')}
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
    const [selectedCode, setSelectedCode] = React.useState('+852');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Get navigation methods from useAuthenticator
    const { toSignUp } = useAuthenticator();

    const formatPhoneNumber = (text: string) => {
      const cleaned = text.replace(/\D/g, '');
      
      switch (cleaned.length) {
        case 0:
          return '';
        case 1:
        case 2:
        case 3:
        case 4:
          return cleaned;
        case 5:
        case 6:
        case 7:
        case 8:
          return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        default:
          return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
      }
    };

    const handleSubmit = async () => {
      if (!phoneNumber || !password) {
        RNAlert.alert('錯誤', '請輸入電話號碼和密碼');
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
          console.log('登入成功');
          setIsAuthenticated(true); // Update auth state
        } else if (nextStep) {
          switch (nextStep.signInStep) {
            case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
              RNAlert.alert('需要驗證', '請檢查您的手機以獲取驗證碼。');
              break;
            case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
              RNAlert.alert('需要操作', '請更新您的密碼。');
              break;
            default:
              console.log('Additional step required:', nextStep.signInStep);
              setIsAuthenticated(true); // Update auth state
          }
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        RNAlert.alert(
          '錯誤',
          '電話號碼或密碼不正確' || '登入失敗。請檢查您的憑證。'
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
          <Text style={appStyles.signUpTitle}>登入</Text>

          <View style={appStyles.phoneFieldContainer}>
            <View style={appStyles.countryCodePicker}>

              <Picker
                selectedValue={selectedCode}
                onValueChange={setSelectedCode}
                style={appStyles.picker}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="+852" value="+852" color="#FFFFFF" />
              </Picker>
            </View>
            <TextInput
              style={appStyles.phoneInput}
              placeholder="XXXX-XXXX"
              placeholderTextColor="#7c7c7c"
              keyboardType="phone-pad"
              maxLength={9}
              value={phoneNumber}
              onChangeText={(text) => {
                const formatted = formatPhoneNumber(text);
                setPhoneNumber(formatted);
              }}
            />
          </View>

          <TextInput
            style={appStyles.passwordInput}
            placeholder="密碼"
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
              <Text style={appStyles.signUpButtonText}>登入</Text>
            )}
          </Pressable>
          {/* Sign In Link */}
          <Pressable onPress={toSignUp} style={appStyles.signInLink}>
            <Text style={appStyles.signInLinkText}>建立帳戶</Text>
          </Pressable>

          <Pressable onPress={() => setIsGuestMode(true)} style={appStyles.signInLink}>
            <Text style={appStyles.guestModeText}>以訪客身份繼續</Text>
          </Pressable>
        </View>
      </View>

    );
  };

  const CustomSignUp = (props: AuthenticatorProps) => {
    const [phoneNumber, setPhoneNumber] = React.useState('');
    const [selectedCode, setSelectedCode] = React.useState('+852');
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
        case 4:
          return cleaned;
        case 5:
        case 6:
        case 7:
        case 8:
          return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
        default:
          return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
      }
    };

    const handleSignUp = async () => {
      if (!phoneNumber || !password || !confirmPassword || !email || !name) {
        RNAlert.alert('錯誤', '請填寫所有欄位');
        return;
      }

      if (password !== confirmPassword) {
        RNAlert.alert('錯誤', '密碼不匹配');
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
            '成功',
            '帳戶建立成功！請登入。',
            [{ text: '確定', onPress: () => toSignIn() }]
          );
        } else if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
          RNAlert.alert(
            '需要驗證',
            '請檢查您的手機以獲取驗證碼。'
          );
        }
      } catch (error: any) {
        console.error('Sign up error:', error);
        RNAlert.alert('錯誤', error.message || '建立帳戶失敗');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <View style={appStyles.signUpContainer}>
        <View style={appStyles.overlay} />
        <Text style={appStyles.signUpTitle}>建立帳戶</Text>

        {/* Phone Number Input */}
        <Text style={appStyles.inputLabel}>電話號碼</Text>
        <View style={appStyles.phoneFieldContainer}>
          <View style={appStyles.countryCodePicker}>
            <Picker
              selectedValue={selectedCode}
              onValueChange={setSelectedCode}
              style={appStyles.picker}
              dropdownIconColor="#FFFFFF"
            >
              <Picker.Item label="+852" value="+852" color="#FFFFFF" />
              <Picker.Item label="+44" value="+44" color="#FFFFFF" />
              <Picker.Item label="+86" value="+86" color="#FFFFFF" />
              <Picker.Item label="+81" value="+81" color="#FFFFFF" />
            </Picker>
          </View>
          <TextInput
            style={appStyles.phoneInput}
            placeholder="XXXX-XXXX"
            placeholderTextColor="#7c7c7c"
            keyboardType="phone-pad"
            maxLength={9}
            value={phoneNumber}
            onChangeText={(text) => {
              const formatted = formatPhoneNumber(text);
              setPhoneNumber(formatted);
            }}
          />
        </View>

        {/* Password Input */}
        <Text style={appStyles.inputLabel}>密碼</Text>
        <TextInput
          style={appStyles.input}
          placeholder="請輸入您的密碼"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Confirm Password Input */}
        <Text style={appStyles.inputLabel}>確認密碼</Text>
        <TextInput
          style={appStyles.input}
          placeholder="請確認您的密碼"
          placeholderTextColor="#7c7c7c"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Email Input */}
        <Text style={appStyles.inputLabel}>電子郵件</Text>
        <TextInput
          style={appStyles.input}
          placeholder="請輸入您的電子郵件"
          placeholderTextColor="#7c7c7c"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Name Input */}
        <Text style={appStyles.inputLabel}>姓名</Text>
        <TextInput
          style={appStyles.input}
          placeholder="請輸入您的姓名"
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
            <Text style={appStyles.signUpButtonText}>建立帳戶</Text>
          )}
        </Pressable>

        {/* Sign In Link */}
        <Pressable onPress={toSignIn} style={appStyles.signInLink}>
          <Text style={appStyles.signInLinkText}>登入</Text>
        </Pressable>
      </View>
    );
  };
  // If authenticated, show Home directly
  if (isAuthenticated || isGuestMode) {
    return (
      <ImageBackground
        source={require('./src/assets/images/4.jpeg')} // Your background image
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
                      headerTitle: "免費報價",
                      headerBackTitle: "返回",
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
                      headerTitle: "緊急服務",
                      headerBackTitle: "返回",
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
                      headerTitle: "緊急服務",
                      headerBackTitle: "返回",
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
                      headerTitle: "非緊急表格",
                      headerBackTitle: "返回",
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
      source={require('./src/assets/images/4.jpeg')} // Your background image
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
