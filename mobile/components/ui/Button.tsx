import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton, useTheme } from 'react-native-paper'
import { borderRadius } from '../../lib/theme'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'

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
  destructive: 'contained',
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

  const getButtonColor = () => {
    if (variant === 'secondary') return theme.colors.secondary
    if (variant === 'destructive') return theme.colors.error
    return undefined
  }

  const getTextColor = () => {
    if (variant === 'secondary') return theme.colors.onSecondary
    if (variant === 'destructive') return theme.colors.onError
    return undefined
  }

  return (
    <PaperButton
      mode={variantModeMap[variant]}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[fullWidth && styles.fullWidth, { borderRadius: borderRadius.lg }]}
      contentStyle={styles.content}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
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
    minHeight: 48,
    paddingVertical: 8,
  },
})

export default Button
