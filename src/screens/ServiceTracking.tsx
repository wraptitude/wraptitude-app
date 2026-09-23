import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import { useBranch } from '../branch/BranchContext';
import { branchApi } from '../branch/api';
import { BRANCHES, BranchId } from '../branch/config';

interface ServiceOrder {
  ID: string;
  branchId: BranchId;
  createAt?: string;
  serviceType?: string | string[];
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  details?: string;
  depositAmount?: string;
  [field: string]: string | string[] | undefined;
}

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
    title: 'Deposit',
    description: 'Deposit payment received and confirmed',
    status: 'completed',
    images: '',
    weight: 2,
    icon: 'account-balance-wallet',
  },
  {
    id: '2',
    title: 'Vehicle Inspection and Cleaning',
    description: 'Detailed vehicle condition check and deep cleaning',
    status: 'completed',
    images: '',
    weight: 18,
    icon: 'fact-check',
  },
  {
    id: '3',
    title: 'Film Preparation',
    description: 'Prepare film materials, confirm measurements and cutting',
    status: 'completed',
    images: '',
    weight: 20,
    icon: 'content-cut',
  },
  {
    id: '4',
    title: 'Film Installation',
    description: 'Professional film installation process',
    status: 'in_progress',
    images: '',
    weight: 50,
    icon: 'build',
  },
  {
    id: '5',
    title: 'Quality Check',
    description: 'Comprehensive film quality inspection',
    status: 'pending',
    images: '',
    weight: 5,
    icon: 'verified',
  },
  {
    id: '6',
    title: 'Final Presentation',
    description: 'Final result presentation and customer confirmation',
    status: 'pending',
    images: '',
    weight: 5,
    icon: 'emoji-events',
  },
];

