import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, ScrollView } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { LeaderboardShareCard } from './LeaderboardShareCard';
import { useTranslation } from '../../../i18n';
import type { LeaderboardEntry } from './LeaderboardPodium';

interface LeaderboardShareModalProps {
  visible: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  periodLabel: string;
}

export function LeaderboardShareModal({
  visible,
  onClose,
  entries,
  currentUserEntry,
  periodLabel,
}: LeaderboardShareModalProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const viewShotRef = useRef<any>(null);
  const [scaleAnim] = useState(() => new Animated.Value(0.85));
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [isSharing, setIsSharing] = useState(false);

  // Entrance animation
  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('friends.shareModalTitle'),
        });
      }
    } catch (error) {
      console.warn('[LeaderboardShare] Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  }, [t, isSharing]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* The renderable share card */}
            <LeaderboardShareCard
              ref={viewShotRef}
              entries={entries}
              currentUserEntry={currentUserEntry}
              periodLabel={periodLabel}
            />

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable
                onPress={handleShare}
                disabled={isSharing}
                style={({ pressed }) => [
                  styles.shareBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                  isSharing && { opacity: 0.6 },
                ]}
              >
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>
                  {isSharing ? t('common.loading') : t('friends.shareBtn')}
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  { borderColor: 'rgba(255, 255, 255, 0.25)' },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.closeBtnText}>{t('friends.closeBtn')}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 390,
  },
  actions: {
    marginTop: 16,
    gap: 10,
    width: '100%',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  closeBtnText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
    fontWeight: '600',
  },
});
