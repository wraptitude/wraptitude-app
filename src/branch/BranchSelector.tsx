import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BRANCHES, BranchId } from './config';
import { useBranch } from './BranchContext';

export default function BranchSelector(): React.JSX.Element {
  const { branchId, setBranchId } = useBranch();

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {(Object.keys(BRANCHES) as BranchId[]).map((id) => {
        const selected = branchId === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setBranchId(id)}
            style={[styles.option, selected && styles.selectedOption]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{BRANCHES[id].name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 6,
    padding: 3,
  },
  option: {
    borderRadius: 14,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  selectedOption: {
    backgroundColor: '#c70628',
  },
  label: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});
