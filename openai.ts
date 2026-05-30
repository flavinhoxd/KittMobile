import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import PulsingOrb from '@/components/PulsingOrb';
import { transcribeAudio, chatWithKITT, textToSpeech } from '@/services/openai';

const { width } = Dimensions.get('window');

type AppState = 'idle' | 'recording' | 'processing' | 'speaking' | 'done' | 'error';

interface ConversationEntry {
  userText: string;
  kittText: string;
}

export default function KITTScreen() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [conversation, setConversation] = useState<ConversationEntry | null>(null);
  const [statusMessage, setStatusMessage] = useState('SISTEMAS PRONTOS');
  const [errorMessage, setErrorMessage] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setErrorMessage('Gravação de áudio não disponível no navegador. Use o app mobile.');
      setAppState('error');
      return false;
    }
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      setErrorMessage('Permissão de microfone negada. Acesse as configurações para habilitar.');
      setAppState('error');
      return false;
    }
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setAppState('recording');
      setStatusMessage('CANAL ABERTO — FALE AGORA');
      setConversation(null);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Falha ao iniciar gravação. Verifique as permissões.');
      setAppState('error');
    }
  }, [requestPermissions]);

  const stopRecordingAndProcess = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      setAppState('processing');
      setStatusMessage('ANALISANDO SOLICITAÇÃO...');

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('URI de áudio inválida');

      setStatusMessage('TRANSCREVENDO DADOS VOCAIS...');
      const userText = await transcribeAudio(uri);

      setStatusMessage('PROCESSANDO RESPOSTA...');
      const kittReply = await chatWithKITT(userText);

      setStatusMessage('SINTETIZANDO VOZ...');
      const audioDataUri = await textToSpeech(kittReply);

      setConversation({ userText, kittText: kittReply });

      // Play TTS audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setAppState('speaking');
      setStatusMessage('TRANSMITINDO...');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Write base64 to a temp file and play it
      const base64Data = audioDataUri.replace('data:audio/mp3;base64,', '');
      const tmpPath = `${FileSystem.cacheDirectory}kitt_response_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(tmpPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: tmpPath },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setAppState('done');
          setStatusMessage('TRANSMISSÃO CONCLUÍDA');
        }
      });

      // Clean up temp file after a delay
      setTimeout(() => {
        FileSystem.deleteAsync(tmpPath, { idempotent: true });
      }, 30000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setErrorMessage(`FALHA NO SISTEMA: ${message}`);
      setAppState('error');
      setStatusMessage('ERRO DE SISTEMA');
    }
  }, []);

  const handleMainButton = useCallback(() => {
    if (appState === 'idle' || appState === 'done' || appState === 'error') {
      startRecording();
    } else if (appState === 'recording') {
      stopRecordingAndProcess();
    }
  }, [appState, startRecording, stopRecordingAndProcess]);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setConversation(null);
    setStatusMessage('SISTEMAS PRONTOS');
    setErrorMessage('');
  }, []);

  const orbState = appState === 'done' || appState === 'error' ? 'idle' : appState;

  const mainButtonLabel = {
    idle: 'FALAR COM KITT',
    recording: 'GRAVANDO... TOQUE PARA PARAR',
    processing: 'PROCESSANDO...',
    speaking: 'KITT RESPONDENDO...',
    done: 'FALAR NOVAMENTE',
    error: 'TENTAR NOVAMENTE',
  }[appState];

  const isButtonDisabled = appState === 'processing' || appState === 'speaking';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLine} />
          <Text style={styles.headerTitle}>K.I.T.T.</Text>
          <View style={styles.headerLine} />
        </View>

        <Text style={styles.subtitle}>KNIGHT INDUSTRIES TWO THOUSAND</Text>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>

        {/* Orb container */}
        <View style={styles.orbContainer}>
          <PulsingOrb state={orbState} />
          <Text style={styles.onlineLabel}>KITT ONLINE</Text>
        </View>

        {/* Scanline decoration */}
        <View style={styles.scanlineRow}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={[styles.scanline, i % 2 === 0 && styles.scanlineBright]} />
          ))}
        </View>

        {/* Main button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            appState === 'recording' && styles.mainButtonRecording,
            isButtonDisabled && styles.mainButtonDisabled,
          ]}
          onPress={handleMainButton}
          disabled={isButtonDisabled}
          activeOpacity={0.75}
        >
          {isButtonDisabled ? (
            <ActivityIndicator color="#FF0000" size="small" style={styles.buttonSpinner} />
          ) : null}
          <Text
            style={[
              styles.mainButtonText,
              appState === 'recording' && styles.mainButtonTextRecording,
            ]}
          >
            {mainButtonLabel}
          </Text>
        </TouchableOpacity>

        {/* Error message */}
        {appState === 'error' && errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorLabel}>[ ERRO DE SISTEMA ]</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Conversation card */}
        {conversation ? (
          <View style={styles.conversationCard}>
            <View style={styles.conversationSection}>
              <Text style={styles.conversationLabel}>[ ENTRADA VOCAL ]</Text>
              <Text style={styles.conversationUserText}>{conversation.userText}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.conversationSection}>
              <Text style={styles.conversationLabel}>[ RESPOSTA KITT ]</Text>
              <Text style={styles.conversationKITTText}>{conversation.kittText}</Text>
            </View>

            {appState === 'done' ? (
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>NOVA SESSÃO</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SISTEMA DE IA AVANÇADO v2.0</Text>
          <View style={styles.footerDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.footerDot,
                  i === 2 && styles.footerDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RED = '#CC0000';
const RED_BRIGHT = '#FF2222';
const RED_DIM = '#660000';
const RED_GLOW = 'rgba(200,0,0,0.15)';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: RED,
    opacity: 0.6,
  },
  headerTitle: {
    fontFamily: 'Orbitron-Black',
    fontSize: 32,
    color: RED_BRIGHT,
    letterSpacing: 12,
    paddingHorizontal: 16,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 9,
    color: '#AA3333',
    letterSpacing: 4,
    marginBottom: 20,
  },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100,0,0,0.2)',
    borderWidth: 1,
    borderColor: RED_DIM,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 32,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: RED_BRIGHT,
    marginRight: 10,
    shadowColor: RED_BRIGHT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 10,
    color: RED_BRIGHT,
    letterSpacing: 2,
  },

  // Orb
  orbContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  onlineLabel: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 11,
    color: RED_BRIGHT,
    letterSpacing: 6,
    marginTop: 12,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // Scanlines
  scanlineRow: {
    flexDirection: 'row',
    width: '60%',
    height: 3,
    marginVertical: 24,
    gap: 6,
  },
  scanline: {
    flex: 1,
    height: 1,
    backgroundColor: RED_DIM,
    alignSelf: 'center',
  },
  scanlineBright: {
    backgroundColor: RED,
    height: 3,
  },

  // Main button
  mainButton: {
    width: '100%',
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: RED,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: RED_GLOW,
    marginBottom: 24,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  mainButtonRecording: {
    borderColor: RED_BRIGHT,
    backgroundColor: 'rgba(200,0,0,0.25)',
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  mainButtonDisabled: {
    borderColor: RED_DIM,
    backgroundColor: 'rgba(60,0,0,0.2)',
    shadowOpacity: 0.2,
  },
  buttonSpinner: {
    marginRight: 10,
  },
  mainButtonText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 13,
    color: RED_BRIGHT,
    letterSpacing: 3,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  mainButtonTextRecording: {
    color: '#FF4444',
  },

  // Error card
  errorCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#880000',
    borderRadius: 4,
    backgroundColor: 'rgba(80,0,0,0.3)',
    padding: 16,
    marginBottom: 20,
  },
  errorLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 9,
    color: '#FF6666',
    letterSpacing: 2,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 11,
    color: '#FF4444',
    lineHeight: 18,
  },

  // Conversation card
  conversationCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: RED_DIM,
    borderRadius: 4,
    backgroundColor: 'rgba(30,0,0,0.6)',
    padding: 20,
    marginBottom: 24,
  },
  conversationSection: {
    paddingVertical: 4,
  },
  conversationLabel: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 9,
    color: '#AA3333',
    letterSpacing: 2,
    marginBottom: 10,
  },
  conversationUserText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  conversationKITTText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 12,
    color: RED_BRIGHT,
    lineHeight: 20,
    textShadowColor: RED,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: RED_DIM,
    marginVertical: 16,
    opacity: 0.5,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: RED_DIM,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  resetButtonText: {
    fontFamily: 'Orbitron-Bold',
    fontSize: 10,
    color: '#AA3333',
    letterSpacing: 3,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
  },
  footerText: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 8,
    color: '#440000',
    letterSpacing: 2,
    marginBottom: 10,
  },
  footerDots: {
    flexDirection: 'row',
    gap: 8,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RED_DIM,
  },
  footerDotActive: {
    backgroundColor: RED,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
