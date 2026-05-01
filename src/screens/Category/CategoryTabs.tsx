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

export interface CategoryTab {
  id: string;
  label: string;
}

export interface CategoryTabsProps {
  tabs: CategoryTab[];
  activeTabId: string;
  onTabPress: (id: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  tabs,
  activeTabId,
  onTabPress,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {tabs.map(tab => {
      const isActive = tab.id === activeTabId;
      return (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onTabPress(tab.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.primary + '20', // subtle tint
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: Colors.primary,
  },
});

export default CategoryTabs;
