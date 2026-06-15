import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook para navegação por voz usando Web Speech API
 * Comandos de voz disponíveis:
 * - "dashboard" ou "início" -> /dashboard
 * - "agenda" ou "agendamentos" -> /agendamentos
 * - "clientes" -> /clientes
 * - "serviços" -> /servicos
 * - "produtos" -> /produtos
 * - "ajuda" ou "libras" -> /ajuda-libras
 * - "sair" -> /login
 */
export function useVoiceNavigation() {
  const [, setLocation] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const VOICE_COMMANDS: Record<string, string> = {
    'dashboard': '/dashboard',
    'início': '/dashboard',
    'inicio': '/dashboard',
    'agenda': '/agendamentos',
    'agendamentos': '/agendamentos',
    'clientes': '/clientes',
    'serviços': '/servicos',
    'servicos': '/servicos',
    'produtos': '/produtos',
    'ajuda': '/ajuda-libras',
    'libras': '/ajuda-libras',
    'sair': '/login',
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('[VoiceNav] Web Speech API não suportada neste navegador');
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(text);
      const route = VOICE_COMMANDS[text];
      if (route) {
        setLocation(route);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    return () => {
      recognition.abort();
    };
  }, [setLocation]);

  const startListening = () => {
    if (!isSupported) return;
    setIsListening(true);
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.start();
    } catch (e) {
      console.error('[VoiceNav] Erro ao iniciar reconhecimento:', e);
    }
  };

  return { isListening, isSupported, startListening, transcript };
}
