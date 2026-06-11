import React, { useState } from 'react'
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text, useTheme, Button as PaperButton, Searchbar, Chip, Divider } from 'react-native-paper'
import { useLocalSearchParams, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { trpc } from '../../lib/trpc'
import PixQRCode from '../../components/PixQRCode'

type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'other'

type SelectedProduct = {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'other', label: 'Outros' },
]

export default function CheckoutScreen() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>()
  const theme = useTheme()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [productSearch, setProductSearch] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

  const appointmentQuery = trpc.appointments.get.useQuery({ id: appointmentId ?? '' }, { enabled: !!appointmentId })
  const salonQuery = trpc.salon.get.useQuery()
  const productsQuery = trpc.products.list.useQuery()
  const completeMutation = trpc.appointments.complete.useMutation()

  const filteredProducts = (productsQuery.data ?? []).filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addProduct = (product: { id: string; name: string; sellPrice: string | null }) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === product.id)
      if (existing) {
        return prev.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { id: product.id, name: product.name, quantity: 1, unitPrice: parseFloat(product.sellPrice ?? '0') }]
    })
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === productId)
      if (existing && existing.quantity > 1) {
        return prev.map(p =>
          p.id === productId ? { ...p, quantity: p.quantity - 1 } : p
        )
      }
      return prev.filter(p => p.id !== productId)
    })
  }

  const servicePrice = appointmentQuery.data?.service?.price
    ? parseFloat(String(appointmentQuery.data.service.price))
    : 0
  const productsTotal = selectedProducts.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
  const totalAmount = servicePrice + productsTotal

  const handleComplete = async () => {
    if (!appointmentId) return
    try {
      await completeMutation.mutateAsync({
        id: appointmentId,
        paymentMethod,
        amountPaid: totalAmount,
        products: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
      })
      router.back()
    } catch {
      // handled by mutation state
    }
  }

  if (appointmentQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  if (appointmentQuery.isError || !appointmentQuery.data) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={styles.errorText}>Erro ao carregar dados do agendamento</Text>
      </SafeAreaView>
    )
  }

  const appointment = appointmentQuery.data

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineSmall" style={styles.screenTitle}>Finalizar Atendimento</Text>

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Resumo do Serviço</Text>
          <View style={styles.summaryRow}>
            <Text variant="bodyLarge">{appointment.service?.name}</Text>
            <Text variant="bodyLarge">R$ {String(appointment.service?.price ?? '0')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Profissional</Text>
            <Text variant="bodyMedium">{appointment.specialist?.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium">Cliente</Text>
            <Text variant="bodyMedium">{appointment.client?.name}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Adicionar Produtos</Text>
          <Searchbar
            placeholder="Buscar produtos..."
            value={productSearch}
            onChangeText={setProductSearch}
            style={styles.searchbar}
          />
          {filteredProducts.length > 0 && (
            <View style={styles.productList}>
              {filteredProducts.map(product => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => addProduct(product)}
                  accessibilityLabel={`Adicionar produto ${product.name}`}
                >
                  <View style={styles.productInfo}>
                    <Text variant="bodyMedium">{product.name}</Text>
                    <Text variant="bodySmall">
                      R$ {product.sellPrice ?? '0'} | Estoque: {product.stock}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>+</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {selectedProducts.length > 0 && (
            <View style={styles.selectedProducts}>
              <Text variant="labelLarge" style={styles.selectedProductsTitle}>Produtos Selecionados</Text>
              {selectedProducts.map(product => (
                <View key={product.id} style={styles.selectedProductRow}>
                  <Text variant="bodyMedium" style={styles.selectedProductName}>{product.name}</Text>
                  <View style={styles.selectedProductActions}>
                    <Chip onPress={() => removeProduct(product.id)} style={styles.qtyChip}>
                      {product.quantity}x
                    </Chip>
                    <Text variant="bodyMedium">
                      R$ {(product.unitPrice * product.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map(method => {
              const isSelected = paymentMethod === method.value
              return (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                    },
                  ]}
                  onPress={() => setPaymentMethod(method.value)}
                  accessibilityLabel={`Selecionar pagamento ${method.label}`}
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: isSelected ? theme.colors.primary : theme.colors.onSurface }}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {paymentMethod === 'pix' && (
          <View style={[styles.section, styles.pixSection, { backgroundColor: theme.colors.surface }]}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Pagamento PIX</Text>
            <PixQRCode pixKey={salonQuery.data?.pixKey ?? ''} amount={totalAmount} />
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.totalRow}>
            <Text variant="titleMedium">Total</Text>
            <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: '700' }}>
              R$ {totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PaperButton
          mode="contained"
          onPress={handleComplete}
          loading={completeMutation.isPending}
          disabled={completeMutation.isPending}
          style={styles.completeButton}
        >
          Concluir Atendimento
        </PaperButton>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#b71c1c',
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  divider: {
    marginVertical: 8,
  },
  searchbar: {
    marginBottom: 8,
  },
  productList: {
    gap: 4,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  productInfo: {
    flex: 1,
  },
  selectedProducts: {
    marginTop: 12,
  },
  selectedProductsTitle: {
    marginBottom: 8,
  },
  selectedProductRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  selectedProductName: {
    flex: 1,
  },
  selectedProductActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyChip: {
    height: 32,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  pixSection: {
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
  },
  completeButton: {
    width: '100%',
    minHeight: 48,
  },
})
