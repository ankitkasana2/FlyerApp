// components/auth/PasswordStrengthBar.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthBarProps {
  password: string;
}

const getStrength = (password: string): PasswordStrength => {
  if (password.length === 0) return 'weak';
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
};

const STRENGTH_CONFIG: Record<
  PasswordStrength,
  { label: string; color: string; filledCount: number }
> = {
  weak:   { label: 'WEAK',   color: Colors.primary, filledCount: 1 },
  fair:   { label: 'FAIR',   color: '#FF9800',       filledCount: 2 },
  good:   { label: 'GOOD',   color: '#8BC34A',       filledCount: 3 },
  strong: { label: 'STRONG', color: '#4CAF50',       filledCount: 4 },
};

const SEGMENT_COUNT = 4;

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const strength = useMemo(() => getStrength(password), [password]);
  const config = STRENGTH_CONFIG[strength];

  if (!password) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.segmentRow}>
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < config.filledCount
                ? { backgroundColor: config.color }
                : { backgroundColor: Colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    letterSpacing: 1.2,
  },
});

export default PasswordStrengthBar;