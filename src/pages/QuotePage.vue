<!-- src/pages/QuotePage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <!-- Header -->
        <div class="text-center q-mb-xl">
          <h1 class="text-h3 text-primary q-mb-sm">
            Cotizá tu Seguro Automotor
          </h1>
          <p class="text-subtitle1 text-grey-7">
            Obtené tu cotización en minutos con los mejores precios del mercado
          </p>
        </div>

        <!-- Stepper -->
        <q-stepper v-model="step" ref="stepper" color="primary" animated alternative-labels>
          <!-- Step 1: Vehículo -->
          <q-step :name="1" title="Vehículo" icon="directions_car" :done="step > 1">
            <VehicleSelector :key="vehicleKey" v-model="vehicleData" @valid="vehicleValid = $event" />

            <q-stepper-navigation>
              <q-btn color="primary" label="Siguiente" :disable="!vehicleValid" @click="nextStep" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 2: Conductor -->
          <q-step :name="2" title="Conductor" icon="person" :done="step > 2">
            <CustomerForm :key="customerKey" v-model="customerData" @valid="customerValid = $event" />

            <q-stepper-navigation>
              <!--<q-btn flat color="primary" label="Atrás" class="q-mr-sm" @click="prevStep" />-->
              <q-btn color="primary" label="Siguiente" :disable="!customerValid" @click="nextStep" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 3: Cobertura -->
          <q-step :name="3" title="Cobertura" icon="security" :done="step > 3">
            <CoverageSelector :key="coverageKey" v-model="coverageData" @valid="coverageValid = $event" />

            <q-stepper-navigation>
              <!--<q-btn flat color="primary" label="Atrás" class="q-mr-sm" @click="prevStep" />-->
              <q-btn color="primary" label="Calcular Cotización" :disable="!coverageValid" :loading="calculating"
                @click="calculateQuote" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 4: Resultado -->
          <q-step :name="4" title="Resultado" icon="check_circle">
            <QuoteResult v-if="currentQuote" :quote="currentQuote" />

            <q-stepper-navigation>
              <q-btn flat color="primary" label="Nueva Cotización" @click="resetQuote" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>

        <!-- Features section -->
        <div v-if="step === 1" class="q-mt-xl">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-4 text-center">
              <q-icon name="speed" size="48px" color="primary" class="q-mb-sm" />
              <div class="text-h6 q-mb-xs">Rápido</div>
              <div class="text-caption text-grey-7">
                Cotización en menos de 3 minutos
              </div>
            </div>
            <div class="col-12 col-sm-4 text-center">
              <q-icon name="verified_user" size="48px" color="primary" class="q-mb-sm" />
              <div class="text-h6 q-mb-xs">Seguro</div>
              <div class="text-caption text-grey-7">
                Tus datos están protegidos
              </div>
            </div>
            <div class="col-12 col-sm-4 text-center">
              <q-icon name="local_offer" size="48px" color="primary" class="q-mb-sm" />
              <div class="text-h6 q-mb-xs">Mejor Precio</div>
              <div class="text-caption text-grey-7">
                Tarifas competitivas del mercado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
//import { useRouter } from 'vue-router';
import VehicleSelector from 'src/components/VehicleSelector.vue';
import CustomerForm from 'src/components/CustomerForm.vue';
import CoverageSelector from 'src/components/CoverageSelector.vue';
import QuoteResult from 'src/components/QuoteResult.vue';
import { useQuoteCalculator } from 'src/composables/useQuoteCalculator';
import { customerService } from 'src/services/api/customer.service';
import axios from 'axios';
import { Notify, Loading } from 'quasar';

//const router = useRouter();
const { calculate, currentQuote } = useQuoteCalculator();

// State
const step = ref(1);
const calculating = ref(false);

const vehicleData = ref();
const customerData = ref();
const coverageData = ref();

// Keys to force remount child components when resetting
const vehicleKey = ref(0);
const customerKey = ref(0);
const coverageKey = ref(0);

const vehicleValid = ref(false);
const customerValid = ref(false);
const coverageValid = ref(false);

// Methods
const nextStep = () => {
  step.value++;
};

/**const prevStep = () => {
  step.value--;
};*/

const calculateQuote = async () => {
  calculating.value = true;
  Loading.show({
    message: 'Calculando tu cotización...'
  });

    try {
      // 1. Crear o actualizar cliente
      let customerId = customerData.value?.id;

      if (!customerId) {
        const payload = {
          ...customerData.value,
          dateOfBirth: new Date(customerData.value.dateOfBirth).toISOString(),
          licenseDate: new Date(customerData.value.licenseDate).toISOString()
        };

        // Log payload for debugging validation issues
        //console.log('Creating customer payload', payload);

        const customer = await customerService.create(payload);
        customerId = customer.id;
      }

      // 2. Calcular cotización
      await calculate({
        customerId,
        versionId: vehicleData.value.versionId,
        coverageId: coverageData.value.coverageId,
        vehiclePlate: vehicleData.value.vehiclePlate,
        vehicleUsage: vehicleData.value.vehicleUsage,
        insuredValue: vehicleData.value.insuredValue,
        selectedAdditionals: coverageData.value.selectedAdditionals
      });

    // 3. Ir al paso de resultado
    step.value = 4;

    Notify.create({
      type: 'positive',
      message: '¡Cotización calculada con éxito!',
      position: 'top',
      icon: 'check_circle'
    });
  } catch (error) {
    // Log server validation details when available
    if (axios.isAxiosError(error)) {
      console.error('API error response:', error.response?.data);
      const data = error.response?.data as { message?: string; errors?: Array<{ field?: string; message?: string }> } | undefined;
      const message = data?.message ?? 'Error al calcular la cotización';

      if (data?.errors && Array.isArray(data.errors)) {
        const details = data.errors.map(e => `${e.field ?? 'body'}: ${e.message}`).join('\n');
        Notify.create({
          type: 'negative',
          message: `${message}: ${details}`,
          position: 'top'
        });
      } else {
        Notify.create({
          type: 'negative',
          message,
          position: 'top'
        });
      }
    } else {
      console.error('Error calculating quote:', error);
      Notify.create({
        type: 'negative',
        message: 'Error al calcular la cotización',
        position: 'top'
      });
    }
  } finally {
    calculating.value = false;
    Loading.hide();
  }
};

const resetQuote = () => {
  vehicleData.value = null;
  customerData.value = null;
  coverageData.value = null;
  currentQuote.value = null;

  // Reset validation flags so user cannot advance until forms are valid again
  vehicleValid.value = false;
  customerValid.value = false;
  coverageValid.value = false;

  // Force remount child components to clear their internal state
  vehicleKey.value += 1;
  customerKey.value += 1;
  coverageKey.value += 1;

  step.value = 1;
};
</script>

<style scoped>
h1 {
  font-weight: 700;
}
</style>
