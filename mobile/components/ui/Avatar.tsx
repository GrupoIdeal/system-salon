import React from 'react'
import { StyleSheet } from 'react-native'
import { Avatar as PaperAvatar, useTheme } from 'react-native-paper'

interface AvatarProps {
  source?: { uri: string }
  name?: string
  size?: number
}

const Avatar: React.FC<AvatarProps> = ({ source, name, size = 48 }) => {
  const theme = useTheme()

  if (source) {
    return (
      <PaperAvatar.Image
        source={source}
        size={size}
        style={styles.avatar}
        accessibilityLabel="Avatar image"
      />
    )
  }

  const initials = name
    ? name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('')
    : '?'

  return (
    <PaperAvatar.Text
      label={initials}
      size={size}
      style={styles.avatar}
      color={theme.colors.onPrimaryContainer}
      accessibilityLabel={`Avatar for ${name ?? 'unknown'}`}
    />
  )
}

const styles = StyleSheet.create({
  avatar: {
    margin: 2,
  },
})

export default Avatar
