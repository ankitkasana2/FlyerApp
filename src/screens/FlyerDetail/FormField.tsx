import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

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
}) => (
  <View style={[styles.wrapper, containerStyle]}>
    {label ? (
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.required}> *</Text>}
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
        onChangeText={onChangeText}
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
  </View>
);

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
  },
  required: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
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
});

export default FormField;