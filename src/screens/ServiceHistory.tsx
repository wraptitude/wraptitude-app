import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Image,
} from 'react-native';

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

const serviceHistory: ServiceRecord[] = [
  {
    id: '941eaa93-69e4-4859-b52a-68c97f193a42',
    cost: '3000',
    createAt: '2025-04-03T19:55:14.751658-04:00',
    details: 'details',
    editAt: '2025-04-03T19:55:14.751658-04:00',
    serviceTrackingEnable: 'True',
    serviceType: 'window_tinting',
    step1: 'in_progress',
    step1Img: 'https://wraptitude-service.s3.amazonaws.com/941eaa93-69e4-4859-b52a-68c97f193a42/step1Img.jpg',
    step2: 'completed',
    step2Img: '',
    step3: 'in_progress',
    step3Img: '',
    step4: 'pending',
    step4Img: '',
    step5: 'pending',
    step5Img: '',
    userID: 'a16b6580-d071-7030-5ba9-5d325e9413d5',
    vehicleMake: 'BMW',
    vehicleModel: 'X5',
    vehicleYear: '2008',
  },
  // Add more records as needed
];

const ServiceHistory: React.FC = () => {
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
      <Text style={styles.stepStatus}>{step}</Text>
      {img ? (
        <Image source={{ uri: img }} style={styles.stepImage} />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {serviceHistory.map((record) => (
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
                <Text style={styles.value}>{`${record.vehicleYear} ${record.vehicleMake} ${record.vehicleModel}`}</Text>
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
});

export default ServiceHistory; 