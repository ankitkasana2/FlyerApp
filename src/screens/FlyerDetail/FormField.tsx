import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';
import { getRecentItems, type RecentKey } from '../../utils/recentItems';

export interface FormFieldProps {
  label?: string;
  isRequired?: boolean;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  recentKey?: RecentKey;
  onRecentSelect?: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  isRequired = false,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  rightIcon,
  containerStyle,
  recentKey,
  onRecentSelect,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleHistoryPress = useCallback(async () => {
    if (showSuggestions) {
      setShowSuggestions(false);
      return;
    }
    const items = await getRecentItems(recentKey!);
    setSuggestions(items);
    setShowSuggestions(true);
  }, [recentKey, showSuggestions]);

  const handleSuggestionSelect = useCallback(
    (item: string) => {
      onRecentSelect?.(item);
      setShowSuggestions(false);
    },
    [onRecentSelect],
  );

  const handleChangeText = useCallback(
    (t: string) => {
      onChangeText(t);
      if (showSuggestions) setShowSuggestions(false);
    },
    [onChangeText, showSuggestions],
  );

  const showHistoryBtn = !!recentKey && !!onRecentSelect;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {isRequired && <Text style={styles.required}> *</Text>}
          {showHistoryBtn && (
            <TouchableOpacity
              onPress={handleHistoryPress}
              style={styles.historyBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Image
                source={AppImages.time}
                style={[
                  styles.historyIcon,
                  showSuggestions && { tintColor: Colors.primary },
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            rightIcon ? styles.inputWithIcon : null,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={Colors.primary}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsCard}>
          {suggestions.length === 0 ? (
            <Text style={styles.noSuggestionsText}>No recent entries yet</Text>
          ) : (
            suggestions.map((item, index) => (
              <TouchableOpacity
                key={`sug_${index}`}
                style={[
                  styles.suggestionRow,
                  index < suggestions.length - 1 && styles.suggestionRowBorder,
                ]}
                onPress={() => handleSuggestionSelect(item)}
                activeOpacity={0.75}
              >
                <Image
                  source={AppImages.time}
                  style={styles.suggestionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
    flex: 1,
  },
  required: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  historyBtn: {
    marginLeft: 6,
    padding: 2,
  },
  historyIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textMuted,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
    height: 50,
  },
  inputMultiline: {
    height: 100,
    paddingTop: 14,
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  rightIconWrapper: {
    position: 'absolute',
    right: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginTop: -2,
  },
  noSuggestionsText: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  suggestionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  suggestionIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.textMuted,
  },
  suggestionText: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
  },
});

export default FormField;
