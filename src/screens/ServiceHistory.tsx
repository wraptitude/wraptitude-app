import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
interface ServiceRecord {
  id: string;
  cost: string;
  createAt: string;
  details: string;
  editAt: string;
  serviceTrackingEnable: string;
  serviceType: string;
  step1: string;
  step1Img: string;
  step2: string;
  step2Img: string;
  step3: string;
  step3Img: string;
  step4: string;
  step4Img: string;
  step5: string;
  step5Img: string;
  userID: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
}

const ServiceHistory: React.FC = () => {
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    fetchServiceHistory();
  }, []);

  const fetchServiceHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user ID from Amplify
      const userAttributes = await fetchUserAttributes();
      const userId = userAttributes.sub;
      setUserId(userId);
      
      // Make API call
      const response = await fetch('https://v3l0ylwh6a.execute-api.us-east-2.amazonaws.com/PROD/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          userID: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service history');
      }

      const responseData = await response.json();
      // Parse the nested body string into an object
      const parsedBody = JSON.parse(responseData.body);
      // Extract the data array from the parsed body
      const serviceRecords = parsedBody.data;
      
      // Transform the data to match our interface (ID -> id)
      const transformedRecords = serviceRecords.map((record: any) => ({
        ...record,
        id: record.ID, // Map ID to id
      }));

      setServiceHistory(transformedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching service history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        return serviceType.replace(/_/g, ' ');
    }
  };

  const getStepDescription = (stepNumber: number): string => {
    switch (stepNumber) {
      case 1:
        return "Vehicle Inspection and Cleaning";
      case 2:
        return "Film Preparation";
      case 3:
        return "Film Installation";
      case 4:
        return "Quality Check";
      case 5:
        return "Final Presentation";
      default:
        return "";
    }
  };

  const getStepIcon = (stepNumber: number): string => {
    switch (stepNumber) {
      case 1:
        return "fact-check";
      case 2:
        return "content-cut";
      case 3:
        return "build";
      case 4:
        return "verified";
      case 5:
        return "emoji-events";
      default:
        return "circle";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return ['#40d860', '#2fb04f'];
      case 'in_progress':
        return ['#498eff', '#2c74da'];
      case 'pending':
      default:
        return ['#ffb134', '#ff901f'];
    }
  };

  const renderImage = (imageUrl: string, recordId: string, stepNumber: number) => {
    if (!imageUrl) return null;
    
    const imageKey = `${recordId}-${stepNumber}`;
    
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

  const ServiceCard = ({ record }: { record: ServiceRecord }) => {
    const isExpanded = expandedRecord === record.id;
    
    const toggleExpand = () => {
      setExpandedRecord(isExpanded ? null : record.id);
    };

    return (
      <Pressable 
        style={[styles.serviceCard, isExpanded && styles.serviceCardExpanded]}
        onPress={toggleExpand}
      >
        {/* <LinearGradient
          // colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.94)']}
          colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.94)']}
          style={styles.serviceCardGradient}
        > */}
          <View style={styles.cardHeader}>
            <View style={styles.serviceInfoContainer}>
              <Text style={styles.serviceType}>
                {getDisplayServiceType(record.serviceType)}
              </Text>
              <Text style={styles.date}>{formatDate(record.createAt)}</Text>
            </View>
            <View style={styles.costContainer}>
              <Text style={styles.costLabel}>Cost</Text>
              <Text style={styles.costValue}>${record.cost}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.vehicleInfoContainer}>
            <Icon name="directions-car" size={16} color="#9CA3AF" style={styles.vehicleIcon} />
            <Text style={styles.vehicleInfo}>
              {`${record.vehicleYear} ${record.vehicleMake} ${record.vehicleModel}`}
            </Text>
          </View>

          {isExpanded && (
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsLabel}>Service Progress</Text>
              <StepItem 
                step={record.step1} 
                img={record.step1Img} 
                stepNumber={1} 
                recordId={record.id}
              />
              <StepItem 
                step={record.step2} 
                img={record.step2Img} 
                stepNumber={2} 
                recordId={record.id}
              />
              <StepItem 
                step={record.step3} 
                img={record.step3Img} 
                stepNumber={3} 
                recordId={record.id}
              />
              <StepItem 
                step={record.step4} 
                img={record.step4Img} 
                stepNumber={4} 
                recordId={record.id}
              />
              <StepItem 
                step={record.step5} 
                img={record.step5Img} 
                stepNumber={5} 
                recordId={record.id}
              />
            </View>
          )}

          <View style={styles.expandIconContainer}>
            <Icon 
              name={isExpanded ? "expand-less" : "expand-more"} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
        {/* </LinearGradient> */}
      </Pressable>
    );
  };

  const StepItem = ({ 
    step, 
    img, 
    stepNumber, 
    recordId 
  }: { 
    step: string; 
    img: string; 
    stepNumber: number; 
    recordId: string;
  }) => {
    const statusColors = getStatusColor(step);

    return (
      <View style={styles.stepItemContainer}>
        <View style={styles.stepHeader}>
          <View style={styles.stepIconContainer}>
            <LinearGradient
              colors={statusColors}
              style={styles.iconGradient}
            >
              <Icon name={getStepIcon(stepNumber)} size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.stepTitleContainer}>
            <Text style={styles.stepTitle}>Step {stepNumber}</Text>
            <Text style={styles.stepDescription}>{getStepDescription(stepNumber)}</Text>
          </View>
          <View style={styles.stepStatusContainer}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: statusColors[0] }
            ]} />
            <Text style={[
              styles.statusText,
              step === 'completed' && styles.statusCompleted,
              step === 'in_progress' && styles.statusInProgress,
              step === 'pending' && styles.statusPending
            ]}>
              {step.replace('_', ' ')}
            </Text>
          </View>
        </View>
        {img && renderImage(img, recordId, stepNumber)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* <LinearGradient
          colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.95)']}
          style={styles.loadingGradient}
        > */}
          <ActivityIndicator size="large" color="#c70628" />
          <Text style={styles.loadingText}>Loading service history...</Text>
        {/* </LinearGradient> */}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        {/* <LinearGradient
          colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.95)']}
          style={styles.errorGradient}
        > */}
          <Icon name="error-outline" size={36} color="#FF4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable 
            style={styles.retryButton} 
            onPress={fetchServiceHistory}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        {/* </LinearGradient> */}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {serviceHistory.length === 0 ? (
        <View style={styles.noRecordsContainer}>
          {/* <LinearGradient
            colors={['rgba(30, 30, 30, 0.9)', 'rgba(20, 20, 20, 0.95)']}
            style={styles.noRecordsGradient}
          > */}
            <Icon name="history" size={48} color="#9CA3AF" />
            <Text style={styles.noRecordsTitle}>No Service History</Text>
            <Text style={styles.noRecordsText}>
              You haven't completed any services yet.
              Book a service to get started with Wraptitude.
            </Text>
          {/* </LinearGradient> */}
        </View>
      ) : (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Your Service History</Text>
          {serviceHistory.map((record) => (
            <ServiceCard key={record.id} record={record} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  historyContainer: {
    padding: 16,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  serviceCard: {
    padding: 16,
    // marginTop: 16,
    // marginLeft: 16,
    // marginRight: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  serviceCardExpanded: {
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  serviceCardGradient: {
    padding: 16,
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfoContainer: {
    flex: 1,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c70628',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  vehicleInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    marginRight: 8,
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  stepsContainer: {
    marginTop: 16,
    gap: 12,
  },
  stepsLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: '600',
  },
  stepItemContainer: {
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  stepStatusContainer: {
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
    textTransform: 'capitalize',
  },
  expandIconContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginTop: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingGradient: {
    width: '80%',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorGradient: {
    width: '80%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(199, 6, 40, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c70628',
  },
  retryButtonText: {
    color: '#c70628',
    fontSize: 16,
    fontWeight: '600',
  },
  noRecordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  noRecordsGradient: {
    width: '90%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  noRecordsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  noRecordsText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  statusCompleted: {
    color: '#4CAF50',
  },
  statusInProgress: {
    color: '#2196F3',
  },
  statusPending: {
    color: '#FFC107',
  },
});

export default ServiceHistory; 