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
import { colors } from '../styles/theme';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.sectionTitle}>My Branch</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registered branch</Text>
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
          Your branch was selected when you registered and cannot be changed in the app. All existing customer accounts belong to Markham. Your requests and service orders go to your registered branch.
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
    backgroundColor: colors.background,
  },
  content: { paddingBottom: 28 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text,
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
    color: colors.redLight,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 12,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.red,
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
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  branchHint: {
    color: colors.muted,
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
    backgroundColor: colors.redTint,
    borderWidth: 1,
    borderColor: '#76303D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: colors.redLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile;
