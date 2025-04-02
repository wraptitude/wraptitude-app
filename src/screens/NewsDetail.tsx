import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import RenderHtml, {
  defaultHTMLElementModels,
  HTMLContentModel,
} from 'react-native-render-html';
import VideoComponent from './VideoComponent';
import useEffect from 'react';

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

interface NewsDetailProps {
  post: BlogPost;
}

const customHTMLElementModels = {
  ...defaultHTMLElementModels,
  video: defaultHTMLElementModels.img.extend({
    tagName: 'video',
    contentModel: HTMLContentModel.block,
    isTranslatableTextual: false,
    isVoid: false,
    isOpaque: false,
  })
};
// ✅ Define renderer for video
const customRenderers = {
  video: ({ TDefaultRenderer, ...props }: any) => {
    console.log('Video props:', props);
    // Find source tag in children
    const sourceNode = props.tnode.children?.find(
      (child: any) => child.tagName === 'source'
    );
    if (sourceNode) {
      const uri = sourceNode.attributes?.src;
      console.log('Video URI:', uri);
      return <VideoComponent uri={uri} />;
    }
    return null;
  },
  source: () => null // Prevent source tag from rendering separately
};

const NewsDetail: React.FC<NewsDetailProps> = ({ post }) => {
  const { width } = useWindowDimensions();
  console.log('Content HTML:', post.content);

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={{ color: 'white' }}>{post.content}</Text> */}
      <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <View style={styles.meta}>
          <Text style={styles.category}>{post.category}</Text>
          <Text style={styles.date}>{post.date}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
        <Text style={styles.author}>By {post.author}</Text>

        <RenderHtml
        contentWidth={width - 32}
        source={{ html: post.content }}
        renderers={customRenderers}
        customHTMLElementModels={customHTMLElementModels}
        enableExperimentalMarginCollapsing={true}
          tagsStyles={{
            p: {
              color: '#FFFFFF',
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 16,
              fontFamily: 'System',
            },
            h2: {
              color: '#FFFFFF',
              fontSize: 22,
              lineHeight: 30,
              fontWeight: 'bold',
              marginTop: 24,
              marginBottom: 16,
              fontFamily: 'System',
            },
            strong: {
              fontWeight: 'bold',
            },
            a: {
              color: '#c70628',
              textDecorationLine: 'underline',
            },
            ul: {
              marginLeft: 16,
              marginBottom: 16,
            },
            li: {
              color: '#FFFFFF',
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 8,
            },
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    color: '#c70628',
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#7c7c7c',
    fontSize: 16,
    marginBottom: 16,
  },
  author: {
    color: '#7c7c7c',
    fontSize: 14,
    marginBottom: 24,
  },
});

export default NewsDetail;
