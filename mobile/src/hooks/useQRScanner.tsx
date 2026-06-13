import { useState } from 'react';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { StyleSheet } from 'react-native';

interface UseQRScannerProps {
  onScan?: (data: string) => void;
  autoFocus?: boolean;
}

export function useQRScanner({ onScan, autoFocus: _autoFocus = true }: UseQRScannerProps = {}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  const handleBarCodeScanned = ({ type: _type, data }: BarcodeScanningResult) => {
    if (!scanned && onScan) {
      setScanned(true);
      setScannedData(data);
      onScan(data);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData(null);
  };

  return {
    permission,
    requestPermission,
    scanned,
    scannedData,
    resetScanner,
    handleBarCodeScanned,
  };
}

// Componente de scanner QR Code reutilizável
export function QRScannerView({ onScan, autoFocus = true }: UseQRScannerProps) {
  const { permission, requestPermission, handleBarCodeScanned, scanned } = useQRScanner({
    onScan,
    autoFocus,
  });

  if (!permission) {
    return null; // Ou um componente de loading
  }

  if (!permission.granted) {
    return (
      <CameraView style={styles.container}>
        <BarcodeScannerFallback onRequestPermission={requestPermission} />
      </CameraView>
    );
  }

  return (
    <CameraView
      style={styles.container}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
      enableTorch={false}
      onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
    />
  );
}

// Fallback quando permissão não foi concedida
function BarcodeScannerFallback({ onRequestPermission: _onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <CameraView style={styles.container}>
      {/* UI customizada solicitando permissão */}
    </CameraView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
