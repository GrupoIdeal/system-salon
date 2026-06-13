import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  title,
  description,
  variant = 'default',
  style,
}: CardProps) {
  const cardStyles = [
    styles.card,
    styles[variant],
    style,
  ];

  return (
    <View style={cardStyles}>
      {(title || description) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  default: {
    // Sem sombra adicional
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
});

// Sub-componente para conteúdo do Card
export function CardContent({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

CardContent.styles = {
  content: {
    flex: 1,
  },
};

// Sub-componente para ações do Card
export function CardActions({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.actions, style]}>
      {children}
    </View>
  );
}

CardActions.styles = {
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
};
