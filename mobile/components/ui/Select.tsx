import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableRipple,
  FlatList,
} from 'react-native'
import { TextInput, Text, Modal, Portal, useTheme } from 'react-native-paper'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  error?: boolean
  accessibilityLabel?: string
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onValueChange,
  options,
  error = false,
  accessibilityLabel,
}) => {
  const [visible, setVisible] = useState(false)
  const theme = useTheme()

  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? ''

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setVisible(false)
  }

  return (
    <View style={styles.container}>
      <TouchableRipple
        onPress={() => setVisible(true)}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityRole="button"
      >
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={selectedLabel}
            error={error}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="menu-down" />}
            style={styles.input}
          />
        </View>
      </TouchableRipple>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableRipple
                onPress={() => handleSelect(item.value)}
                style={[
                  styles.option,
                  item.value === value && {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    item.value === value && { color: theme.colors.primary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableRipple>
            )}
          />
        </Modal>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  input: {
    marginVertical: 0,
  },
  modalContent: {
    margin: 20,
    borderRadius: 8,
    maxHeight: 400,
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
})

export default Select
