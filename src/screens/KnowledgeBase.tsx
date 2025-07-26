import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';

interface FAQ {
  question: string;
  answer: string;
}

const KnowledgeBase: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('https://j662vojljl.execute-api.us-east-2.amazonaws.com/PROD');
      const data = await response.json();
      setFaqs(JSON.parse(data.body));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>常見問題</Text>
          <Text style={styles.subtitle}>
            關於汽車貼膜和我們服務的一切資訊
          </Text>
        </View>
        
        <View style={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.faqItem,
                expandedIndex === index && styles.faqItemExpanded,
                pressed && styles.faqItemPressed
              ]}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <View style={styles.questionContainer}>
                <Text style={styles.question}>{faq.question}</Text>
                <Text style={[
                  styles.expandIcon,
                  expandedIndex === index && styles.expandIconActive
                ]}>
                  {expandedIndex === index ? '−' : '+'}
                </Text>
              </View>
              
              {expandedIndex === index && (
                <Text style={styles.answer}>
                  {faq.answer}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
    marginBottom: 24,
  },
  faqContainer: {
    paddingHorizontal: 20,
  },
  faqItem: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  faqItemExpanded: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  faqItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  expandIcon: {
    fontSize: 24,
    color: '#c70628',
    marginLeft: 16,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  expandIconActive: {
    color: '#FFFFFF',
  },
  answer: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#A0A0A0',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default KnowledgeBase; 