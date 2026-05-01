import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface DatePickerFieldProps {
  label?: string;
  isRequired?: boolean;
  value: Date | null;
  onChange: (date: Date) => void;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  isRequired = false,
  value,
  onChange,
  rightIcon,
  containerStyle,
}) => {
  const [show, setShow] = useState(false);

  const handlePress = () => {
    setShow(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    } else if (event.type === 'dismissed') {
      setShow(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).toUpperCase();
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {isRequired && <Text style={styles.required}> *</Text>}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.input, rightIcon ? styles.inputWithIcon : null]}>
          <Text style={[styles.inputText, !value && { color: Colors.textSecondary }]}>{formatDate(value)}</Text>
        </View>
        {rightIcon ? (
          <View style={styles.rightIconWrapper}>{rightIcon}</View>
        ) : null}
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date(2100, 11, 31)}
          minimumDate={new Date(2000, 0, 1)}
        />
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
    justifyContent: 'center',
    height: 50,
  },
  inputText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
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

export default DatePickerField;
