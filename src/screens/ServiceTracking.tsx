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
  images: string[];
  videos?: string[];
  weight: number;
}

const INITIAL_STEPS: ServiceStep[] = [
  {
    id: '1',
    title: 'Vehicle Inspection and Cleaning',
    description: 'Detailed vehicle condition check and deep cleaning',
    status: 'completed',
    images: ['inspection1.jpg', 'cleaning1.jpg'],
    weight: 20,
  },
  {
    id: '2',
    title: 'Film Preparation',
    description: 'Prepare film materials, confirm measurements and cutting',
    status: 'completed',
    images: ['preparation1.jpg'],
    weight: 20,
  },
  {
    id: '3',
    title: 'Film Installation',
    description: 'Professional film installation process',
    status: 'in_progress',
    images: ['preparation1.jpg'],
    weight: 50,
  },
  {
    id: '4',
    title: 'Quality Check',
    description: 'Comprehensive film quality inspection',
    status: 'pending',
    images: [],
    weight: 5,
  },
  {
    id: '5',
    title: 'Final Presentation',
    description: 'Final result presentation and customer confirmation',
    status: 'pending',
    images: [],
    weight: 5,
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
    return steps.reduce((total, step) => {
      if (step.status === 'completed') {
        return total + step.weight;
      } else if (step.status === 'in_progress') {
        return total + (step.weight * 0.5);
      }
      return total;
    }, 0);
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

    const statusText = {
      pending: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
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
        style={[styles.stepCard, isExpanded && styles.stepCardExpanded]}
        onPress={() => setExpandedStep(isExpanded ? null : step.id)}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepHeaderLeft}>
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
            <View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
            >
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
                  <Text style={styles.imageText}>Image {index + 1}</Text>
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
          Project Progress
        </Animated.Text>
        <Text style={styles.progressPercentage}>{Math.round(calculateProgress())}%</Text>
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
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressPercentage: {
    color: '#c70628',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
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
    padding: 20,
  },
  stepCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stepCardExpanded: {
    borderColor: '#c70628',
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepTime: {
    color: '#7c7c7c',
    fontSize: 14,
    fontWeight: '500',
  },
  stepDetails: {
    marginTop: 16,
  },
  stepDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  imagesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: 160,
    height: 100,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444444',
  },
  imageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ServiceTracking; 