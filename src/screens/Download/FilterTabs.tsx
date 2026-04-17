import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';

export type FilterTab = 'All' | 'Images' | 'Videos' | 'Documents' | 'PSD';

interface FilterTabsProps {
  activeTab: FilterTab;
  onTabPress: (tab: FilterTab) => void;
}

const TABS: FilterTab[] = ['All', 'Images', 'Videos', 'Documents', 'PSD'];

const FilterTabs: React.FC<FilterTabsProps> = ({ activeTab, onTabPress }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {TABS.map((tab) => {
      const isActive = tab === activeTab;
      return (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onTabPress(tab)}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.textPrimary,
  },
  tabText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.background,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default FilterTabs;