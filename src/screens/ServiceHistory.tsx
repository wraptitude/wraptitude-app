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

  const renderStep = (step: string, img: string, stepNumber: number) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepLabel}>Step {stepNumber}:</Text>
      <Text style={[
        styles.stepStatus,
        step === 'completed' && styles.statusCompleted,
        step === 'in_progress' && styles.statusInProgress,
        step === 'pending' && styles.statusPending
      ]}>
        {step}
      </Text>
      {img ? (
        <Image 
          source={{ uri: img }} 
          style={styles.stepImage}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading service history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchServiceHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {serviceHistory.length === 0 ? (
          <Text style={styles.noRecordsText}>No service records found</Text>
        ) : (
          serviceHistory.map((record) => (
            <Pressable 
              key={record.id}
              style={styles.serviceCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.serviceType}>{record.serviceType}</Text>
                  <Text style={styles.date}>{formatDate(record.createAt)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Vehicle:</Text>
                  <Text style={styles.value}>
                    {`${record.vehicleYear} ${record.vehicleMake} ${record.vehicleModel}`}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Service ID:</Text>
                  <Text style={styles.value}>{record.id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Cost:</Text>
                  <Text style={styles.value}>${record.cost}</Text>
                </View>
                <View style={styles.detailsSection}>
                  <Text style={styles.label}>Details:</Text>
                  <Text style={styles.detailsText}>{record.details}</Text>
                </View>

                {renderStep(record.step1, record.step1Img, 1)}
                {renderStep(record.step2, record.step2Img, 2)}
                {renderStep(record.step3, record.step3Img, 3)}
                {renderStep(record.step4, record.step4Img, 4)}
                {renderStep(record.step5, record.step5Img, 5)}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#7c7c7c',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#7c7c7c',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  detailsSection: {
    marginTop: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 4,
    lineHeight: 20,
  },
  stepContainer: {
    marginTop: 12,
  },
  stepLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepStatus: {
    fontSize: 14,
    color: '#7c7c7c',
    marginBottom: 4,
  },
  stepImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 4,
  },
  noImageText: {
    fontSize: 14,
    color: '#7c7c7c',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  noRecordsText: {
    color: '#7c7c7c',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
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