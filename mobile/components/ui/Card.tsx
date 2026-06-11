import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { Card as PaperCard } from 'react-native-paper'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  style?: ViewStyle
  accessibilityLabel?: string
}

const Card: React.FC<CardProps> = ({ children, onPress, style, accessibilityLabel }) => {
  const renderContent = () => <PaperCard.Content>{children}</PaperCard.Content>

  if (onPress) {
    return (
      <PaperCard
        onPress={onPress}
        style={[styles.card, style]}
        accessibilityLabel={accessibilityLabel}
      >
        {renderContent()}
      </PaperCard>
    )
  }

  return (
    <PaperCard style={[styles.card, style]} accessibilityLabel={accessibilityLabel}>
      {renderContent()}
    </PaperCard>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
})

export default Card
