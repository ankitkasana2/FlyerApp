import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Colors from '../../theme/colors';
import Typography from '../../theme/typography';
import AppImages from '../../assets/App';

export interface SponsorsUploadProps {
  count?: number;
  onUploadPress: (index: number) => void;
  onLibraryPress: (index: number) => void;
}

const SponsorsUpload: React.FC<SponsorsUploadProps> = ({
  count = 3,
  onUploadPress,
  onLibraryPress,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Sponsors</Text>
    <View style={styles.rowsBlock}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.sponsorRow}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => onUploadPress(i)}
            activeOpacity={0.8}
          >
            <Image source={AppImages.upload} style={styles.uploadIconImage} />
            <Text style={styles.uploadBtnText}>UPLOAD SPONSOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.libraryBtn}
            onPress={() => onLibraryPress(i)}
            activeOpacity={0.8}
          >
            <Text style={styles.libraryBtnText}>LIBRARY</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  </View>
);

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
  rowsBlock: {
    gap: 8,
  },
  sponsorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 2,
    justifyContent: 'center',
  },
  uploadIconImage: {
    width: 14,
    height: 14,
  },
  uploadBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  libraryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
});

export default SponsorsUpload;