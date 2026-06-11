import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

interface BadgeProps {
  text: string
  color?: string
  size?: number
}

const Badge: React.FC<BadgeProps> = ({ text, color = '#e53935', size = 20 }) => (
  <View
    style={[
      styles.badge,
      {
        backgroundColor: color,
        minWidth: size,
        height: size,
        borderRadius: size / 2,
      },
    ]}
    accessibilityLabel={`Badge: ${text}`}
  >
    <Text style={[styles.text, { fontSize: size * 0.55 }]} numberOfLines={1}>
      {text}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
})

export default Badge
