<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="row items-center q-col-gutter-md">
              <div class="col">
                <h2 class="text-h5 q-mb-sm">Detalle de Cotización</h2>
                <div class="text-subtitle2 text-grey-7">Resumen de la cotización seleccionada</div>
              </div>
              <div class="col-auto">
                <q-btn flat icon="arrow_back" label="Volver" @click="router.back()" />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div v-if="loading" class="row justify-center q-pa-md">
              <q-spinner-dots color="primary" size="48px" />
            </div>

            <div v-else-if="quote">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <h6 class="text-subtitle1">Cliente</h6>
                  <div>{{ quote.customer.firstName }} {{ quote.customer.lastName }}</div>
                  <div class="text-caption">DNI: {{ quote.customer.dni }}</div>
                  <div class="text-caption">Email: {{ quote.customer.email }}</div>
                </div>

                <div class="col-12 col-md-6">
                  <h6 class="text-subtitle1">Vehículo</h6>
                  <div>{{ quote.version.model.brand.name }} {{ quote.version.model.name }} ({{ quote.version.year }})</div>
                  <div class="text-caption">Uso: {{ quote.vehicleUsage }}</div>
                  <div class="text-caption">Patente: {{ quote.vehiclePlate || '-' }}</div>
                </div>

                <div class="col-12 col-md-6 q-mt-md">
                  <h6 class="text-subtitle1">Cobertura</h6>
                  <div>{{ quote.coverage.name }}</div>
                  <div class="text-caption">Prima mensual: ${{ formatCurrency(quote.totalMonthly) }}</div>
                  <div class="text-caption">Prima anual: ${{ formatCurrency(quote.totalAnnual) }}</div>
                </div>

                <div class="col-12 col-md-6 q-mt-md">
                  <h6 class="text-subtitle1">Detalles de la cotización</h6>
                  <div class="text-caption">Número: {{ quote.quoteNumber }}</div>
                  <div class="text-caption">Estado: {{ getStatusLabel(quote.status) }}</div>
                  <div class="text-caption">Creada: {{ formatDate(quote.createdAt) }}</div>
                </div>
              </div>

              <q-separator class="q-my-md" />
            </div>

            <div v-else>
              <div class="text-center q-pa-md">Cotización no encontrada.</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { quoteService } from 'src/services/api/quote.service';
import { Notify } from 'quasar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Quote {
  id: string;
  quoteNumber: string;
  customer: { id: string; firstName: string; lastName: string; dni: string; email?: string };
  version: { id: string; year: number; model: { id: string; name: string; brand: { id: string; name: string } } };
  coverage: { id: string; name: string };
  vehicleUsage?: string;
  vehiclePlate?: string | null;
  totalMonthly: number;
  totalAnnual: number;
  status: string;
  createdAt?: string;
}

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const quote = ref<Quote | null>(null);

const formatCurrency = (value: number) => new Intl.NumberFormat('es-AR').format(value);
const formatDate = (date?: string) => (date ? format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es }) : '-');

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada'
  };
  return labels[status] || status;
};

const loadQuote = async () => {
  const id = route.params.id as string;
  if (!id) return;
  loading.value = true;
  try {
    const result = await quoteService.getById(id);
    const data = result as Partial<Quote> | null;
    quote.value = data
      ? ({ ...data, status: data.status ?? 'pending' } as Quote)
      : null;
  } catch (error) {
    console.error('Error loading quote:', error);
    Notify.create({ type: 'negative', message: 'Error cargando la cotización' });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadQuote();
});
</script>

<style scoped>
.q-pa-md h2 { font-weight: 700; }
</style>
