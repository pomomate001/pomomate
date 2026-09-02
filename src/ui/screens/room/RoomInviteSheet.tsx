import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../theme';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { useFriendsStore } from '../../../state';

interface RoomInviteSheetProps {
  visible: boolean;
  onClose: () => void;
  onSystemShare: () => void;
  inviteCode: string;
}

export function RoomInviteSheet({ visible, onClose, onSystemShare, inviteCode }: RoomInviteSheetProps) {
  const colors = useColors();
  const friends = useFriendsStore((s: any) => s.friends);

  const handleInviteFriend = (friendId: string, friendName: string) => {
    // In a real app, this would send a push notification or in-app message
    Alert.alert('Başarılı', `${friendName} adlı arkadaşına davet gönderildi!`);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>Odaya Davet Et</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Uygulama içi arkadaşlarını tek tıkla davet et veya linki paylaş.
          </Text>
        </View>

        <Button
          title="Diğer Uygulamalarla Paylaş"
          variant="outline"
          icon={<Ionicons name="share-social-outline" size={20} color={colors.primary} />}
          onPress={() => {
            onSystemShare();
            onClose();
          }}
          style={styles.systemShareBtn}
        />

        <Text style={[typography.h4, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
          Arkadaşlarım
        </Text>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.friendItem, { borderBottomColor: colors.border }]}>
              <View style={styles.friendInfo}>
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
                  <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                    {item.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>
                  {item.displayName}
                </Text>
              </View>
              <Pressable
                style={[styles.inviteBtn, { backgroundColor: `${colors.primary}20` }]}
                onPress={() => handleInviteFriend(item.id, item.displayName)}
              >
                <Text style={[typography.captionBold, { color: colors.primary }]}>Davet Et</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textDisabled, textAlign: 'center', marginTop: spacing.md }]}>
              Henüz ekli arkadaşın yok.
            </Text>
          }
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    height: 400,
  },
  header: {
    marginBottom: spacing.md,
  },
  systemShareBtn: {
    marginBottom: spacing.lg,
  },
  list: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
});
