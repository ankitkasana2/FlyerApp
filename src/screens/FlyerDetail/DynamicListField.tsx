import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export interface DynamicListFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
  maxItems?: number;
}

const DynamicListField: React.FC<DynamicListFieldProps> = ({
  label,
  items,
  onChange,
  addLabel,
  placeholder = 'Enter value',
  maxItems = 10,
}) => {
  const handleChange = useCallback(
    (text: string, index: number) => {
      const updated = [...items];
      updated[index] = text;
      onChange(updated);
    },
    [items, onChange],
  );

  const handleAdd = useCallback(() => {
    if (items.length < maxItems) {
      onChange([...items, '']);
    }
  }, [items, maxItems, onChange]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.fieldsBlock}>
        {items.map((item, index) => (
          <TextInput
            key={`${label}_${index}`}
            style={styles.input}
            value={item}
            onChangeText={(text) => handleChange(text, index)}
            placeholder={`${placeholder} ${index + 1}`}
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.primary}
            autoCorrect={false}
            autoCapitalize="words"
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleAdd}
        activeOpacity={0.8}
      >
        <Text style={styles.addBtnText}>{addLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  fieldsBlock: {
    gap: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    height: 50,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});

export default DynamicListField;