import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: Location.Address | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    loading: false,
    error: null,
  });

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Verificar permissão
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setLocationState(prev => ({
          ...prev,
          loading: false,
          error: 'Permissão de localização não concedida',
        }));
        return null;
      }

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });

      // Obter endereço reverso
      let address: Location.Address | null = null;
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (addresses.length > 0) {
          address = addresses[0];
        }
      } catch (error) {
        console.warn('Não foi possível obter endereço:', error);
      }

      setLocationState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        address,
        loading: false,
        error: null,
      });

      return location;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setLocationState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return null;
    }
  };

  const watchLocation = (
    callback: (location: Location.LocationObject) => void,
    options?: Location.LocationOptions
  ) => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setLocationState(prev => ({
          ...prev,
          error: 'Permissão de localização não concedida',
        }));
        return;
      }

      subscription = await Location.watchPositionAsync(
        options || {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        callback
      );
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  };

  const clearLocation = () => {
    setLocationState({
      latitude: null,
      longitude: null,
      accuracy: null,
      address: null,
      loading: false,
      error: null,
    });
  };

  return {
    ...locationState,
    getCurrentLocation,
    watchLocation,
    clearLocation,
    requestPermission,
  };
}

// Utilitário para calcular distância entre duas coordenadas (fórmula de Haversine)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância em km
}
