import React, { useEffect } from 'react';
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
import { Authenticator, ThemeProvider, useAuthenticator, useTheme } from '@aws-amplify/ui-react-native';
import awsconfig from './src/aws-exports';

// Configure Amplify at the top
// Amplify.configure(awsconfig);
console.log('Loaded AWS Config:', awsconfig);
try {
  Amplify.configure(awsconfig);

  // console.log('Auth Configured:', Auth);
} catch (error) {
  console.error('Amplify Configuration Error:', error);
}
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
    >
        <View style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <ScrollView style={backgroundStyle}>
            <View style={{ paddingRight: safePadding }}>
              <Header />
            </View>
            <View
              style={{
                backgroundColor: isDarkMode ? Colors.black : Colors.white,
                paddingHorizontal: safePadding,
                paddingBottom: safePadding,
              }}>
              <Section title="Step One">
                Edit <Text style={styles.highlight}>App.tsx</Text> to change this
                screen and then come back to see your edits.
              </Section>
              <Section title="See Your Changes">
                <ReloadInstructions />
              </Section>
              <Section title="Debug">
                <DebugInstructions />
              </Section>
              <Section title="Learn More">
                Read the docs to discover what to do next:
              </Section>
              <LearnMoreLinks />
            </View>
            <SignOutButton />
          </ScrollView>
        </View>
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
  
});

export default App;
