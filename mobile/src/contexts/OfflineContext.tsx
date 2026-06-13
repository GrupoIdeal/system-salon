import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OfflineContextType {
  isOnline: boolean;
  queue: QueuedAction[];
  addToQueue: (action: QueuedAction) => Promise<void>;
  processQueue: () => Promise<void>;
}

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const QUEUE_KEY = '@salon:offline_queue';

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Verificar status inicial da conexão
    NetInfo.fetch().then(state => {
      setIsOnline(!!state.isConnected);
    });

    // Ouvir mudanças na conexão
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = isOnline;
      setIsOnline(!!state.isConnected);
      
      // Quando voltar online, processar fila
      if (!wasOnline && state.isConnected) {
        processQueue();
      }
    });

    // Carregar fila do armazenamento local
    loadQueue();

    return () => unsubscribe();
  }, []);

  const loadQueue = async () => {
    try {
      const savedQueue = await AsyncStorage.getItem(QUEUE_KEY);
      if (savedQueue) {
        setQueue(JSON.parse(savedQueue));
      }
    } catch (error) {
      console.error('Erro ao carregar fila offline:', error);
    }
  };

  const saveQueue = async (newQueue: QueuedAction[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Erro ao salvar fila offline:', error);
    }
  };

  const addToQueue = async (action: QueuedAction) => {
    const newQueue = [...queue, action];
    setQueue(newQueue);
    await saveQueue(newQueue);
  };

  const processQueue = async () => {
    if (!isOnline || queue.length === 0) return;

    const remainingQueue: QueuedAction[] = [];

    for (const action of queue) {
      try {
        // Aqui você implementaria a lógica para reenviar cada tipo de ação
        // Exemplo: sincronizar com a API quando estiver online
        console.log('Processando ação da fila:', action.type);
        
        // Se sucesso, não adiciona à fila restante
        // Se falhar, incrementa retryCount e adiciona de volta
      } catch (error) {
        console.error('Erro ao processar ação:', error);
        if (action.retryCount < 3) {
          remainingQueue.push({
            ...action,
            retryCount: action.retryCount + 1,
          });
        }
      }
    }

    setQueue(remainingQueue);
    await saveQueue(remainingQueue);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        queue,
        addToQueue,
        processQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
