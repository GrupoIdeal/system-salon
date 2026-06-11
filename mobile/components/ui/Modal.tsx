import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Modal as PaperModal, Portal, Text, useTheme } from 'react-native-paper'

interface ModalProps {
  visible: boolean
  onDismiss: () => void
  title?: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ visible, onDismiss, title, children }) => {
  const theme = useTheme()

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.surface },
        ]}
        accessibilityLabel={title}
      >
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.content}>{children}</View>
      </PaperModal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  content: {
    gap: 8,
  },
})

export default Modal
