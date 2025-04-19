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
  Alert,
} from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { post } from 'aws-amplify/api';
import { fetchUserAttributes } from 'aws-amplify/auth';

interface ServiceStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  images: string;
  videos?: string[];
  weight: number;
}

const INITIAL_STEPS: ServiceStep[] = [
  {
    id: '1',
    title: 'Vehicle Inspection and Cleaning',
    description: 'Detailed vehicle condition check and deep cleaning',
    status: 'completed',
    images: '',
    weight: 20,
  },
  {
    id: '2',
    title: 'Film Preparation',
    description: 'Prepare film materials, confirm measurements and cutting',
    status: 'completed',
    images: '',
    weight: 20,
  },
  {
    id: '3',
    title: 'Film Installation',
    description: 'Professional film installation process',
    status: 'in_progress',
    images: '',
    weight: 50,
  },
  {
    id: '4',
    title: 'Quality Check',
    description: 'Comprehensive film quality inspection',
    status: 'pending',
    images: '',
    weight: 5,
  },
  {
    id: '5',
    title: 'Final Presentation',
    description: 'Final result presentation and customer confirmation',
    status: 'pending',
    images: '',
    weight: 5,
  },
];

const ServiceTracking: React.FC = () => {
  const [steps, setSteps] = useState<ServiceStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
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
    const getUserData = async () => {
      try {
        const userAttributes = await fetchUserAttributes();
        const userId = userAttributes.sub;
        setUserId(userId);
        
        if (userId) {
          const response = await fetch('https://nfn5asoyp7.execute-api.us-east-2.amazonaws.com/PROD', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userID: userId
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch service data');
          }

          const responseData = await response.json();
          const parsedBody = JSON.parse(responseData.body);
          
          if (!parsedBody.data || parsedBody.data.length === 0) {
            setLoading(false);
            setSteps([]); // Clear steps if no data
            return; // Exit early
          }

          const data = parsedBody.data[0];
          INITIAL_STEPS[0].status = data.step1;
          if (data.step1Img && data.step1Img!='') {
            INITIAL_STEPS[0].images = data.step1Img;
          }
          INITIAL_STEPS[1].status = data.step2;
          if (data.step2Img && data.step2Img!='') {
            INITIAL_STEPS[1].images = data.step2Img;
          }
          INITIAL_STEPS[2].status = data.step3;
          if (data.step3Img && data.step3Img!='') {
            INITIAL_STEPS[2].images = data.step3Img;
          }
          INITIAL_STEPS[3].status = data.step4;
          if (data.step4Img && data.step4Img!='') {
            INITIAL_STEPS[3].images = data.step4Img;
          }
          INITIAL_STEPS[4].status = data.step5;
          if (data.step5Img && data.step5Img!='') {
            INITIAL_STEPS[4].images = data.step5Img;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSteps([]); // Clear steps on error
        Alert.alert(
          'Error',
          'Failed to load service tracking data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

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
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(cardHeight, {
          toValue: isExpanded ? 1 : 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [isExpanded]);

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
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
              {step.images && step.images!='' && (
                <Image 
                  source={{ uri: step.images }}
                  style={styles.stepImage}
                  resizeMode="cover"
                />
              )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#c70628" />
        <Text style={styles.loadingText}>Loading service details...</Text>
      </View>
    );
  }

  if (steps.length === 0) {
    return (
      <View style={[styles.container, styles.noDataContainer]}>
        <Text style={styles.noDataTitle}>No Active Services</Text>
        <Text style={styles.noDataText}>
          You currently don't have any active services being tracked.
          Visit our service center or request a quote to get started.
        </Text>
      </View>
    );
  }

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
    backgroundColor: 'transparent',
  },
  progressSection: {
    padding: 20,
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercentage: {
    color: '#c70628',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  stepCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepCardExpanded: {
    borderColor: '#c70628',
    backgroundColor: 'rgba(40, 40, 40, 0.95)',
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepDetails: {
    marginTop: 16,
  },
  stepDescription: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  noDataTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noDataText: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default ServiceTracking; 