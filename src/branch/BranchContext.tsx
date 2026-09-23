import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {branchApi} from './api';
import {colors} from '../styles/theme';

import { BRANCHES, BranchConfig, BranchId, DEFAULT_BRANCH_ID } from './config';

interface BranchContextValue {
  branchId: BranchId;
  branch: BranchConfig;
}

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({children, isGuestMode = false, onSignOut}: PropsWithChildren<{isGuestMode?: boolean; onSignOut?: () => void}>): React.JSX.Element {
  const [branchId, setBranchId] = useState<BranchId | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBranchId(null);
    setError('');
    if (isGuestMode) {
      setBranchId(DEFAULT_BRANCH_ID);
      return;
    }
    branchApi<{branchId: BranchId}>('/customer/account')
      .then(account => {
        if (cancelled) return;
        if (account.branchId !== 'markham' && account.branchId !== 'vaughan') throw new Error('Invalid account location');
        setBranchId(account.branchId);
      })
      .catch(() => { if (!cancelled) setError('Unable to verify your account location. Please retry.'); });
    return () => { cancelled = true; };
  }, [isGuestMode, attempt]);

  if (!branchId) {
    return <View style={{flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background}}>
      {error ? <>
        <Text style={{color: colors.text, marginBottom: 20}}>{error}</Text>
        <Pressable onPress={() => setAttempt(value => value + 1)}><Text style={{color: colors.redLight, padding: 16}}>Retry</Text></Pressable>
        {onSignOut && <Pressable onPress={onSignOut}><Text style={{color: colors.text, padding: 16}}>Sign out</Text></Pressable>}
      </> : <ActivityIndicator color={colors.red} />}
    </View>;
  }
  return <BranchContext.Provider value={{branchId, branch: BRANCHES[branchId]}}>{children}</BranchContext.Provider>;
}

export function useBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used inside BranchProvider');
  }
  return context;
}
