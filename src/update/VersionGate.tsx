import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import SplashScreen from 'react-native-splash-screen';

import { BRANCH_API_URL } from '../branch/config';
import { getUpdateDecision, parseVersionPolicy, UpdateDecision, VersionPolicy } from './version';

const platform = Platform.OS === 'ios' ? 'ios' : 'android';
const policyKey = `@wraptitude/version-policy/${platform}`;
const dismissedKey = `@wraptitude/dismissed-update/${platform}`;

export default function VersionGate({ children }: PropsWithChildren): React.JSX.Element {
  const [initializing, setInitializing] = useState(true);
  const [decision, setDecision] = useState<UpdateDecision | null>(null);
  const [openingStore, setOpeningStore] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  const checkVersion = useCallback(async () => {
    requestRef.current?.abort();
    const request = new AbortController();
    requestRef.current = request;
    const timeout = setTimeout(() => request.abort(), 8000);
    let policy: VersionPolicy | null = null;
    try {
      const response = await fetch(`${BRANCH_API_URL}/public/app-version?platform=${platform}`, {
        signal: request.signal,
      });
      if (!response.ok) {
        throw new Error(`Version check failed (${response.status})`);
      }
      const payload = (await response.json()) as { data: unknown };
      policy = parseVersionPolicy(payload.data);
      if (!policy) {
        throw new Error('Invalid version policy');
      }
      await AsyncStorage.setItem(policyKey, JSON.stringify(policy));
    } catch {
      try {
        const cached = await AsyncStorage.getItem(policyKey);
        policy = cached ? parseVersionPolicy(JSON.parse(cached) as unknown) : null;
      } catch {
        policy = null;
      }
    } finally {
      clearTimeout(timeout);
    }

    if (requestRef.current !== request) {
      return;
    }
    const nextDecision = policy ? getUpdateDecision(DeviceInfo.getVersion(), platform, policy) : null;
    if (nextDecision?.kind === 'optional') {
      try {
        if (await AsyncStorage.getItem(dismissedKey) === nextDecision.latestVersion) {
          setDecision(null);
        } else {
          setDecision(nextDecision);
        }
      } catch {
        setDecision(nextDecision);
      }
    } else {
      setDecision(nextDecision);
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    SplashScreen.hide();
    checkVersion().catch(() => setInitializing(false));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkVersion().catch(() => setInitializing(false));
      }
    });
    return () => {
      subscription.remove();
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [checkVersion]);

  const openStore = async () => {
    if (!decision || openingStore) {
      return;
    }
    setOpeningStore(true);
    try {
      await Linking.openURL(decision.storeUrl);
      if (decision.kind === 'optional') {
        await dismissOptional();
      }
    } catch {
      Alert.alert('Unable to open store', 'Please open the App Store or Google Play and search for Wraptitude.');
    } finally {
      setOpeningStore(false);
    }
  };

  const dismissOptional = async () => {
    if (decision?.kind !== 'optional') {
      return;
    }
    try {
      await AsyncStorage.setItem(dismissedKey, decision.latestVersion);
    } catch {
      // The user can still dismiss this optional prompt for the current session.
    }
    setDecision(null);
  };

  if (initializing) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator color="#c70628" size="large" />
      </View>
    );
  }

  if (decision?.kind === 'force') {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.message}>
          {decision.message || `A newer version (${decision.latestVersion}) is required to continue using Wraptitude.`}
        </Text>
        <Pressable style={styles.primaryButton} onPress={openStore} disabled={openingStore}>
          <Text style={styles.primaryButtonText}>{openingStore ? 'Opening store…' : 'Update Now'}</Text>
        </Pressable>
        <Pressable style={styles.retryButton} onPress={checkVersion}>
          <Text style={styles.retryButtonText}>Check Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      {children}
      <Modal
        visible={decision?.kind === 'optional'}
        transparent
        animationType="fade"
        onRequestClose={() => { dismissOptional().catch(() => undefined); }}
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Update Available</Text>
            <Text style={styles.message}>
              {decision?.message || `Version ${decision?.latestVersion} is available with the latest improvements.`}
            </Text>
            <Pressable style={styles.primaryButton} onPress={openStore} disabled={openingStore}>
              <Text style={styles.primaryButtonText}>{openingStore ? 'Opening store…' : 'Update Now'}</Text>
            </Pressable>
            <Pressable style={styles.retryButton} onPress={() => { dismissOptional().catch(() => undefined); }}>
              <Text style={styles.retryButtonText}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#040404',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#171717',
    borderRadius: 18,
    padding: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  message: {
    color: '#DDDDDD',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#c70628',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  retryButton: {
    padding: 15,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
