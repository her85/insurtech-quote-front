<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h5 text-primary text-center q-mb-md">
        <q-icon name="verified" size="lg" class="q-mr-sm" />
        ¡Tu Cotización está Lista!
      </div>

      <!-- Número de cotización -->
      <div class="text-center q-mb-lg">
        <div class="text-caption text-grey-7">Número de cotización</div>
        <div class="text-h6 text-primary">{{ quote.quoteNumber }}</div>
        <div class="text-caption text-grey-6">
          Válida hasta {{ formatDate(quote.expiresAt) }}
        </div>
      </div>

      <!-- Resumen del vehículo -->
       <q-card flat bordered class="q-mb-md bg-blue-1">
        <q-card-section>
         <div class="row items-center">
            <div class="col-auto q-mr-md">
              <q-avatar size="60px" color="primary" text-color="white">
                <q-icon name="directions_car" size="md" />
              </q-avatar>
            </div>
            <div class="col">
              <div class="text-h6 text-grey-9">
                Vehículo {{ quote.version.model.brand.name }}  {{ quote.version.model.name }}  {{ quote.version.year }}
              </div>
              <div class="text-subtitle2 text-grey-7">
                Cobertura {{ quote.coverage.name }} 
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Precio principal -->
      <div class="text-center q-py-lg bg-gradient">
        <div class="text-caption text-white">Prima Mensual</div>
        <div class="text-h3 text-white text-weight-bold">
          ${{ formatCurrency(quote.totalMonthly) }}
        </div>
        <div class="text-caption text-white">
          Anual: ${{ formatCurrency(quote.totalAnnual) }}
        </div>
      </div>

      <!-- Desglose de precios -->
      <q-expansion-item
        icon="receipt"
        label="Ver desglose de precio"
        class="q-mt-md"
      >
        <q-card flat bordered>
          <q-list separator>
            <q-item>
              <q-item-section>
                <q-item-label>Prima Base</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>${{ formatCurrency(quote.basePremium) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label>Ajuste por Riesgo</q-item-label>
                <q-item-label caption>
                  Basado en edad, zona, historial, etc.
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  ${{ formatCurrency(quote.riskPremium - quote.basePremium) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="quote.additionalsCost > 0">
              <q-item-section>
                <q-item-label>Adicionales</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label>
                  ${{ formatCurrency(quote.additionalsCost) }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-bold">TOTAL MENSUAL</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-weight-bold text-primary">
                  ${{ formatCurrency(quote.totalMonthly) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-expansion-item>

      <!-- Factores de riesgo -->
      <q-expansion-item
        icon="analytics"
        label="Factores que afectan tu precio"
        class="q-mt-sm"
      >
        <q-card flat bordered>
          <q-list separator dense>
            <q-item v-for="(factor, key) in factors" :key="key">
              <q-item-section>
                <q-item-label>{{ factor.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip
                  :color="getFactorColor(factor.value)"
                  text-color="white"
                  size="sm"
                >
                  {{ formatFactor(factor.value) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-expansion-item>

      <!-- Acciones -->
      <div class="row q-col-gutter-sm q-mt-lg">
        <div class="col-12 col-sm-6">
          <q-btn
            unelevated
            color="primary"
            icon="file_download"
            label="Descargar PDF"
            class="full-width"
            @click="downloadPDF"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-btn
            unelevated
            color="secondary"
            icon="email"
            label="Enviar por Email"
            class="full-width"
            @click="sendEmail"
          />
        </div>
        <div class="col-12">
          <q-btn
            unelevated
            color="positive"
            icon="check_circle"
            label="Contratar Ahora"
            size="lg"
            class="full-width"
            @click="hire"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Quote } from 'src/services/api/quote.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, Notify } from 'quasar';

// Props
interface Props {
  quote: Quote;
}

const props = defineProps<Props>();

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(Math.round(value));
};

const formatDate = (date: string) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
};

const formatFactor = (value: number) => {
  if (value === 1) return 'Base';
  if (value > 1) return `+${Math.round((value - 1) * 100)}%`;
  return `${Math.round((value - 1) * 100)}%`;
};

const getFactorColor = (value: number) => {
  if (value < 1) return 'positive';
  if (value === 1) return 'grey';
  if (value < 1.3) return 'warning';
  return 'negative';
};

const downloadPDF = () => {
  Notify.create({
    type: 'info',
    message: 'Generando PDF...PROXIMANENTE',
    position: 'top'
  });
  // Implementar descarga de PDF
};

const sendEmail = () => {
  Dialog.create({
    title: 'Enviar cotización',
    message: 'Ingrese su email....PROXIMANENTE',
    /**prompt: {
      model: props.quote.customer.email,
      type: 'email'
    },*/
    cancel: true
  })
  /**.onOk(email => {
    Notify.create({
      type: 'positive',
      message: `Cotización enviada a ${email}`,
      position: 'top'
    });
  });*/
};

const hire = () => {
  Notify.create({
    type: 'positive',
    message: 'Redirigiendo a contratación...PROXIMANENTE',
    position: 'top'
  });
  // Implementar contratación
};

// Computed
const factors = computed(() => ({
  ageFactor: { label: 'Factor Edad', value: props.quote.factors.ageFactor },
  vehicleAgeFactor: { label: 'Antigüedad Vehículo', value: props.quote.factors.vehicleAgeFactor },
  zoneFactor: { label: 'Zona Geográfica', value: props.quote.factors.zoneFactor },
  usageFactor: { label: 'Tipo de Uso', value: props.quote.factors.usageFactor },
  genderFactor: { label: 'Género', value: props.quote.factors.genderFactor },
  claimsHistoryFactor: { label: 'Historial Siniestros', value: props.quote.factors.claimsHistoryFactor }
}));
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #1976D2 0%, #26A69A 100%);
  border-radius: 8px;
}
</style>