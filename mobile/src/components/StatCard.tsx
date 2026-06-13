import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '@/utils/colors';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export function StatCard({ title, value, icon, trend, onPress }: StatCardProps) {
  const cardContent = (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${Colors.primary}20`}]}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        {trend && (
          <View style={[
            styles.trendBadge,
            trend.isPositive ? styles.trendPositive : styles.trendNegative,
          ]}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? Colors.success : Colors.destructive}
            />
            <Text style={[
              styles.trendText,
              trend.isPositive ? styles.trendPositiveText : styles.trendNegativeText,
            ]}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Text>
          </View>
        )}
      </View>
      
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendPositive: {
    backgroundColor: `${Colors.success}15`,
  },
  trendNegative: {
    backgroundColor: `${Colors.destructive}15`,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  trendPositiveText: {
    color: Colors.success,
  },
  trendNegativeText: {
    color: Colors.destructive,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
});
