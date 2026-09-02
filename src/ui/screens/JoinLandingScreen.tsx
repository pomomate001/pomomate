import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface TargetInfo {
  type: 'friend' | 'room' | 'none';
  code: string;
}

function getInitialTarget(): TargetInfo {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return { type: 'none', code: '' };
  }
  const params = new URLSearchParams(window.location.search);
  const friendCode = params.get('friend');
  const roomCode = params.get('room');
  if (friendCode) return { type: 'friend', code: friendCode };
  if (roomCode) return { type: 'room', code: roomCode };
  return { type: 'none', code: '' };
}

export function JoinLandingScreen() {
  const [copied, setCopied] = useState(false);
  const [targetInfo] = useState<TargetInfo>(getInitialTarget);

  const { type: targetType, code } = targetInfo;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Attempt auto redirect to native app
    const appUrl = `pomomate://join${window.location.search}`;
    const timer = setTimeout(() => {
      window.location.href = appUrl;
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenApp = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `pomomate://join${window.location.search}`;
    }
  };

  const handleOpenStore = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://play.google.com/store/apps/details?id=com.pomomate.app';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="timer" size={48} color="#A855F7" />
        </View>

        <Text style={styles.title}>PomoMate</Text>
        <Text style={styles.subtitle}>
          {targetType === 'friend'
            ? "Bir arkadaşın seni PomoMate'de birlikte çalışmaya davet etti!"
            : targetType === 'room'
            ? 'Bir çalışma odasına katılmaya davet edildin!'
            : 'PomoMate ile birlikte odaklanın!'}
        </Text>

        {code ? (
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>
              {targetType === 'friend' ? 'ARKADAŞLIK KODU' : 'ODA KODU'}
            </Text>
            <Text style={styles.codeText} selectable>
              {code}
            </Text>
            <Pressable style={styles.copyButton} onPress={handleCopy}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={18}
                color="#FFF"
              />
              <Text style={styles.copyButtonText}>
                {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.primaryButton} onPress={handleOpenApp}>
          <Ionicons name="open-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Uygulamada Aç</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={handleOpenStore}>
          <Ionicons name="logo-google-playstore" size={18} color="#A855F7" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>Google Play&apos;den İndir</Text>
        </Pressable>

        <Text style={styles.hint}>
          Uygulama telefonunuzda yüklüyse otomatik olarak açılacaktır.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 32,
    maxWidth: 420,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  codeContainer: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A855F7',
    marginBottom: 12,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A855F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  copyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A855F7',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#A855F7',
    fontWeight: '600',
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
  },
});
