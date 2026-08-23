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

interface PremiumPaywallSheetProps {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  'Reklamsız kesintisiz odaklanma',
  'Tüm özel arka plan animasyonları',
  'Özel çalışma odaları oluşturma',
  'Detaylı istatistik ve analizler',
];

export function PremiumPaywallSheet({ visible, onClose }: PremiumPaywallSheetProps) {
  const colors = useColors();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    setLoading(true);
    const pkgs = await revenueCatService.getOfferings();
    setPackages(pkgs);
    if (pkgs.length > 0) {
      setSelectedPackage(pkgs[0]); // Select first by default
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setPurchasing(true);
    const success = await revenueCatService.purchasePackage(selectedPackage);
    setPurchasing(false);
    
    if (success) {
      Alert.alert('Tebrikler!', 'PomoMate Pro özelliklerine başarıyla eriştiniz.', [
        { text: 'Tamam', onPress: onClose }
      ]);
    } else {
      Alert.alert('Hata', 'Satın alma işlemi başarısız oldu veya iptal edildi.');
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await revenueCatService.restorePurchases();
    setPurchasing(false);
    
    if (success) {
      Alert.alert('Başarılı', 'Önceki satın alımlarınız geri yüklendi.', [
        { text: 'Tamam', onPress: onClose }
      ]);
    } else {
      Alert.alert('Bilgi', 'Geri yüklenecek bir abonelik bulunamadı.');
    }
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
          PomoMate Pro
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs }]}>
          Potansiyelini maksimuma çıkar ve odaklanmanın keyfini sür!
        </Text>
      </View>

      <View style={styles.features}>
        {PREMIUM_FEATURES.map((feat, i) => (
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
            Paketler yükleniyor...
          </Text>
        </View>
      ) : (
        <View style={styles.packagesWrap}>
          {packages.length === 0 ? (
            <Text style={[typography.caption, { color: colors.error, textAlign: 'center' }]}>
              Aktif abonelik paketi bulunamadı. Lütfen daha sonra tekrar deneyin.
            </Text>
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
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
                      {pkg.product.title.replace('(PomoMate)', '').trim()}
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
          title={purchasing ? "İşleniyor..." : "Şimdi Başla"}
          onPress={handlePurchase}
          disabled={!selectedPackage || loading || purchasing}
          loading={purchasing}
        />
        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={[typography.captionBold, { color: colors.textSecondary }]}>
            Satın Alımları Geri Yükle
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
