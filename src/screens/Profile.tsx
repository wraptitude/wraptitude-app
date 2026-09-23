import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { fetchUserAttributes, deleteUser } from 'aws-amplify/auth';
import { branchApi } from '../branch/api';
import { useBranch } from '../branch/BranchContext';
import { BRANCHES, BranchId } from '../branch/config';

interface UserAttributes {
  email?: string;
  email_verified?: string;
  name?: string;
  phone_number?: string;
  sub?: string;
  [key: string]: string | undefined;
}

interface CustomerBranch {
  branchId: BranchId;
  joinedAt: string;
}

const Profile: React.FC = () => {
  const { branch } = useBranch();
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
  const [customerBranches, setCustomerBranches] = useState<CustomerBranch[]>([]);
  const [branchError, setBranchError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [attributesResult, branchesResult] = await Promise.allSettled([
        fetchUserAttributes(),
        branchApi<CustomerBranch[]>('/customer/branches'),
      ]);
      if (attributesResult.status === 'rejected') {
        throw attributesResult.reason;
      }
      setUserAttributes(attributesResult.value as UserAttributes);
      if (branchesResult.status === 'fulfilled') {
        setCustomerBranches(branchesResult.value);
        setBranchError(false);
      } else {
        setBranchError(true);
      }
    } catch (err) {
      setError('Failed to load user information');
      console.error('Error fetching user attributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteUser();
              // After successful deletion, you might want to navigate to the sign-in screen
              // or handle the post-deletion state
              Alert.alert('Success', 'Your account has been deleted successfully.');
            } catch (deleteError) {
              console.error('Error deleting account:', deleteError);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c70628" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userAttributes?.name ? userAttributes.name[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.nameText}>{userAttributes?.name || 'User'}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userAttributes?.email || 'Not provided'}</Text>
          {userAttributes?.email_verified && (
            <Text style={styles.verifiedBadge}>✓ Verified</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>
            {userAttributes?.phone_number || 'Not provided'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue}>{userAttributes?.sub || 'Not available'}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>My Locations</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Currently viewing</Text>
          <Text style={styles.infoValue}>{branch.name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Customer at</Text>
          <Text style={styles.infoValue}>
            {branchError
              ? 'Unable to load locations. Please try again.'
              : customerBranches.length
                ? customerBranches.map(({ branchId }) => BRANCHES[branchId].name).join(' · ')
                : 'No branch activity yet'}
          </Text>
        </View>
        <Text style={styles.branchHint}>
          A location appears here after you submit a request or have a service there. Switching locations does not move your records.
        </Text>
        {branchError && (
          <Pressable onPress={fetchUserData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Account Status</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Active</Text>
          <View style={styles.statusDot} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <Pressable
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    padding: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c70628',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'rgba(40, 40, 40, 0.9)',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  branchHint: {
    color: '#A0A0A0',
    fontSize: 13,
    lineHeight: 19,
  },
  verifiedBadge: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;
