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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Latest Blog Posts</Text>
      </View>

      <View style={styles.postsContainer}>
        {posts.map((post) => (
          <Pressable
            key={post.id}
            style={styles.postCard}
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
  },
  postContent: {
    padding: 16,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postCategory: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
  },
  postDate: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postDescription: {
    color: '#7c7c7c',
    fontSize: 14,
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postAuthor: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  readMore: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#040404',
  },
});

export default News; 