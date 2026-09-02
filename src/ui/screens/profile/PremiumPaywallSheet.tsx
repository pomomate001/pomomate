import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PurchasesPackage } from 'react-native-purchases';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { typography } from '../../theme/typography';
import { useColors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { revenueCatService } from '../../../services/monetization/RevenueCatService';
import { useTranslation } from '../../../i18n';
import { useUserStore, useSettingsStore } from '../../../state';

interface PremiumPaywallSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PremiumPaywallSheet({ visible, onClose }: PremiumPaywallSheetProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [prevVisible, setPrevVisible] = useState(false);

  const premiumFeatures = [
    t('premium.feature1'),
    t('premium.feature2'),
    t('premium.feature3'),
    t('premium.feature4'),
  ];

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      setLoading(true);
    }
  }

  useEffect(() => {
    let isMounted = true;
    if (visible) {
      revenueCatService.getOfferings().then((pkgs) => {
        if (!isMounted) return;
        setPackages(pkgs);
        if (pkgs.length > 0) {
          setSelectedPackage(pkgs[0]);
        }
        setLoading(false);
      }).catch(() => {
        if (isMounted) setLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [visible]);

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setPurchasing(true);
    const userId = useUserStore.getState().user?.id;
    const success = await revenueCatService.purchasePackage(selectedPackage, userId);
    setPurchasing(false);
    
    if (success) {
      useSettingsStore.getState().setIsPremium(true);
      if (userId) {
        useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
      }
      Alert.alert(t('premium.successTitle'), t('premium.successMessage'), [
        { text: t('common.ok'), onPress: onClose }
      ]);
    } else {
      Alert.alert(t('premium.errorTitle'), t('premium.errorMessage'));
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const userId = useUserStore.getState().user?.id;
    const success = await revenueCatService.restorePurchases(userId);
    setPurchasing(false);
    
    if (success) {
      useSettingsStore.getState().setIsPremium(true);
      if (userId) {
        useUserStore.getState().updateUser({ subscriptionTier: 'premium' });
      }
      Alert.alert(t('premium.restoreSuccessTitle'), t('premium.restoreSuccessMessage'), [
        { text: t('common.ok'), onPress: onClose }
      ]);
    } else {
      Alert.alert(t('premium.restoreNotFoundTitle'), t('premium.restoreNotFoundMessage'));
    }
  };

  const getPackageTitle = (pkg: PurchasesPackage, index: number): string => {
    const id = (pkg.identifier + ' ' + pkg.product.identifier).toLowerCase();
    if (pkg.packageType === 'MONTHLY' || id.includes('monthly') || id.includes('month')) {
      return 'PomoMate Pro Monthly';
    }
    if (pkg.packageType === 'ANNUAL' || id.includes('yearly') || id.includes('annual') || id.includes('year')) {
      return 'PomoMate Pro Yearly';
    }
    if (index === 0) return 'PomoMate Pro Monthly';
    if (index === 1) return 'PomoMate Pro Yearly';
    return pkg.product.title.replace(/\s*\(.*?\)\s*/g, '').trim() || 'PomoMate Pro';
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="star" size={32} color="#fff" />
        </View>
        <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
          {t('premium.title')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {t('premium.subtitle')}
        </Text>
      </View>

      <View style={styles.features}>
        {premiumFeatures.map((feat, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
              {feat}
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {t('premium.loadingPackages')}
          </Text>
        </View>
      ) : (
        <View style={styles.packagesWrap}>
          {packages.length === 0 ? (
            <Text style={[typography.caption, { color: colors.error, textAlign: 'center' }]}>
              {t('premium.noPackages')}
            </Text>
          ) : (
            packages.map((pkg, index) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const title = getPackageTitle(pkg, index);
              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => setSelectedPackage(pkg)}
                  style={[
                    styles.packageCard,
                    { 
                      backgroundColor: colors.surface, 
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1 
                    }
                  ]}
                >
                  <View style={styles.pkgInfo}>
                    <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                      {title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {pkg.product.description}
                    </Text>
                  </View>
                  <Text style={[typography.h3, { color: colors.primary }]}>
                    {pkg.product.priceString}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={purchasing ? t('premium.processing') : t('premium.startNow')}
          onPress={handlePurchase}
          disabled={!selectedPackage || loading || purchasing}
          loading={purchasing}
        />
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
            {t('premium.restorePurchases')}
          </Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  features: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  packagesWrap: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  pkgInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
  restoreBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
});
