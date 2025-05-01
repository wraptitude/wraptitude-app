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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

interface ServiceStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  images: string;
  videos?: string[];
  weight: number;
  icon: string;
}

const INITIAL_STEPS: ServiceStep[] = [
  {
    id: '1',
    title: 'Vehicle Inspection and Cleaning',
    description: 'Detailed vehicle condition check and deep cleaning',
    status: 'completed',
    images: '',
    weight: 20,
    icon: 'fact-check',
  },
  {
    id: '2',
    title: 'Film Preparation',
    description: 'Prepare film materials, confirm measurements and cutting',
    status: 'completed',
    images: '',
    weight: 20,
    icon: 'content-cut',
  },
  {
    id: '3',
    title: 'Film Installation',
    description: 'Professional film installation process',
    status: 'in_progress',
    images: '',
    weight: 50,
    icon: 'build',
  },
  {
    id: '4',
    title: 'Quality Check',
    description: 'Comprehensive film quality inspection',
    status: 'pending',
    images: '',
    weight: 5,
    icon: 'verified',
  },
  {
    id: '5',
    title: 'Final Presentation',
    description: 'Final result presentation and customer confirmation',
    status: 'pending',
    images: '',
    weight: 5,
    icon: 'emoji-events',
  },
];

const ServiceTracking: React.FC = () => {
  const [steps, setSteps] = useState<ServiceStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState({
    serviceType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
  });
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressTextAnim = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

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

  useFocusEffect(
    React.useCallback(() => {
      setSteps([]);
      setExpandedStep(null);
      setLoading(true);
      progressAnim.setValue(0);
      progressTextAnim.setValue(0);
      progressBarWidth.setValue(0);

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
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
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
            console.log('parsedBody', parsedBody);
            if (!parsedBody.data || parsedBody.data.length === 0) {
              setSteps([]);
              return;
            }

            const data = parsedBody.data[0];
            
            // Set service details
            setServiceDetails({
              serviceType: data.serviceType || '',
              vehicleMake: data.vehicleMake || '',
              vehicleModel: data.vehicleModel || '',
              vehicleYear: data.vehicleYear || '',
            });

            const updatedSteps = [...INITIAL_STEPS];
            
            updatedSteps[0].status = data.step1;
            updatedSteps[0].images = data.step1Img && data.step1Img !== '' ? `${data.step1Img}?${new Date().getTime()}` : '';
            
            updatedSteps[1].status = data.step2;
            updatedSteps[1].images = data.step2Img && data.step2Img !== '' ? `${data.step2Img}?${new Date().getTime()}` : '';
            
            updatedSteps[2].status = data.step3;
            updatedSteps[2].images = data.step3Img && data.step3Img !== '' ? `${data.step3Img}?${new Date().getTime()}` : '';
            
            updatedSteps[3].status = data.step4;
            updatedSteps[3].images = data.step4Img && data.step4Img !== '' ? `${data.step4Img}?${new Date().getTime()}` : '';
            
            updatedSteps[4].status = data.step5;
            updatedSteps[4].images = data.step5Img && data.step5Img !== '' ? `${data.step5Img}?${new Date().getTime()}` : '';

            setSteps(updatedSteps);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setSteps([]);
          Alert.alert(
            'Error',
            'Failed to load service tracking data. Please try again later.'
          );
        } finally {
          setLoading(false);
        }
      };

      getUserData();

      return () => {
        setSteps([]);
        setExpandedStep(null);
        setLoading(true);
      };
    }, [])
  );

  useEffect(() => {
    // Animate progress counter
    const progress = calculateProgress();
    
    Animated.parallel([
      // Animate the progress text number
      Animated.timing(progressTextAnim, {
        toValue: progress,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Animate the progress bar
      Animated.timing(progressBarWidth, {
        toValue: progress,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [steps]);

  const renderImage = (imageUrl: string) => {
    if (!imageUrl) return null;

    return (
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: imageUrl,
            cache: 'reload'
          }}
          style={styles.stepImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  const ProgressBar = () => {
    const currentProgress = calculateProgress();
    

    return (
      <View style={styles.progressSection}>
        {/* <LinearGradient
          colors={['rgba(15, 15, 15, 0.7)', 'rgba(10, 10, 10, 0.85)']}
          style={styles.progressGradient}
        > */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Project Progress</Text>
            <Text style={styles.progressPercentage}>{currentProgress}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: progressBarWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                }
              ]} 
            />
          </View>
          
          <View style={styles.milestoneContainer}>
            {[0, 25, 50, 75, 100].map((milestone) => (
              <View key={milestone} style={styles.milestone}>
                <View 
                  style={[
                    styles.milestoneDot, 
                    currentProgress >= milestone && styles.milestoneActive
                  ]} 
                />
                <Text 
                  style={[
                    styles.milestoneText,
                    currentProgress >= milestone && styles.milestoneTextActive
                  ]}
                >
                  {milestone}%
                </Text>
              </View>
            ))}
          </View>
        {/* </LinearGradient> */}
      </View>
    );
  };

  const getDisplayServiceType = (serviceType: string): string => {
    switch (serviceType) {
      case 'window_tinting':
        return 'Window Tinting';
      case 'vinyl_wrap':
        return 'Vinyl Wrap';
      case 'ceramic_coating':
        return 'Ceramic Coating';
      case 'paint_protection_film':
        return 'Paint Protection Film (PPF)';
      default:
        return serviceType;
    }
  };

  const StepCard = ({ step }: { step: ServiceStep }) => {
    const isExpanded = expandedStep === step.id;
    
    const statusColors = {
      pending: { color: '#7c7c7c', gradient: ['rgba(50, 50, 50, 0.3)', 'rgba(40, 40, 40, 0.5)'] },
      in_progress: { color: '#ffd700', gradient: ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.4)'] },
      completed: { color: '#4CAF50', gradient: ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.4)'] },
    };

    const statusLabels = {
      pending: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    
    const colorSet = statusColors[step.status];
    const statusText = statusLabels[step.status];
    
    const cardHeight = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

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
        Animated.timing(rotateAnim, {
          toValue: isExpanded ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isExpanded]);

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Pressable
        style={({pressed}) => [
          styles.stepCard,
          pressed && styles.stepCardPressed
        ]}
        onPress={() => setExpandedStep(isExpanded ? null : step.id)}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.05)' }}
      >
               
        <View style={styles.stepHeader}>
          <View style={styles.stepHeaderLeft}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={colorSet.gradient}
                style={styles.iconGradient}
              >
                <Icon name={step.icon} size={20} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <View style={styles.titleContainer}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <View style={styles.statusContainer}>
                <View 
                  style={[
                    styles.statusIndicator, 
                    { backgroundColor: colorSet.color }
                  ]} 
                />
                <Text 
                  style={[
                    styles.statusText, 
                    { color: colorSet.color }
                  ]}
                >
                  {statusText}
                </Text>
              </View>
            </View>
          </View>
          
          <Icon 
            name={isExpanded ? "expand-less" : "expand-more"}
            size={24} 
            color="rgba(255, 255, 255, 0.6)" 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.stepDetails}>
            <Text style={styles.stepDescription}>{step.description}</Text>
            {step.images ? (
              renderImage(step.images)
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image-not-supported" size={32} color="rgba(255, 255, 255, 0.1)" />
                <Text style={styles.noImageText}>No images available yet</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const ServiceDetails = () => (
    <View style={styles.serviceDetailsContainer}>
      {/* <LinearGradient
        colors={['rgba(15, 15, 15, 0.7)', 'rgba(10, 10, 10, 0.85)']}
        style={styles.serviceDetailsGradient}
      > */}
        <View style={styles.serviceDetailsRow}>
          <Text style={styles.serviceDetailsLabel}>Service Type:</Text>
          <Text style={styles.serviceDetailsValue}>
            {getDisplayServiceType(serviceDetails.serviceType)}
          </Text>
        </View>
        <View style={styles.serviceDetailsRow}>
          <Text style={styles.serviceDetailsLabel}>Vehicle:</Text>
          <Text style={styles.serviceDetailsValue}>
            {`${serviceDetails.vehicleYear} ${serviceDetails.vehicleMake} ${serviceDetails.vehicleModel}`}
          </Text>
        </View>
      {/* </LinearGradient> */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* <View style={styles.loadingCard}> */}
          {/* <LinearGradient
            colors={['rgba(15, 15, 15, 0.7)', 'rgba(10, 10, 10, 0.85)']}
            style={styles.loadingGradient}
          > */}
            <ActivityIndicator size="large" color="#c70628" />
            <Text style={styles.loadingText}>Loading service details...</Text>
          {/* </LinearGradient> */}
        {/* </View> */}
      </View>
    );
  }

  if (steps.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <View style={styles.noDataCard}>
          {/* <LinearGradient
            colors={['rgba(15, 15, 15, 0.7)', 'rgba(10, 10, 10, 0.85)']}
            style={styles.noDataGradient}
          > */}
            <Icon name="assignment-late" size={64} color="rgba(255, 255, 255, 0.1)" style={{textAlign: 'center'}}/>
            <Text style={styles.noDataTitle}>No Active Services</Text>
            <Text style={styles.noDataText}>
              You currently don't have any active services being tracked.
              Visit our service center or request a quote to get started.
            </Text>
            
            {/* <View style={styles.actionButtonContainer}>
              <Pressable
                style={({pressed}) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed
                ]}
                onPress={() => {}}//Navigation logic here
              >
                <Icon name="calculate" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.actionButtonText}>Get a Quote</Text>
              </Pressable>
            </View> */}
          {/* </LinearGradient> */}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ServiceDetails />
      <ProgressBar />
      
      <View style={styles.stepsContainer}>
        {steps.map(step => (
          <StepCard key={step.id} step={step} />
        ))}
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  progressSection: {
    padding: 16,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    // borderRadius: 16,
    // overflow: 'hidden',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
    // elevation: 5,
  },
  progressGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  progressPercentage: {
    color: '#c70628',
    fontSize: 30,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#c70628',
    borderRadius: 4,
  },
  milestoneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 4,
  },
  milestone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  milestoneActive: {
    backgroundColor: '#c70628',
  },
  milestoneText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: '500',
  },
  milestoneTextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  stepsContainer: {
    padding: 16,
    paddingTop: 40,
  },
  stepCard: {
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  stepCardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
  },
  stepCardPressed: {
    opacity: 0.9,
    transform: [{scale: 0.98}],
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 12,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepDetails: {
    marginTop: 14,
  },
  stepDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginTop: 8,
  },
  stepImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  noImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: 'rgba(10, 10, 10, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },
  noImageText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 13,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingGradient: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 15,
    marginTop: 16,
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataCard: {
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  noDataGradient: {
    // padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  noDataTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButtonContainer: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(199, 6, 40, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(180, 6, 40, 0.9)',
    transform: [{scale: 0.98}],
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonIcon: {
    marginRight: 8,
  },
  serviceDetailsContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceDetailsGradient: {
    padding: 16,
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceDetailsLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  serviceDetailsValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ServiceTracking; 