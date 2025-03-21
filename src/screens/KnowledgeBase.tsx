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
    question: '車膜有什麼好處？',
    answer: '車膜可以提供多重保護：阻隔紫外線、增強玻璃安全性、提升隱私度、減少眩光、降低車內溫度，同時還能提升車輛外觀。',
  },
  {
    question: '如何保養車膜？',
    answer: '1. 安裝後48小時內避免開窗\n2. 使用柔軟的毛巾和中性清潔劑清洗\n3. 避免使用含氨或磨砂的清潔產品\n4. 定期進行專業清潔和檢查',
  },
  {
    question: '車膜的使用壽命是多久？',
    answer: '優質車膜在正常使用和保養下可持續5-10年。但具體壽命取決於使用環境、保養方式和車膜品質。',
  },
];

const KnowledgeBase: React.FC = () => {
  const [expandedQuestion, setExpandedQuestion] = React.useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>車膜知識庫</Text>
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