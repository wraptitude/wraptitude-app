import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Easing,
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
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Calculate overall progress
  const calculateProgress = () => {
    const completed = steps.filter(step => step.status === 'completed').length;
    const inProgress = steps.filter(step => step.status === 'in_progress').length;
    return ((completed + inProgress * 0.5) / steps.length) * 100;
  };

  useEffect(() => {
    // Animate progress bar when progress changes
    Animated.timing(progressAnim, {
      toValue: calculateProgress(),
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [steps]);

  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={styles.progressBarContainer}>
      <Animated.View 
        style={[
          styles.progressBar, 
          { 
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            })
          }
        ]} 
      />
    </View>
  );

  const StepCard = ({ step }: { step: ServiceStep }) => {
    const isExpanded = expandedStep === step.id;
    const statusColor = {
      pending: '#7c7c7c',
      in_progress: '#ffd700',
      completed: '#4CAF50',
    }[step.status];

    const cardHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardHeight, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [isExpanded]);

    return (
      <Pressable
        style={[styles.stepCard]}
        onPress={() => setExpandedStep(isExpanded ? null : step.id)}
      >
        <View style={styles.stepHeader}>
          <Animated.View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: statusColor,
                transform: [{
                  scale: cardHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  })
                }]
              }
            ]} 
          />
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepTime}>
            {step.actualTime || step.estimatedTime}分鐘
          </Text>
        </View>
        
        <Animated.View 
          style={[
            styles.stepDetails,
            {
              maxHeight: cardHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: cardHeight,
              overflow: 'hidden',
            }
          ]}
        >
          <Text style={styles.stepDescription}>{step.description}</Text>
          {step.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {step.images.map((image, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.imageContainer,
                    {
                      transform: [{
                        scale: cardHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.imageText}>圖片 {index + 1}</Text>
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[
          styles.title,
          {
            opacity: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [0.8, 1],
            })
          }
        ]}
      >
        服務進度追蹤
      </Animated.Text>
      <View style={styles.progressSection}>
        <Animated.Text 
          style={[
            styles.progressText,
            {
              transform: [{
                scale: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [1, 1.1],
                })
              }]
            }
          ]}
        >
          總進度: {Math.round(calculateProgress())}%
        </Animated.Text>
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