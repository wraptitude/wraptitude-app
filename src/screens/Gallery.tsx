import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import WebView from 'react-native-webview';

// Hardcoded post IDs from wraptitude.ca Instagram
const INSTAGRAM_POSTS = [
  'DHKgKObOVbz', // Replace with actual post IDs from wraptitude.ca
  'DHRq8E9Ot94',
];

const Gallery: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Simplified HTML template
  const generateEmbedHtml = (postIds: string[]) => {
    const embedsHtml = postIds.map(id => `
      <iframe 
        src="https://www.instagram.com/p/${id}/embed" 
        width="100%" 
        height="400" 
        frameborder="0" 
        scrolling="no" 
        allowtransparency="true"
      ></iframe>
    `).join('<div style="margin: 16px 0;"></div>');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <style>
            body { 
              margin: 0; 
              padding: 16px;
              background-color: #040404;
              font-family: -apple-system, system-ui, BlinkMacSystemFont;
            }
            iframe {
              border-radius: 8px;
              background: white;
            }
          </style>
        </head>
        <body>
          ${embedsHtml}
        </body>
      </html>
    `;
  };

//   const injectedJavaScript = `
//     window.addEventListener('message', function(event) {
//       window.ReactNativeWebView.postMessage(event.data);
//     });
//   `;
const injectedJavaScript = `
    (function() {
      const img = document.querySelector('img');
      if (img) {
        window.ReactNativeWebView.postMessage(img.src);
      } else {
        window.ReactNativeWebView.postMessage('No image found');
      }
    })();
  `;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>@wraptitude.ca Gallery</Text>
        <Pressable 
          style={styles.followButton}
          onPress={() => Linking.openURL('https://www.instagram.com/wraptitude.ca/')}
        >
          <Text style={styles.followButtonText}>Follow Us</Text>
        </Pressable>
      </View>

      {/* <WebView
    source={{ html: '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DHRsB2UulS3/"></blockquote><script async src="//www.instagram.com/embed.js"></script>' }}
    style={{ height: 500,width: '100%',flex: 1 }}
  /> */}

      {/* <View style={styles.container}>
      <WebView
        source={{ uri: 'https://www.instagram.com/p/DHRsB2UulS3/embed' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onLoadEnd={() => console.log('WebView finished loading')}
      />
    </View> */}
    {/* </View> */}
      <WebView
        source={{ html: generateEmbedHtml(INSTAGRAM_POSTS) }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
        scalesPageToFit={true}
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => {
          console.log('Message from WebView:', event.nativeEvent.data);
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c70628" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#040404',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  followButton: {
    backgroundColor: '#c70628',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    width: '100%', // 明確設置寬度
    height: 500,
    backgroundColor: '#040404',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
});

export default Gallery; 