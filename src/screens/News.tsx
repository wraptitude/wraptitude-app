import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import NewsDetail from './NewsDetail';

interface BlogPost {
  id: string;
  image: string;
  category: string;
  date: string;
  author: string;
  title: string;
  description: string;
  content: string;
}

interface NewsProps {
  onPostPress: (post: BlogPost) => void;
}

const News: React.FC<NewsProps> = ({ onPostPress }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('https://zbs76wyzdk.execute-api.us-east-2.amazonaws.com/PROD');
      const data = await response.json();
      setPosts(JSON.parse(data.body));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c70628" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Our Latest Blog Posts</Text>
          <Text style={styles.headerSubtitle}>Stay updated with our latest news and insights</Text>
        </View>

        <View style={styles.postsContainer}>
          {posts.map((post) => (
            <Pressable
              key={post.id}
              style={({ pressed }) => [
                styles.postCard,
                pressed && styles.cardPressed
              ]}
              onPress={() => onPostPress(post)}
            >
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
              <View style={styles.postContent}>
                <View style={styles.postMeta}>
                  <Text style={styles.postCategory}>{post.category}</Text>
                  <Text style={styles.postDate}>{post.date}</Text>
                </View>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postDescription}>{post.description}</Text>
                <View style={styles.authorContainer}>
                  <Text style={styles.postAuthor}>By {post.author}</Text>
                  <Text style={styles.readMore}>Read More →</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* <View style={styles.socialSection}>
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
        </View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingBottom: 100, // Space for footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  postsContainer: {
    padding: 20,
  },
  postCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 20,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postCategory: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  postDate: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '500',
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  postDescription: {
    color: '#A0A0A0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  postAuthor: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '500',
  },
  readMore: {
    color: '#c70628',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialSection: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
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
    fontWeight: '700',
    color: '#c70628',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default News; 