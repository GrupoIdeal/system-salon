import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native'
import { Text, useTheme, SegmentedButtons } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

type TabKey = 'alphabet' | 'numbers' | 'phrases'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'alphabet', label: 'Alfabeto' },
  { key: 'numbers', label: 'Números' },
  { key: 'phrases', label: 'Frases' },
]

const ALPHABET = [
  { letter: 'A', description: 'Mão fechada com o polegar estendido para o lado' },
  { letter: 'B', description: 'Mão aberta com os dedos juntos e o polegar na palma' },
  { letter: 'C', description: 'Mão formando um C' },
  { letter: 'D', description: 'Mão com o indicador estendido e os demais fechados' },
  { letter: 'E', description: 'Mão com os dedos curvados e o polegar sobre eles' },
  { letter: 'F', description: 'Mão com indicador e polegar formando um círculo' },
  { letter: 'G', description: 'Mão fechada com o indicador estendido para frente' },
  { letter: 'H', description: 'Mão com indicador e médio estendidos lado a lado' },
  { letter: 'I', description: 'Mão fechada com o dedo mínimo estendido' },
  { letter: 'J', description: 'Mão fechada com o mínimo estendido, fazendo um movimento' },
  { letter: 'K', description: 'Mão com indicador e médio estendidos em V' },
  { letter: 'L', description: 'Mão formando um L com indicador e polegar' },
  { letter: 'M', description: 'Mão fechada com indicador, médio e anelar sobre o polegar' },
  { letter: 'N', description: 'Mão fechada com indicador e médio sobre o polegar' },
  { letter: 'O', description: 'Mão formando um O' },
  { letter: 'P', description: 'Mão com indicador e médio estendidos para baixo' },
  { letter: 'Q', description: 'Mão em forma de pinça para baixo' },
  { letter: 'R', description: 'Mão com indicador e médio cruzados' },
  { letter: 'S', description: 'Mão fechada com o polegar sobre os dedos' },
  { letter: 'T', description: 'Mão fechada com o polegar entre indicador e médio' },
  { letter: 'U', description: 'Mão com indicador e médio estendidos unidos' },
  { letter: 'V', description: 'Mão com indicador e médio estendidos em V' },
  { letter: 'W', description: 'Mão com indicador, médio e anelar estendidos' },
  { letter: 'X', description: 'Mão fechada com indicador curvado' },
  { letter: 'Y', description: 'Mão com o polegar e mínimo estendidos' },
  { letter: 'Z', description: 'Indicador traçando um Z no ar' },
]

const NUMBERS = [
  { number: '0', description: 'Mão fechada com o polegar sobre os dedos' },
  { number: '1', description: 'Indicador estendido para cima' },
  { number: '2', description: 'Indicador e médio estendidos' },
  { number: '3', description: 'Indicador, médio e anelar estendidos' },
  { number: '4', description: 'Quatro dedos estendidos (polegar fechado)' },
  { number: '5', description: 'Mão aberta com todos os dedos estendidos' },
  { number: '6', description: 'Mão aberta com polegar e mínimo se tocando' },
  { number: '7', description: 'Mão aberta com polegar tocando a ponta do anelar' },
  { number: '8', description: 'Mão aberta com polegar tocando a ponta do médio' },
  { number: '9', description: 'Mão aberta com polegar tocando a ponta do indicador' },
]

const PHRASES = [
  { phrase: 'Bom dia', description: 'Mão aberta próxima ao rosto, movendo para frente' },
  { phrase: 'Boa tarde', description: 'Mão aberta do rosto para o lado' },
  { phrase: 'Boa noite', description: 'Mãos abertas descendo do rosto' },
  { phrase: 'Olá / Oi', description: 'Mão aberta com aceno' },
  { phrase: 'Tudo bem?', description: 'Mãos abertas, palmas para cima, balançando' },
  { phrase: 'Obrigado', description: 'Mão aberta no queixo movendo para frente' },
  { phrase: 'Por favor', description: 'Mão aberta circulando o peito' },
  { phrase: 'Desculpa', description: 'Mão fechada esfregando o peito' },
  { phrase: 'Sim', description: 'Mão fechada balançando para cima e para baixo' },
  { phrase: 'Não', description: 'Mão fechada balançando para os lados' },
  { phrase: 'Quanto custa?', description: 'Mãos fazendo gesto de dinheiro' },
  { phrase: 'Qual seu nome?', description: 'Indicador tocando o queixo' },
  { phrase: 'Prazer em conhecer', description: 'Mãos abertas se encontrando' },
  { phrase: 'Preciso de ajuda', description: 'Mão aberta no peito e depois mão estendida' },
  { phrase: 'Onde é o banheiro?', description: 'Indicador fazendo sinal de interrogação' },
  { phrase: 'Entendi', description: 'Mão fechada com indicador estendido tocando a testa' },
  { phrase: 'Não entendi', description: 'Mão fechada balançando perto da cabeça' },
  { phrase: 'Pode repetir?', description: 'Mãos abertas girando uma em torno da outra' },
  { phrase: 'Devagar', description: 'Mãos abertas descendo devagar' },
  { phrase: 'Parabéns', description: 'Mãos batendo palmas' },
]

export default function AjudaLibrasScreen() {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabKey>('alphabet')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alphabet':
        return (
          <View style={styles.grid}>
            {ALPHABET.map(item => (
              <View
                key={item.letter}
                style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
              >
                <Text variant="headlineMedium" style={[styles.itemSymbol, { color: theme.colors.primary }]}>
                  {item.letter}
                </Text>
                <Text variant="bodySmall" style={styles.itemDescription}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        )
      case 'numbers':
        return (
          <View style={styles.grid}>
            {NUMBERS.map(item => (
              <View
                key={item.number}
                style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
              >
                <Text variant="headlineMedium" style={[styles.itemSymbol, { color: theme.colors.primary }]}>
                  {item.number}
                </Text>
                <Text variant="bodySmall" style={styles.itemDescription}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        )
      case 'phrases':
        return (
          <View style={styles.list}>
            {PHRASES.map(item => (
              <View
                key={item.phrase}
                style={[styles.phraseCard, { backgroundColor: theme.colors.surface }]}
              >
                <Text variant="titleMedium" style={styles.phraseText}>
                  {item.phrase}
                </Text>
                <Text variant="bodySmall" style={styles.phraseDescription}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        )
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={styles.title}>Central de Ajuda - Libras</Text>

      <SegmentedButtons
        value={activeTab}
        onValueChange={value => setActiveTab(value as TabKey)}
        buttons={TABS.map(tab => ({ value: tab.key, label: tab.label }))}
        style={styles.tabs}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    padding: 16,
    paddingBottom: 8,
  },
  tabs: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemCard: {
    width: '30%',
    flexGrow: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  itemSymbol: {
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDescription: {
    textAlign: 'center',
  },
  list: {
    gap: 8,
  },
  phraseCard: {
    borderRadius: 8,
    padding: 16,
  },
  phraseText: {
    fontWeight: '600',
    marginBottom: 4,
  },
  phraseDescription: {
    opacity: 0.8,
  },
})
