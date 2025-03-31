import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';

interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  vehicle: string;
  status: 'completed' | 'cancelled' | 'in_progress';
  cost: string;
  details: string;
  progress?: number; // Optional progress percentage for in-progress services
}

const serviceHistory: ServiceRecord[] = [
  {
    id: 'SH001',
    date: '2024-02-25',
    service: 'Full Car Wrap',
    vehicle: '2024 Audi RS7',
    status: 'in_progress',
    cost: '$4,500',
    details: 'XPEL Stealth Satin Paint Protection Film, Full Vehicle Coverage with Ceramic Coating',
    progress: 60,
  },
  {
    id: 'SH002',
    date: '2024-02-23',
    service: 'Paint Protection Film',
    vehicle: '2024 Porsche GT3 RS',
    status: 'in_progress',
    cost: '$2,800',
    details: 'Full Front PPF Package, Including Hood, Bumper, Fenders, and Mirrors',
    progress: 30,
  },
  {
    id: 'SH003',
    date: '2024-02-15',
    service: 'Full Car Wrap',
    vehicle: '2023 Tesla Model Y',
    status: 'completed',
    cost: '$3,200',
    details: 'Matte Black Wrap with Chrome Delete, Paint Protection Film on Front Bumper',
  },
  {
    id: 'SH004',
    date: '2024-01-20',
    service: 'Window Tinting',
    vehicle: '2024 BMW M3',
    status: 'completed',
    cost: '$650',
    details: 'Full Window Tint with Ceramic Film, 20% All Around, 70% Windshield',
  },
  {
    id: 'SH005',
    date: '2023-12-10',
    service: 'Ceramic Coating',
    vehicle: '2023 Porsche 911',
    status: 'completed',
    cost: '$1,800',
    details: 'Premium Ceramic Coating Package with Paint Correction',
  },
  {
    id: 'SH006',
    date: '2023-11-05',
    service: 'Paint Protection Film',
    vehicle: '2024 Mercedes AMG GT',
    status: 'cancelled',
    cost: '$2,500',
    details: 'Full Front PPF Package (Cancelled due to scheduling conflict)',
  },
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return styles.completedBadge;
      case 'cancelled':
        return styles.cancelledBadge;
      case 'in_progress':
        return styles.inProgressBadge;
      default:
        return styles.completedBadge;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

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
                <Text style={styles.serviceType}>{record.service}</Text>
                <Text style={styles.date}>{formatDate(record.date)}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                getStatusStyle(record.status)
              ]}>
                <Text style={styles.statusText}>
                  {formatStatus(record.status)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Vehicle:</Text>
                <Text style={styles.value}>{record.vehicle}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Service ID:</Text>
                <Text style={styles.value}>{record.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Cost:</Text>
                <Text style={styles.value}>{record.cost}</Text>
              </View>
              <View style={styles.detailsSection}>
                <Text style={styles.label}>Details:</Text>
                <Text style={styles.detailsText}>{record.details}</Text>
              </View>
              
              {record.status === 'in_progress' && record.progress && (
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${record.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{record.progress}% Complete</Text>
                </View>
              )}
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedBadge: {
    backgroundColor: 'rgba(50, 215, 75, 0.1)',
    borderWidth: 1,
    borderColor: '#32D74B',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    borderWidth: 1,
    borderColor: '#FF9F0A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  progressSection: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9F0A',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#FF9F0A',
    textAlign: 'right',
  },
});

export default ServiceHistory; 