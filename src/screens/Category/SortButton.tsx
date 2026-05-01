import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export type SortOption = {
  id: string;
  label: string;
};

export interface SortButtonProps {
  options: SortOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  selectedTemplates: string[];
  onToggleTemplate: (id: string) => void;
}

// ─── Chevron down icon ────────────────────────────────────────────────────────
const ChevronDown: React.FC<{ color?: string }> = ({
  color = Colors.textPrimary,
}) => (
  <View
    style={{
      width: 14,
      height: 14,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: 6,
        height: 6,
        borderRightWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -3,
      }}
    />
  </View>
);

const Checkbox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
    {checked && <View style={styles.checkboxInner} />}
  </View>
);

const SortButton: React.FC<SortButtonProps> = ({
  options,
  selectedId,
  onSelect,
  selectedTemplates,
  onToggleTemplate,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel =
    options.find(o => o.id === selectedId)?.label ?? 'Sort by';

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}
      >
        <Text style={styles.triggerText}>Sort: {selectedLabel}</Text>
        <ChevronDown color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>SORT BY</Text>
              {options.map(opt => {
                const isSelected = opt.id === selectedId;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowActive,
                    ]}
                    onPress={() => {
                      onSelect(opt.id);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && <View style={styles.selectedDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>TEMPLATE TYPE</Text>
              <TouchableOpacity
                style={styles.filterRow}
                onPress={() => onToggleTemplate('info_only')}
                activeOpacity={0.75}
              >
                <Checkbox checked={selectedTemplates.includes('info_only')} />
                <Text style={styles.filterText}>Info Only</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.filterRow}
                onPress={() => onToggleTemplate('with_photos')}
                activeOpacity={0.75}
              >
                <Checkbox checked={selectedTemplates.includes('with_photos')} />
                <Text style={styles.filterText}>With Photos</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  triggerText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionRowActive: {
    backgroundColor: Colors.primary + '15',
  },
  optionText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  optionTextActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.bold,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 12,
  },
  filterText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.background,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: Colors.background,
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default SortButton;
