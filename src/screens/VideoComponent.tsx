import React from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const VideoComponent = ({ uri }: { uri: string }) => {
  if (!uri) return null;

  return (
    <View style={styles.container}>
      <Video
        source={{ uri }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 215,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoComponent;
