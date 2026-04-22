// components/auth/AuthInput.tsx

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

import Images from '../../assets';
import { Image } from 'react-native';

// ─── Eye / Eye-off icon (from assets) ─────────────────────────────────────────
const EyeIcon: React.FC<{ visible: boolean; size?: number }> = ({
  visible,
  size = 20,
}) => (
  <Image 
    source={visible ? Images.eyeOpen : Images.eyeClose} 
    style={{ width: size, height: size, tintColor: Colors.textMuted }} 
    resizeMode="contain" 
  />
);

// ─── Check icon ───────────────────────────────────────────────────────────────
const CheckIcon: React.FC<{ color?: string; size?: number }> = ({
  color = '#4CAF50',
  size = 20,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.26,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        position: 'absolute',
        bottom: size * 0.28,
        left: size * 0.14,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View
      style={{
        width: size * 0.44,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        position: 'absolute',
        bottom: size * 0.33,
        right: size * 0.1,
        transform: [{ rotate: '-55deg' }],
      }}
    />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export type InputValidationState = 'idle' | 'valid' | 'error';

export interface AuthInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  validationState?: InputValidationState;
  errorMessage?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  editable?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AuthInput: React.FC<AuthInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  validationState = 'idle',
  errorMessage,
  autoCapitalize = 'none',
  returnKeyType = 'next',
  onSubmitEditing,
  containerStyle,
  leftIcon,
  rightElement,
  editable = true,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      validationState === 'error'
        ? Colors.primary
        : validationState === 'valid'
        ? '#4CAF50'
        : Colors.border,
      validationState === 'error' ? Colors.primary : '#4CAF50',
    ],
  });

  const resolvedBorderColor =
    validationState === 'error'
      ? Colors.primary
      : validationState === 'valid'
      ? '#4CAF50'
      : Colors.border;

  const resolvedSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: resolvedBorderColor },
        ]}
      >
        {leftIcon && <View style={styles.leftSlot}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={resolvedSecure}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor={Colors.primary}
          editable={editable}
        />

        {/* Right element: custom, or auto eye/check */}
        {rightElement ? (
          <View style={styles.rightSlot}>{rightElement}</View>
        ) : secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightSlot}
            onPress={() => setPasswordVisible((v) => !v)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <EyeIcon visible={passwordVisible} size={20} />
          </TouchableOpacity>
        ) : validationState === 'valid' ? (
          <View style={styles.rightSlot}>
            <CheckIcon size={20} />
          </View>
        ) : null}
      </Animated.View>

      {validationState === 'error' && errorMessage ? (
        <View style={styles.errorRow}>
          {/* ⊙ error circle icon */}
          <View style={styles.errorDot} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    gap: 7,
  },
  label: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  leftSlot: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightSlot: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.primary,
  },
});

export default AuthInput;