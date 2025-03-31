import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import NewsDetail from './NewsDetail';

interface BlogPost {
  id: string;
  image: any;
  category: string;
  date: string;
  author: string;
  title: string;
  description: string;
  content: string;
}

const NEWS_POSTS: BlogPost[] = [
  {
    id: '1',
    image: require('../assets/images/markham-tesla-demo-drive-1.webp'),
    category: 'News',
    date: 'February 25, 2025',
    author: 'Rex Ngan',
    title: 'Experience the Future of Demo Drives with Tesla — Now Available at Wraptitude!',
    description: "Toronto's First Wrap Shop to Offer Tesla Self-Serve Test Drives",
    content: `– Easily Book Online
– Unlock with Your Phone
– Drive at Your Own Pace
– Easy Drop-Off

Experience the future of car test drives with our innovative Tesla self-serve program. 
We're proud to be Toronto's first wrap shop offering this unique service.`,
  },
  {
    id: '2',
    image: require('../assets/images/wrapped-cars-in-snow-1.webp'), // You'll need to add this image
    category: 'News',
    date: 'February 7, 2025',
    author: 'Rex Ngan',
    title: 'Exciting News: Our Wrap Shop is Expanding in 2025!',
    description: 'Learn about our expansion plans and new services',
    content: '',
  },
  {
    id: '3',
    image: require('../assets/images/2025-blog-cover.webp'), // You'll need to add this image
    category: 'News',
    date: 'January 6, 2025',
    author: 'Rex Ngan',
    title: "Wraptitude's Remarkable Growth in 2024 – Looking Forward To 2025!",
    description: 'A year in review and future plans',
    content: '',
  },
];

interface NewsProps {
  onPostPress: (post: BlogPost) => void;
}

const News: React.FC<NewsProps> = ({ onPostPress }) => {
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);

  const handlePostPress = (post: BlogPost) => {
    setSelectedPost(post);
  };

  if (selectedPost) {
    return (
      <NewsDetail 
        post={selectedPost} 
        onBack={() => setSelectedPost(null)} 
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Latest Blog Posts</Text>
      </View>

      <View style={styles.postsContainer}>
        {NEWS_POSTS.map((post) => (
          <Pressable
            key={post.id}
            style={styles.postCard}
            onPress={() => onPostPress(post)}
          >
            <Image source={post.image} style={styles.postImage} />
            <View style={styles.postContent}>
              <View style={styles.postMeta}>
                <Text style={styles.postCategory}>{post.category}</Text>
                <Text style={styles.postDate}>{post.date}</Text>
                <Text style={styles.postAuthor}>By {post.author}</Text>
              </View>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDescription}>{post.description}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Follow our Social Media</Text>
        <View style={styles.socialStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.5k</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2.3k</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postsContainer: {
    padding: 20,
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  postContent: {
    padding: 16,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  postCategory: {
    color: '#c70628',
    fontSize: 14,
    marginRight: 8,
  },
  postDate: {
    color: '#7c7c7c',
    fontSize: 14,
    marginRight: 8,
  },
  postAuthor: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  postDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  socialSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    marginTop: 20,
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  socialStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c70628',
    marginBottom: 4,
  },
  statLabel: {
    color: '#7c7c7c',
    fontSize: 14,
  },
});

export default News; 