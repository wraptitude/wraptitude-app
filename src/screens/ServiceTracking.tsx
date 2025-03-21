import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { post } from 'aws-amplify/api';

interface ServiceStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: number; // in minutes
  actualTime?: number;
  images: string[];
  videos?: string[];
}

const INITIAL_STEPS: ServiceStep[] = [
  {
    id: '1',
    title: '車輛檢查和清潔',
    description: '詳細檢查車輛狀況，進行深層清潔',
    status: 'completed',
    estimatedTime: 60,
    actualTime: 55,
    images: ['inspection1.jpg', 'cleaning1.jpg'],
  },
  {
    id: '2',
    title: '貼膜準備',
    description: '準備貼膜材料，確認尺寸和裁切',
    status: 'in_progress',
    estimatedTime: 45,
    images: ['preparation1.jpg'],
  },
  {
    id: '3',
    title: '貼膜施工',
    description: '專業施工貼膜過程',
    status: 'pending',
    estimatedTime: 180,
    images: [],
  },
  {
    id: '4',
    title: '品質檢查',
    description: '全面檢查貼膜品質',
    status: 'pending',
    estimatedTime: 30,
    images: [],
  },
  {
    id: '5',
    title: '完工展示',
    description: '最終成果展示和客戶確認',
    status: 'pending',
    estimatedTime: 20,
    images: [],
  },
];

const ServiceTracking: React.FC = () => {
  const [steps, setSteps] = useState<ServiceStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Calculate overall progress
  const calculateProgress = () => {
    const completed = steps.filter(step => step.status === 'completed').length;
    const inProgress = steps.filter(step => step.status === 'in_progress').length;
    return ((completed + inProgress * 0.5) / steps.length) * 100;
  };

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  const StepCard = ({ step }: { step: ServiceStep }) => {
    const isExpanded = expandedStep === step.id;
    const statusColor = {
      pending: '#7c7c7c',
      in_progress: '#ffd700',
      completed: '#4CAF50',
    }[step.status];

    return (
      <Pressable
        style={[styles.stepCard, isExpanded && styles.stepCardExpanded]}
        onPress={() => setExpandedStep(isExpanded ? null : step.id)}
      >
        <View style={styles.stepHeader}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepTime}>
            {step.actualTime || step.estimatedTime}分鐘
          </Text>
        </View>
        
        {isExpanded && (
          <View style={styles.stepDetails}>
            <Text style={styles.stepDescription}>{step.description}</Text>
            {step.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {step.images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Text style={styles.imageText}>圖片 {index + 1}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>服務進度追蹤</Text>
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          總進度: {Math.round(calculateProgress())}%
        </Text>
        <ProgressBar progress={calculateProgress()} />
      </View>

      <ScrollView style={styles.stepsContainer}>
        {steps.map(step => (
          <StepCard key={step.id} step={step} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#c70628',
    borderRadius: 4,
  },
  stepsContainer: {
    flex: 1,
  },
  stepCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  stepCardExpanded: {
    minHeight: 200,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  stepTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepTime: {
    color: '#7c7c7c',
    fontSize: 14,
  },
  stepDetails: {
    marginTop: 12,
  },
  stepDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  imageContainer: {
    width: 120,
    height: 80,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default ServiceTracking; 