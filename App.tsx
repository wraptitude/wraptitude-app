// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React, { useEffect } from 'react';
// import type {PropsWithChildren} from 'react';
// import {
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
//   Platform,
// } from 'react-native';
// import SplashScreen from 'react-native-splash-screen';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';
// import { Button } from 'react-native';
// import { Amplify } from 'aws-amplify';
// // import {
// //   useAuthenticator,
// //   withAuthenticator,
// // } from '@aws-amplify/ui-react-native';
// import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
// import awsconfig from './src/aws-exports';

// Amplify.configure(awsconfig);

// function SignOutButton() {
//   const { signOut } = useAuthenticator();
//   return <Button title="Sign Out" onPress={signOut} />;
// }


// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

// function Section({children, title}: SectionProps): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

// function App(): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   /*
//    * To keep the template simple and small we're adding padding to prevent view
//    * from rendering under the System UI.
//    * For bigger apps the reccomendation is to use `react-native-safe-area-context`:
//    * https://github.com/AppAndFlow/react-native-safe-area-context
//    *
//    * You can read more about it here:
//    * https://github.com/react-native-community/discussions-and-proposals/discussions/827
//    */
//   const safePadding = '5%';

//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       SplashScreen.hide();
//     }
//   }, []);

//   return (
//     // <Authenticator.Provider>
//     //   <Authenticator>
//     //     <View style={backgroundStyle}>
//     //       <StatusBar
//     //         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//     //         backgroundColor={backgroundStyle.backgroundColor}
//     //       />
//     //       <ScrollView
//     //         style={backgroundStyle}>
//     //         <View style={{paddingRight: safePadding}}>
//     //           <Header/>
//     //         </View>
//     //         <View
//     //           style={{
//     //             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//     //             paddingHorizontal: safePadding,
//     //             paddingBottom: safePadding,
//     //           }}>
//     //           <Section title="Step One">
//     //             Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//     //             screen and then come back to see your edits.
//     //           </Section>
//     //           <Section title="See Your Changes">
//     //             <ReloadInstructions />
//     //           </Section>
//     //           <Section title="Debug">
//     //             <DebugInstructions />
//     //           </Section>
//     //           <Section title="Learn More">
//     //             Read the docs to discover what to do next:
//     //           </Section>
//     //           <LearnMoreLinks />
//     //         </View>
//     //       </ScrollView>
//     //     </View>
//     //     <SignOutButton />
//     //   </Authenticator>
//     // </Authenticator.Provider>
//     <Authenticator.Provider>
//       <Authenticator>
//         <View style={backgroundStyle}>
//           <StatusBar
//             barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//             backgroundColor={backgroundStyle.backgroundColor}
//           />
//           <ScrollView style={backgroundStyle}>
//             <View style={{ paddingRight: safePadding }}>
//               <Header />
//             </View>
//             <View
//               style={{
//                 backgroundColor: isDarkMode ? Colors.black : Colors.white,
//                 paddingHorizontal: safePadding,
//                 paddingBottom: safePadding,
//               }}>
//               <Section title="Step One">
//                 Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//                 screen and then come back to see your edits.
//               </Section>
//               <Section title="See Your Changes">
//                 <ReloadInstructions />
//               </Section>
//               <Section title="Debug">
//                 <DebugInstructions />
//               </Section>
//               <Section title="Learn More">
//                 Read the docs to discover what to do next:
//               </Section>
//               <LearnMoreLinks />
//             </View>
//           </ScrollView>
//           <SignOutButton />
//         </View>
//       </Authenticator>
//     </Authenticator.Provider>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;
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
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
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

  return (
    <Authenticator.Provider>
      <Authenticator>
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
          </ScrollView>
          <SignOutButton />
        </View>
      </Authenticator>
    </Authenticator.Provider>
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
});

export default App;