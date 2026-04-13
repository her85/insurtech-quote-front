<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 text-primary q-mb-md">
        <q-icon name="security" class="q-mr-sm" />
        Tipo de Cobertura
      </div>

      <div class="row q-col-gutter-md">
        <div
          v-for="coverage in coverages"
          :key="coverage.id"
          class="col-12 col-md-4"
        >
          <q-card
            :class="[
              'cursor-pointer transition-all',
              selectedCoverage?.id === coverage.id
                ? 'bg-primary text-white shadow-10'
                : 'bg-white shadow-2'
            ]"
            @click="selectCoverage(coverage)"
          >
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <div class="col">
                  <div class="text-h6">{{ coverage.name }}</div>
                </div>
                <div class="col-auto">
                  <q-icon
                    v-if="selectedCoverage?.id === coverage.id"
                    name="check_circle"
                    size="md"
                  />
                </div>
              </div>
              <div class="text-caption q-mb-md">
                {{ coverage.description }}
              </div>

              <!-- Features -->
              <q-list dense>
                <q-item
                  v-for="(feature, idx) in parseFeatures(coverage.features)"
                  :key="idx"
                  dense
                >
                  <q-item-section avatar>
                    <q-icon
                      name="check"
                      :color="selectedCoverage?.id === coverage.id ? 'white' : 'positive'"
                      size="xs"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="selectedCoverage?.id === coverage.id ? 'text-white' : 'text-grey-8'">
                      {{ feature }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Adicionales -->
      <div v-if="selectedCoverage && additionals.length > 0" class="q-mt-lg">
        <div class="text-subtitle1 text-grey-8 q-mb-md">
          <q-icon name="add_circle" class="q-mr-sm" />
          Coberturas Adicionales
        </div>

        <div class="row q-col-gutter-sm">
          <div
            v-for="additional in additionals"
            :key="additional.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-checkbox
              v-model="selectedAdditionals"
              :val="additional.id"
              :label="`${additional.name} (+$${formatCurrency(additional.price)}/mes)`"
              :color="selectedCoverage?.id ? 'primary' : 'grey'"
              dense
            >
              <q-tooltip>{{ additional.description }}</q-tooltip>
            </q-checkbox>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { coverageService, type Coverage, type CoverageAdditional } from 'src/services/api/coverage.service';

// Props
interface Props {
  modelValue?: {
    coverageId: string;
    selectedAdditionals: string[];
  };
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']];
  'valid': [valid: boolean];
}>();

// State
const loading = ref(false);
const coverages = ref<Coverage[]>([]);
const selectedCoverage = ref<Coverage | null>(null);
const selectedAdditionals = ref<string[]>([]);

// Computed
const additionals = computed(() => {
  if (!selectedCoverage.value) return [];
  
  const allAdditionals: CoverageAdditional[] = [];
  
  // Adicionales de la cobertura seleccionada
  if (selectedCoverage.value.additionals) {
    allAdditionals.push(...selectedCoverage.value.additionals);
  }
  
  // Adicionales generales (sin coverageId)
  coverages.value.forEach(cov => {
    cov.additionals?.forEach(add => {
      if (!add.id && !allAdditionals.find(a => a.id === add.id)) {
        allAdditionals.push(add);
      }
    });
  });
  
  return allAdditionals;
});

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

const parseFeatures = (features: string): string[] => {
  try {
    return JSON.parse(features);
  } catch {
    return [];
  }
};

const selectCoverage = (coverage: Coverage) => {
  selectedCoverage.value = coverage;
  selectedAdditionals.value = [];
};

const loadCoverages = async () => {
  loading.value = true;
  try {
    coverages.value = await coverageService.getAll();
  } catch (error) {
    console.error('Error loading coverages:', error);
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  [selectedCoverage, selectedAdditionals],
  () => {
    if (selectedCoverage.value) {
      emit('update:modelValue', {
        coverageId: selectedCoverage.value.id,
        selectedAdditionals: selectedAdditionals.value
      });
      emit('valid', true);
    } else {
      emit('valid', false);
    }
  },
  { deep: true }
);

// Lifecycle
onMounted(async () => {
 await loadCoverages();
});
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}

.cursor-pointer {
  cursor: pointer;
}
</style>