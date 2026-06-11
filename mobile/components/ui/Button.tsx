import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton, useTheme } from 'react-native-paper'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  icon?: string
  accessibilityLabel?: string
  fullWidth?: boolean
}

const variantModeMap: Record<ButtonVariant, 'contained' | 'outlined' | 'text'> = {
  primary: 'contained',
  secondary: 'contained',
  outline: 'outlined',
  ghost: 'text',
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const theme = useTheme()

  const isSecondary = variant === 'secondary'

  return (
    <PaperButton
      mode={variantModeMap[variant]}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[fullWidth && styles.fullWidth]}
      contentStyle={styles.content}
      buttonColor={isSecondary ? theme.colors.secondary : undefined}
      textColor={isSecondary ? theme.colors.onSecondary : undefined}
    >
      {title}
    </PaperButton>
  )
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  content: {
    minHeight: 44,
  },
})

export default Button
