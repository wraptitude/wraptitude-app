import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { BRANCHES, BranchConfig, BranchId, DEFAULT_BRANCH_ID } from './config';

const STORAGE_KEY = '@wraptitude/selected-branch';

interface BranchContextValue {
  branchId: BranchId;
  branch: BranchConfig;
  setBranchId: (branchId: BranchId) => void;
  selectionVersion: number;
  isReady: boolean;
}

const BranchContext = createContext<BranchContextValue | null>(null);

export function BranchProvider({ children }: PropsWithChildren): React.JSX.Element {
  const [branchId, setBranchIdState] = useState<BranchId>(DEFAULT_BRANCH_ID);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'markham' || stored === 'vaughan') {
          setBranchIdState(stored);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const setBranchId = (nextBranchId: BranchId) => {
    if (nextBranchId === branchId) {
      return;
    }
    setBranchIdState(nextBranchId);
    setSelectionVersion((version) => version + 1);
    void AsyncStorage.setItem(STORAGE_KEY, nextBranchId);
  };

  const value = useMemo(
    () => ({ branchId, branch: BRANCHES[branchId], setBranchId, selectionVersion, isReady }),
    [branchId, selectionVersion, isReady],
  );

  return <BranchContext.Provider value={value}>{isReady ? children : null}</BranchContext.Provider>;
}

export function useBranch(): BranchContextValue {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used inside BranchProvider');
  }
  return context;
}
