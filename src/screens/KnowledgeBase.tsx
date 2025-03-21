import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'What are the benefits of car film?',
    answer: 'Car film provides multiple benefits: UV protection, enhanced glass safety, increased privacy, reduced glare, lower interior temperature, and improved vehicle appearance.',
  },
  {
    question: 'How to maintain car film?',
    answer: '1. Avoid opening windows for 48 hours after installation\n2. Clean with soft cloth and neutral detergent\n3. Avoid ammonia-based or abrasive cleaning products\n4. Schedule regular professional cleaning and inspection',
  },
  {
    question: 'How long does car film last?',
    answer: 'Quality car film can last 5-10 years with proper maintenance. However, actual lifespan depends on environmental conditions, maintenance, and film quality.',
  },
];

const KnowledgeBase: React.FC = () => {
  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Knowledge Base</Text>
      </View>
      <ScrollView style={styles.content}>
        {FAQS.map((faq, index) => (
          <Pressable
            key={index}
            style={styles.faqCard}
            onPress={() => setExpandedQuestion(
              expandedQuestion === faq.question ? null : faq.question
            )}
          >
            <Text style={styles.question}>{faq.question}</Text>
            {expandedQuestion === faq.question && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  faqCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  question: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    color: '#7c7c7c',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});

export default KnowledgeBase; 