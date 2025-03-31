import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

interface NewsDetailProps {
  post: {
    id: string;
    image: any;
    category: string;
    date: string;
    author: string;
    title: string;
    description: string;
    content: string;
  };
}

const NewsDetail: React.FC<NewsDetailProps> = ({ post }) => {
  return (
    <ScrollView style={styles.container}>
      <Image source={post.image} style={styles.postImage} />
      
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.date}>{post.date}</Text>
          <Text style={styles.author}>By {post.author}</Text>
        </View>
        
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        
        <View style={styles.contentBody}>
          <Text style={styles.contentText}>{post.content}</Text>
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
  postImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  date: {
    color: '#7c7c7c',
    marginRight: 12,
    fontSize: 14,
  },
  author: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 24,
    lineHeight: 24,
  },
  contentBody: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  contentText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});

export default NewsDetail; 