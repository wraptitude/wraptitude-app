import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { fetchUserAttributes } from 'aws-amplify/auth';

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
      console.log('userId',userId);
      // Make API call
      const response = await fetch('https://v3l0ylwh6a.execute-api.us-east-2.amazonaws.com/PROD/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

  const renderStep = (step: string, img: string, stepNumber: number) => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepLabel}>Step {stepNumber}:</Text>
        <Text style={styles.stepDescription}>
          {getStepDescription(stepNumber)}
        </Text>
      </View>
      <Text style={[
        styles.stepStatus,
        step === 'completed' && styles.statusCompleted,
        step === 'in_progress' && styles.statusInProgress,
        step === 'pending' && styles.statusPending
      ]}>
        {step}
      </Text>
      {img && img !== '' && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: img }} 
            style={styles.stepImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c70628" />
        <Text style={styles.loadingText}>Loading service history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable 
          style={styles.retryButton} 
          onPress={fetchServiceHistory}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {serviceHistory.length === 0 ? (
          <View style={styles.noRecordsContainer}>
            <Text style={styles.noRecordsTitle}>No Service History</Text>
            <Text style={styles.noRecordsText}>
              You haven't completed any services yet.
              Book a service to get started with Wraptitude.
            </Text>
          </View>
        ) : (
          serviceHistory.map((record) => (
            <Pressable 
              key={record.id}
              style={styles.serviceCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.serviceType}>
                    {record.serviceType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.date}>{formatDate(record.createAt)}</Text>
                </View>
                <View style={styles.costContainer}>
                  <Text style={styles.costLabel}>Cost</Text>
                  <Text style={styles.costValue}>${record.cost}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Vehicle</Text>
                  <Text style={styles.value}>
                    {`${record.vehicleYear} ${record.vehicleMake} ${record.vehicleModel}`}
                  </Text>
                </View>

                {/* <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Service Details</Text>
                  <Text style={styles.detailsText}>{record.details}</Text>
                </View> */}

                <View style={styles.stepsSection}>
                  <Text style={styles.stepsLabel}>Service Progress</Text>
                  {renderStep(record.step1, record.step1Img, 1)}
                  {renderStep(record.step2, record.step2Img, 2)}
                  {renderStep(record.step3, record.step3Img, 3)}
                  {renderStep(record.step4, record.step4Img, 4)}
                  {renderStep(record.step5, record.step5Img, 5)}
                </View>
              </View>
            </Pressable>
          ))
        )}
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
    padding: 16,
    paddingBottom: 100, // Extra padding for footer
  },
  serviceCard: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    color: '#A0A0A0',
  },
  costContainer: {
    alignItems: 'flex-end',
  },
  costLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    marginBottom: 2,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c70628',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  cardContent: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: '#A0A0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  detailsSection: {
    gap: 8,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  stepsSection: {
    gap: 12,
  },
  stepsLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stepContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
  },
  stepStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    marginTop: 8,
  },
  stepImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  noImageText: {
    fontSize: 13,
    color: '#A0A0A0',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
  noRecordsTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noRecordsText: {
    color: '#A0A0A0',
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