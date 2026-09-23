import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BRANCHES, BranchId } from './config';
import { useBranch } from './BranchContext';
import { colors } from '../styles/theme';

interface BranchSelectorProps {
  onChange?: (branchId: BranchId) => void;
}

export default function BranchSelector({ onChange }: BranchSelectorProps): React.JSX.Element {
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
            accessibilityLabel={`${BRANCHES[id].name} location`}
            accessibilityHint="Switches the location shown throughout the app"
            onPress={() => (onChange || setBranchId)(id)}
            style={[styles.option, selected && styles.selectedOption]}
          >
            {selected && <Icon name="place" size={16} color={colors.text} style={styles.icon} />}
            <Text style={[styles.label, selected && styles.selectedLabel]}>{BRANCHES[id].name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  option: {
    flex: 1,
    borderRadius: 10,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selectedOption: {
    backgroundColor: colors.red,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedLabel: {
    color: colors.text,
  },
  icon: { marginRight: 6 },
});
