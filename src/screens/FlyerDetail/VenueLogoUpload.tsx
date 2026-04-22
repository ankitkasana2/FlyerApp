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

export interface VenueLogoUploadProps {
  onUploadPress: () => void;
  onChooseFromLibrary: () => void;
}

const VenueLogoUpload: React.FC<VenueLogoUploadProps> = ({
  onUploadPress,
  onChooseFromLibrary,
}) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Venue Logo</Text>
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={onUploadPress}
        activeOpacity={0.8}
      >
        <Image source={AppImages.upload} style={styles.uploadIconImage} />
        <Text style={styles.uploadBtnText}>UPLOAD LOGO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.libraryBtn}
        onPress={onChooseFromLibrary}
        activeOpacity={0.8}
      >
        <Text style={styles.libraryBtnText}>CHOOSE FROM LIBRARY</Text>
      </TouchableOpacity>
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
  buttonRow: {
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
    flex: 1,
    justifyContent: 'center',
  },
  uploadIconImage: {
    width: 16,
    height: 16,
  },
  uploadBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.black,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  libraryBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
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

export default VenueLogoUpload;