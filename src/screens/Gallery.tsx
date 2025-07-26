import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';

// Define the type for our gallery item
interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

const Gallery: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderGalleryItem = ({ item }: { item: GalleryItem }) => (
    <TouchableOpacity 
      style={styles.photoContainer}
      onPress={() => setSelectedPhoto(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.photo}
        resizeMode="cover"
      />
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const PhotoModal = () => (
    <Modal
      visible={selectedPhoto !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSelectedPhoto(null)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedPhoto.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
            <View style={styles.modalInfo}>
              <Text style={styles.modalTitle}>{selectedPhoto.title}</Text>
              <Text style={styles.modalDescription}>{selectedPhoto.description}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我們的相簿</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c70628" />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.galleryGrid}
          showsVerticalScrollIndicator={false}
        />
      )}

      <PhotoModal />
    </View>
  );
};

const windowWidth = Dimensions.get('window').width;
const photoSize = (windowWidth - 48) / 2; // 2 columns with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  header: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  galleryGrid: {
    padding: 8,
  },
  photoContainer: {
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  photo: {
    width: photoSize,
    height: photoSize,
  },
  photoInfo: {
    padding: 8,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalInfo: {
    padding: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Gallery; 