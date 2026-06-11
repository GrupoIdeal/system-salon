import React from 'react'
import { StyleSheet, KeyboardTypeOptions } from 'react-native'
import { TextInput as PaperTextInput } from 'react-native-paper'

interface TextInputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  error?: boolean
  helperText?: string
  secureTextEntry?: boolean
  multiline?: boolean
  keyboardType?: KeyboardTypeOptions
  accessibilityLabel?: string
  leftIcon?: string
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  error = false,
  helperText,
  secureTextEntry = false,
  multiline = false,
  keyboardType,
  accessibilityLabel,
  leftIcon,
}) => (
  <PaperTextInput
    label={label}
    value={value}
    onChangeText={onChangeText}
    error={error}
    secureTextEntry={secureTextEntry}
    multiline={multiline}
    keyboardType={keyboardType}
    accessibilityLabel={accessibilityLabel ?? label}
    mode="outlined"
    style={styles.input}
    left={leftIcon ? <PaperTextInput.Icon icon={leftIcon} /> : undefined}
  />
)

const styles = StyleSheet.create({
  input: {
    marginVertical: 4,
  },
})

export default TextInput
