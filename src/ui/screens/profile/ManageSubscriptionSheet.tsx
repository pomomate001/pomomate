import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../../components/BottomSheet';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { revenueCatService } from '../../../services/monetization/RevenueCatService';

import { useUserStore } from '../../../state';

interface ManageSubscriptionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ManageSubscriptionSheet({ visible, onClose }: ManageSubscriptionSheetProps) {
  const colors = useColors();
  const user = useUserStore((s) => s.user);
  
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState<string>('Pro Plan');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [isStoreSub, setIsStoreSub] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      loadSubscriptionDetails();
    }
  }, [visible, user]);

  const loadSubscriptionDetails = async () => {
    setLoading(true);
    const details = await revenueCatService.getSubscriptionDetails(user);
    if (details) {
      setPlanName(details.planName);
      setIsStoreSub(details.isStoreSubscription);
      if (details.expirationDate) {
        const dateObj = new Date(details.expirationDate);
        setExpirationDate(dateObj.toLocaleDateString());
      }
    }
    setLoading(false);
  };

  const [manageLoading, setManageLoading] = useState(false);

  const handleManage = async () => {
    try {
      setManageLoading(true);
      await revenueCatService.manageSubscriptions();
    } finally {
      setTimeout(() => setManageLoading(false), 800);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="star" size={28} color={colors.primary} />
          </View>
          <Text style={[typography.h3, { color: colors.textPrimary, marginTop: spacing.md }]}>
            Aktif Aboneliğiniz
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
            Pro plan avantajlarından faydalanıyorsunuz.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.detailRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Plan</Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{planName}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.detailRow}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>Yenilenme / Bitiş Tarihi</Text>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {expirationDate || 'Bilinmiyor'}
                </Text>
              </View>
            </View>

            {isStoreSub ? (
              <Pressable
                style={({ pressed }) => [
                  styles.manageBtn,
                  { backgroundColor: pressed ? `${colors.error}20` : `${colors.error}15` },
                  manageLoading && { opacity: 0.7 }
                ]}
                onPress={handleManage}
                disabled={manageLoading}
              >
                {manageLoading ? (
                  <ActivityIndicator size="small" color={colors.error} />
                ) : (
                  <>
                    <Ionicons name="open-outline" size={20} color={colors.error} />
                    <Text style={[typography.bodyBold, { color: colors.error, marginLeft: spacing.sm }]}>
                      Aboneliği Yönet / İptal Et
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <View style={[styles.giftNote, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
                <Ionicons name="gift-outline" size={18} color={colors.primary} style={{ marginRight: spacing.xs }} />
                <Text style={[typography.caption, { color: colors.primary, flex: 1 }]}>
                  Bu üyelik 3 arkadaşını davet ettiğin için hediye edilmiştir. Süre bitiminde otomatik sonlanacaktır.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  detailsContainer: {
    gap: spacing.lg,
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.xs,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  giftNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
