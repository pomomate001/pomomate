import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColors } from '../theme';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const screenHeight = Dimensions.get('window').height;

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const colors = useColors();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              marginBottom: keyboardHeight,
              maxHeight: keyboardHeight > 0 ? screenHeight - keyboardHeight - 40 : '85%',
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
});
