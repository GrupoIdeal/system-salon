import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

// Configurar comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationService {
  requestPermissions: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  scheduleLocalNotification: (title: string, body: string, data?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

class PushNotificationServiceImpl implements PushNotificationService {
  private expoPushToken: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      }
      
      return existingStatus === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
      return false;
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Solicitar permissões
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Permissão de notificação não concedida');
        return null;
      }

      // Obter token do Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      this.expoPushToken = tokenData.data;

      // Registrar token no backend
      if (this.expoPushToken) {
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        await api.notifications.registerToken(this.expoPushToken, platform);
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Erro ao registrar notificações push:', error);
      return null;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Notificação imediata
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const pushNotificationService = new PushNotificationServiceImpl();

// Hook para gerenciar notificações
export function usePushNotifications() {
  const register = async () => {
    return await pushNotificationService.registerForPushNotifications();
  };

  const sendLocal = async (title: string, body: string, data?: any) => {
    return await pushNotificationService.scheduleLocalNotification(title, body, data);
  };

  return {
    register,
    sendLocal,
  };
}
