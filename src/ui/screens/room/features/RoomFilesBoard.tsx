import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../../theme';
import { typography } from '../../../theme/typography';
import { spacing } from '../../../theme/spacing';
import { radius } from '../../../theme/radius';
import { useRoomStore } from '../../../../state';

export function RoomFilesBoard({ isHost, onPickFile }: { isHost: boolean; onPickFile: () => void }) {
  const colors = useColors();
  const sharedFiles = useRoomStore((s: any) => s.sharedFiles);
  const activeSharedFileId = useRoomStore((s: any) => s.activeSharedFileId);
  const setActiveSharedFileId = useRoomStore((s: any) => s.setActiveSharedFileId);
  const removeSharedFile = useRoomStore((s: any) => s.removeSharedFile);
  const roomSettings = useRoomStore((s: any) => s.roomSettings);
  
  const canUpload = isHost || roomSettings.allowFiles;

  return (
    <View style={styles.container}>
      {sharedFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={48} color={colors.textDisabled} />
          <Text style={[typography.body, { color: colors.textDisabled, marginTop: spacing.md, textAlign: 'center' }]}>
            Henüz paylaşılan bir dosya yok.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {sharedFiles.map((file: any) => {
            const isActive = file.id === activeSharedFileId;
            const isImage = file.fileType.startsWith('image');
            
            return (
              <Pressable 
                key={file.id}
                style={[
                  styles.fileCard, 
                  { 
                    backgroundColor: colors.surfaceVariant,
                    borderColor: isActive ? colors.primary : 'transparent',
                    borderWidth: 2,
                  }
                ]}
                onPress={() => setActiveSharedFileId(file.id)}
              >
                <View style={styles.previewContainer}>
                  {isImage ? (
                    <Image source={{ uri: file.uri }} style={styles.previewImage} />
                  ) : (
                    <Ionicons name="document-text" size={32} color={colors.textSecondary} />
                  )}
                </View>
                <View style={styles.infoContainer}>
                  <Text style={[typography.captionBold, { color: colors.textPrimary }]} numberOfLines={1}>
                    {file.fileName}
                  </Text>
                </View>
                
                {(isHost || roomSettings.allowFiles) && (
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => removeSharedFile(file.id)}
                    hitSlop={12}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </Pressable>
                )}
                
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={{ fontSize: 9, color: '#FFF', fontWeight: 'bold' }}>AÇIK</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {canUpload && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={onPickFile}
        >
          <Ionicons name="add" size={28} color="#FFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fileCard: {
    width: '48%',
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  previewContainer: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: spacing.sm,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 40,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  }
});
