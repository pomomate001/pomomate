import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Modal,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  // PanResponder to handle swipe-down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          Keyboard.dismiss();
          onClose();
        }
      },
    }),
  ).current;

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
          {/* Draggable Handle Bar */}
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <Ionicons name="close-circle" size={24} color={colors.textDisabled} />
            </Pressable>
          </View>

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
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  dragArea: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 28,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 2,
  },
});