const ServiceTracking: React.FC = () => {
  const { branchId, branch } = useBranch();
  const [steps, setSteps] = useState<ServiceStep[]>(INITIAL_STEPS);
  const [loading, setLoading] = useState(true);
  const [loadingImage, setLoadingImage] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [serviceDetails, setServiceDetails] = useState({
    serviceType: '' as string | string[],
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleDetails: '',
  });
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressTextAnim = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  // Calculate overall progress
  const calculateProgress = useCallback(() => {
    return steps.reduce((total, step) => {
      if (step.status === 'completed') {
        return total + step.weight;
      } else if (step.status === 'in_progress') {
        return total + (step.weight * 0.5);
      }
      return total;
    }, 0);
  }, [steps]);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      setSteps([]);
      setOrders([]);
      setSelectedOrderId('');
      setLoadError('');
      setExpandedStep(null);
      setLoading(true);
      progressAnim.setValue(0);
      progressTextAnim.setValue(0);
      progressBarWidth.setValue(0);

      const getUserData = async () => {
        try {
            const services = await branchApi<ServiceOrder[]>(`/customer/services?branchId=${branchId}`);
            if (cancelled) return;
            if (services.some(order => order.branchId !== branchId)) {
              throw new Error('Order branch mismatch');
            }
            const sorted = [...services].sort((a, b) =>
              String(b.createAt || '').localeCompare(String(a.createAt || '')),
            );
            setOrders(sorted);
            setSelectedOrderId(sorted[0]?.ID || '');
        } catch (error) {
          if (cancelled) return;
          console.error('Error fetching data:', error);
          setSteps([]);
          setLoadError(`Unable to load ${branch.name} orders. Reopen this page to try again.`);
          Alert.alert(
            'Error',
            `Failed to load ${branch.name} service tracking data. Please try again later.`
          );
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      getUserData();

      return () => {
        cancelled = true;
      };
    }, [branchId, branch.name, progressAnim, progressTextAnim, progressBarWidth])
  );

  useEffect(() => {
    const data = orders.find(order => order.ID === selectedOrderId);
    setExpandedStep(null);
    if (!data) {
      setSteps([]);
      return;
    }
    setServiceDetails({
      serviceType: data.serviceType || '',
      vehicleMake: data.vehicleMake || '',
      vehicleModel: data.vehicleModel || '',
      vehicleYear: data.vehicleYear || '',
      vehicleDetails: data.details || '',
    });
    setSteps(INITIAL_STEPS.map((step, index) => {
      const value = data[`step${index}`];
      const status = value === 'completed' || value === 'in_progress' ? value : 'pending';
      return {
        ...step,
        status,
        images: String(data[`step${index}Img`] || ''),
        description: index === 0
          ? (status === 'completed' ? `Deposit confirmed${data.depositAmount ? `: $${data.depositAmount}` : ''}` : 'Awaiting deposit confirmation')
          : step.description,
      };
    }));
  }, [orders, selectedOrderId]);

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
  }, [calculateProgress, progressBarWidth, progressTextAnim]);

  const renderImage = (imageUrl: string) => {
    if (!imageUrl) return null;

    return (
      <View style={styles.imageContainer}>
          {loadingImage && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}
            <FastImage
              source={{ uri: imageUrl, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
              style={styles.stepImage}
              resizeMode={FastImage.resizeMode.contain}
              onLoadStart={() => setLoadingImage(true)}
              onLoadEnd={() => setLoadingImage(false)}
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

  const getDisplayServiceType = (serviceType: string | string[]): string => {
    // Handle array case
    if (Array.isArray(serviceType)) {
      return serviceType.map(type => {
        switch (type) {
          case 'window_tinting':
            return 'Window Tinting';
          case 'full_wrap':
            return 'Full Wrap';
          case 'partial_wrap':
            return 'Partial Wrap';
          case 'paint_protection':
            return 'Paint Protection';
          default:
            return type;
        }
      }).join(', ');
    }
    
    // Handle string case
    switch (serviceType) {
      case 'window_tinting':
        return 'Window Tinting';
      case 'full_wrap':
        return 'Full Wrap';
      case 'partial_wrap':
        return 'Partial Wrap';
      case 'paint_protection':
        return 'Paint Protection';
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
    }, [isExpanded, cardHeight, rotateAnim, scaleAnim]);

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
        {serviceDetails.vehicleDetails && (
          <View style={styles.serviceDetailsRow}>
            <Text style={styles.serviceDetailsLabel}>Details:</Text>
          </View>
        )}
        <View style={styles.serviceDetailsValueContainer}>
          <Text style={styles.serviceDetailsValue}>
            {serviceDetails.vehicleDetails}
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
            <Text style={styles.noDataTitle}>{loadError ? 'Unable to load orders' : `No ${branch.name} orders`}</Text>
            <Text style={styles.noDataText}>
              {loadError || `Your account belongs to ${branch.name}. No service orders yet. A quote request becomes an order once confirmed by our team. Contact your branch if an order is missing.`}
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
      <View style={styles.serviceDetailsContainer}>
        <Text style={styles.serviceDetailsValue}>Service location: {BRANCHES[orders.find(order => order.ID === selectedOrderId)?.branchId || branchId].name}</Text>
        <Text style={styles.serviceDetailsLabel}>Select your order</Text>
        <Picker selectedValue={selectedOrderId} onValueChange={setSelectedOrderId} style={styles.orderPicker} itemStyle={styles.orderPickerItem} dropdownIconColor="#fff">
          {orders.map(order => <Picker.Item key={order.ID} value={order.ID} color="#fff" label={`${order.vehicleYear || ''} ${order.vehicleMake || ''} ${order.vehicleModel || ''} · ${order.createAt ? new Date(order.createAt).toLocaleDateString() : 'Order'} · ${order.ID.slice(0, 8)}`} />)}
        </Picker>
        <Text selectable style={styles.serviceDetailsLabel}>Order ID: {selectedOrderId}</Text>
        <Text style={styles.serviceDetailsLabel}>Orders belong to your registered branch: {branch.name}.</Text>
      </View>
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

const styles = StyleSheet.create({
  orderPicker: { color: '#FFFFFF', backgroundColor: '#202024' },
  orderPickerItem: { color: '#FFFFFF', fontSize: 14 },
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
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  serviceDetailsValueContainer: {
    marginBottom: 8,
    paddingLeft: 16,
  },
});

export default ServiceTracking;
