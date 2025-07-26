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

interface UserAttributes {
  email: string;
  email_verified: boolean;
  name: string;
  phone_number: string;
  sub: string;
  [key: string]: any;
}

const Profile: React.FC = () => {
  const [userAttributes, setUserAttributes] = useState<UserAttributes | null>(null);
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
      const attributes = await fetchUserAttributes();
      setUserAttributes(attributes as UserAttributes);
    } catch (err) {
      setError('無法載入用戶資訊');
      console.error('Error fetching user attributes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      '刪除帳戶',
      '您確定要刪除您的帳戶嗎？此操作無法撤銷。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteUser();
              // After successful deletion, you might want to navigate to the sign-in screen
              // or handle the post-deletion state
              Alert.alert('成功', '您的帳戶已成功刪除。');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('錯誤', '刪除帳戶失敗。請重試。');
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
        <Text style={styles.loadingText}>載入個人資料中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>重試</Text>
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
        <Text style={styles.sectionTitle}>帳戶資訊</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>電子郵件</Text>
          <Text style={styles.infoValue}>{userAttributes?.email || '未提供'}</Text>
          {userAttributes?.email_verified && (
            <Text style={styles.verifiedBadge}>✓ 已驗證</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>電話號碼</Text>
          <Text style={styles.infoValue}>
            {userAttributes?.phone_number || '未提供'}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>用戶 ID</Text>
          <Text style={styles.infoValue}>{userAttributes?.sub || '無法取得'}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>帳戶狀態</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>啟用中</Text>
          <View style={styles.statusDot} />
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>危險區域</Text>
        <Pressable
          style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>刪除帳戶</Text>
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