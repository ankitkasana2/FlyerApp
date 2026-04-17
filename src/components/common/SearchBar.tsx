// components/common/SearchBar.tsx

import React, { useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

// ─── SVG-less inline icon: Search ────────────────────────────────────────────
const SearchIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.searchIcon,
  size = 18,
}) => (
  // Using a simple Unicode magnifier rendered via Text inside an absolute view
  // For production swap with your SVG asset
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    {/* Circle part */}
    <View
      style={{
        width: size * 0.62,
        height: size * 0.62,
        borderRadius: size * 0.31,
        borderWidth: 2,
        borderColor: color,
      }}
    />
    {/* Handle part */}
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 2,
        height: size * 0.35,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
        top: size * 0.52,
        left: size * 0.52,
      }}
    />
  </View>
);

// ─── Clear Icon (X) ───────────────────────────────────────────────────────────
const ClearIcon: React.FC<{ color?: string; size?: number }> = ({
  color = Colors.textSecondary,
  size = 16,
}) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        position: 'absolute',
        width: size * 0.75,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: size * 0.75,
        height: 2,
        backgroundColor: color,
        borderRadius: 1,
        transform: [{ rotate: '-45deg' }],
      }}
    />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SearchBarProps {
  /** Controlled value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Called when user submits / presses search on keyboard */
  onSubmit?: (text: string) => void;
  /** Called when clear button is pressed */
  onClear?: () => void;
  /** Extra container styles */
  containerStyle?: ViewStyle;
  /** Auto-focus the input */
  autoFocus?: boolean;
  /** Whether the bar is in a loading state */
  isLoading?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  onClear,
  containerStyle,
  autoFocus = false,
}) => {
  const inputRef = useRef<TextInput>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.searchBorder, Colors.primary],
  });

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(value);
  }, [onSubmit, value]);

  return (
    <Animated.View style={[styles.container, { borderColor }, containerStyle]}>
      {/* Search Icon */}
      <View style={styles.iconLeft}>
        <SearchIcon color={Colors.searchIcon} size={18} />
      </View>

      {/* Input */}
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.searchPlaceholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        selectionColor={Colors.primary}
        clearButtonMode="never" // we handle our own
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <ClearIcon color={Colors.textSecondary} size={14} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBg,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconLeft: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
    paddingVertical: 0, // reset Android default padding
    includeFontPadding: false,
  },
  clearButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
  },
});

export default SearchBar;
