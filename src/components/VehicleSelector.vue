<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 text-primary q-mb-md">
        <q-icon name="directions_car" class="q-mr-sm" />
        Datos del Vehículo
      </div>

      <div class="row q-col-gutter-md">
        <!-- Marca -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="selectedBrand"
            :options="brands"
            option-value="id"
            option-label="name"
            label="Marca *"
            outlined
            :loading="loadingBrands"
            :rules="[required('Seleccione una marca')]"
            @update:model-value="onBrandChange"
          >
            <template v-slot:prepend>
              <q-icon name="business" />
            </template>
          </q-select>
        </div>

        <!-- Modelo -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="selectedModel"
            :options="models"
            option-value="id"
            option-label="name"
            label="Modelo *"
            outlined
            :disable="!selectedBrand"
            :loading="loadingModels"
            :rules="[required('Seleccione un modelo')]"
            @update:model-value="onModelChange"
          >
            <template v-slot:prepend>
              <q-icon name="car_crash" />
            </template>
          </q-select>
        </div>

        <!-- Año -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="selectedVersion"
            :options="versions"
            :option-label="versionLabel"
            label="Año y Versión *"
            outlined
            :disable="!selectedModel"
            :loading="loadingVersions"
            :rules="[required('Seleccione un año')]"
            @update:model-value="onVersionChange"
          >
            <template v-slot:prepend>
              <q-icon name="event" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.year }}</q-item-label>
                  <q-item-label caption>
                    {{ scope.opt.fuelType }} - {{ scope.opt.engineSize }}L
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>
                    ${{ formatCurrency(scope.opt.fiscalValue) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Uso del vehículo -->
        <div class="col-12 col-md-6">
          <q-select
            v-model="vehicleUsage"
            :options="usageOptions"
            option-value="value"
            option-label="label"
            label="Uso del vehículo *"
            outlined
            emit-value
            map-options
            :rules="[required('Seleccione el uso')]"
          >
            <template v-slot:prepend>
              <q-icon name="commute" />
            </template>
          </q-select>
        </div>

        <!-- Patente -->
        <div class="col-12 col-md-6">
          <q-input
            v-model="vehiclePlate"
            label="Patente"
            outlined
            placeholder="ABC123 o AB123CD"
            :rules="[plate(),required('Ingrese la patente')]"
            maxlength="7"
            @update:model-value="formatPlate"
          >
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
          </q-input>
        </div>

        <!-- Valor asegurado -->
        <div class="col-12 col-md-6">
          <q-input
            :model-value="insuredValueFormatted"
            label="Valor a asegurar *"
            outlined
            type="text"
            prefix="$"
            disable
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>
        </div>
      </div>

      <!-- Información del vehículo seleccionado -->
      <q-card v-if="selectedVersion" flat bordered class="q-mt-md bg-blue-1">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-subtitle2 text-grey-8">Vehículo seleccionado</div>
              <div class="text-h6 text-primary">
                {{ selectedBrand?.name }} {{ selectedModel?.name }} {{ selectedVersion.year }}
              </div>
              <div class="text-caption text-grey-7">
                {{ selectedVersion.fuelType }} • {{ selectedVersion.engineSize }}L
              </div>
            </div>
            <div class="col-auto">
              <q-chip color="primary" text-color="white" icon="directions_car">
                {{ selectedModel?.type }}
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { vehicleService } from 'src/services/api/vehicle.service';
import type { Brand, Model, Version } from 'src/services/api/vehicle.service';
import { useFormValidation } from 'src/composables/useFormValidation';

const { required, plate } = useFormValidation();

// Props
interface Props {
  modelValue?: {
    versionId: string;
    vehicleUsage: string;
    vehiclePlate?: string;
    insuredValue: number;
  };
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']];
  valid: [valid: boolean];
}>();

// State
const loadingBrands = ref(false);
const loadingModels = ref(false);
const loadingVersions = ref(false);

const brands = ref<Brand[]>([]);
const models = ref<Model[]>([]);
const versions = ref<Version[]>([]);

const selectedBrand = ref<Brand | null>(null);
const selectedModel = ref<Model | null>(null);
const selectedVersion = ref<Version | null>(null);

const vehicleUsage = ref<string>('particular');
const vehiclePlate = ref<string>('');
const insuredValue = ref<number>(0);

const insuredValueFormatted = computed(() => {
  return insuredValue.value ? formatCurrency(insuredValue.value) : '';
});

const usageOptions = [
  { label: 'Particular', value: 'particular' },
  { label: 'Comercial', value: 'comercial' },
  /*{ label: 'Rideshare (Uber/Cabify)', value: 'rideshare' },*/
];

// Methods
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

const versionLabel = (version: Version) => {
  return `${version.year} - ${version.fuelType}`;
};

const formatPlate = (val: string | number | null) => {
  const str = val == null ? '' : String(val);
  vehiclePlate.value = str.toUpperCase();
};

const loadBrands = async () => {
  loadingBrands.value = true;
  try {
    brands.value = await vehicleService.getBrands();
  } catch (error) {
    console.error('Error loading brands:', error);
  } finally {
    loadingBrands.value = false;
  }
};

const onBrandChange = async () => {
  selectedModel.value = null;
  selectedVersion.value = null;
  models.value = [];
  versions.value = [];

  if (!selectedBrand.value) return;

  loadingModels.value = true;
  try {
    models.value = await vehicleService.getModelsByBrand(selectedBrand.value.id);
  } catch (error) {
    console.error('Error loading models:', error);
  } finally {
    loadingModels.value = false;
  }
};

const onModelChange = async () => {
  selectedVersion.value = null;
  versions.value = [];

  if (!selectedModel.value) return;

  loadingVersions.value = true;
  try {
    versions.value = await vehicleService.getVersionsByModel(selectedModel.value.id);
  } catch (error) {
    console.error('Error loading versions:', error);
  } finally {
    loadingVersions.value = false;
  }
};

const onVersionChange = () => {
  if (selectedVersion.value) {
    // Actualizar valor asegurado con valor fiscal cada vez que cambia la versión
    insuredValue.value = selectedVersion.value.fiscalValue;
  } else {
    insuredValue.value = 0;
  }
};

// Watchers
watch(
  [selectedBrand, selectedModel, selectedVersion, vehicleUsage, vehiclePlate, insuredValue],
  () => {
    const hasBrand = !!selectedBrand.value;
    const hasModel = !!selectedModel.value;
    const hasVersion = !!selectedVersion.value;
    const hasUsage = !!vehicleUsage.value;
    const plateFilled = vehiclePlate.value ? vehiclePlate.value.trim().length > 0 : false;
    const valueOk = insuredValue.value >= 100000 && insuredValue.value <= 100000000;

    if (hasBrand && hasModel && hasVersion && hasUsage && plateFilled && valueOk) {
      const payload: Props['modelValue'] = {
        versionId: selectedVersion.value!.id,
        vehicleUsage: vehicleUsage.value,
        insuredValue: insuredValue.value,
        vehiclePlate: vehiclePlate.value,
      };
      emit('update:modelValue', payload);
      emit('valid', true);
    } else {
      emit('valid', false);
    }
  },
  { deep: true },
);

// Lifecycle
onMounted(async () => {
  await loadBrands();
});
</script>
