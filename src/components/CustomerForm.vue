<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 text-primary q-mb-md">
        <q-icon name="person" class="q-mr-sm" />
        Datos del Conductor
      </div>

      <!-- Búsqueda por DNI (usada en el campo DNI abajo) -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12">
          <q-banner class="bg-blue-1 text-grey-8" rounded>
            <template v-slot:avatar>
              <q-icon name="info" color="primary" />
            </template>
            ¿Ya cotizaste antes? Ingresá tu DNI para recuperar tus datos.
          </q-banner>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="row q-col-gutter-md">
        <!-- Nombre -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.firstName" label="Nombre *" outlined :rules="[
            required('Ingrese el nombre'),
            minLength(2),
            maxLength(50)
          ]">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>

        <!-- Apellido -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.lastName" label="Apellido *" outlined :rules="[
            required('Ingrese el apellido'),
            minLength(2),
            maxLength(50)
          ]">
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>

        <!-- DNI (input único para ingresar y buscar) -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.dni" label="DNI *" outlined maxlength="8" :rules="[
            required('Ingrese el DNI'),
            dni()
          ]" @keyup.enter="searchCustomerByDni">
            <template v-slot:prepend>
              <q-icon name="badge" />
            </template>
            <template v-slot:append>
              <q-btn flat round dense icon="search" color="primary" :loading="searching" @click="searchCustomerByDni" />
            </template>
          </q-input>
        </div>

        <!-- Fecha de nacimiento -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.dateOfBirth" label="Fecha de nacimiento *" outlined type="date" :rules="[
            required('Ingrese la fecha de nacimiento'),
            minAge(18)
          ]">
            <template v-slot:prepend>
              <q-icon name="cake" />
            </template>
          </q-input>
        </div>

        <!-- Género -->
        <div class="col-12 col-md-6">
          <q-select v-model="formData.gender" :options="genderOptions" option-value="value" option-label="label"
            label="Género *" outlined emit-value map-options :rules="[required('Seleccione el género')]">
            <template v-slot:prepend>
              <q-icon name="wc" />
            </template>
          </q-select>
        </div>

        <!-- Email -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.email" label="Email *" outlined type="email" :rules="[
            required('Ingrese el email'),
            email()
          ]">
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
        </div>

        <!-- Teléfono -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.phone" label="Teléfono *" outlined :rules="[
            required('Ingrese el teléfono'),
            phone()
          ]">
            <template v-slot:prepend>
              <q-icon name="phone" />
            </template>
          </q-input>
        </div>

        <!-- Código postal -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.postalCode" label="Código Postal *" outlined :rules="[
            required('Ingrese el código postal'),
            postalCode()
          ]" @update:model-value="formatPostalCode">
            <template v-slot:prepend>
              <q-icon name="markunread_mailbox" />
            </template>
          </q-input>
        </div>

        <!-- Dirección -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.address" label="Dirección *" outlined :rules="[
            required('Ingrese la dirección'),
            minLength(5),
            maxLength(200)
          ]">
            <template v-slot:prepend>
              <q-icon name="home" />
            </template>
          </q-input>
        </div>

        <!-- Provincia -->
        <div class="col-12 col-md-6">
          <q-select v-model="formData.province" :options="provinces" label="Provincia *" outlined
            :rules="[required('Seleccione la provincia')]">
            <template v-slot:prepend>
              <q-icon name="map" />
            </template>
          </q-select>
        </div>

        <!-- Ciudad -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.city" label="Ciudad *" outlined :rules="[
            required('Ingrese la ciudad'),
            minLength(2),
            maxLength(100)
          ]">
            <template v-slot:prepend>
              <q-icon name="location_city" />
            </template>
          </q-input>
        </div>

        <!-- Fecha de licencia -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.licenseDate" label="Fecha emisión licencia *" outlined type="date" :rules="[
            required('Ingrese la fecha de emisión'),
            (val) => new Date(val) <= new Date() || 'La fecha no puede ser futura'
          ]">
            <template v-slot:prepend>
              <q-icon name="card_membership" />
            </template>
          </q-input>
        </div>

        <!-- Número de licencia -->
        <div class="col-12 col-md-6">
          <q-input v-model="formData.licenseNumber" label="Número de licencia *" outlined :rules="[
            required('Ingrese el número de licencia'),
            minLength(5),
            maxLength(20)
          ]">
            <template v-slot:prepend>
              <q-icon name="credit_card" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { customerService, type CreateCustomerInput, type Customer } from 'src/services/api/customer.service';
import { useFormValidation } from 'src/composables/useFormValidation';
import { Notify } from 'quasar';

const {
  required,
  email,
  minLength,
  maxLength,
  dni,
  phone,
  postalCode,
  minAge
} = useFormValidation();

// Props
interface Props {
  modelValue?: CreateCustomerInput & { id?: string };
}

defineProps<Props>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']];
  'valid': [valid: boolean];
}>();

// State
const searching = ref(false);


const formData = ref<CreateCustomerInput & { id?: string }>({
  firstName: '',
  lastName: '',
  dni: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'M',
  address: '',
  postalCode: '',
  city: '',
  province: '',
  licenseDate: '',
  licenseNumber: ''
});

const genderOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otro', value: 'X' }
];

const provinces = [
  'Buenos Aires',
  'Ciudad de Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

// Methods
const formatPostalCode = (val: string | number | null) => {
  if (val == null) {
    formData.value.postalCode = '';
    return;
  }
  const str = String(val);
  formData.value.postalCode = str.toUpperCase();
};

const searchCustomerByDni = async () => {
  const dniToSearch = formData.value.dni;
  if (!dniToSearch || dniToSearch.length < 7) {
    Notify.create({
      type: 'warning',
      message: 'Ingrese un DNI válido',
      position: 'top'
    });
    return;
  }

  searching.value = true;
  try {
    const customer: Customer | false = await customerService.getByDni(dniToSearch);

    if (customer) {
      formData.value = {
        ...(customer as CreateCustomerInput & { id?: string }),
        dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
        licenseDate: customer.licenseDate ? customer.licenseDate.split('T')[0] : ''
      } as CreateCustomerInput & { id?: string };

      Notify.create({
        type: 'positive',
        message: 'Cliente encontrado. Datos cargados automáticamente',
        position: 'top'
      });
    } else {
      Notify.create({
        type: 'info',
        message: 'No se encontró un cliente con ese DNI',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error searching customer:', error);
  } finally {
    searching.value = false;
  }
};

// Computed
const isFormValid = computed(() => {
  return (
    formData.value.firstName.length >= 2 &&
    formData.value.lastName.length >= 2 &&
    /^\d{7,8}$/.test(formData.value.dni) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email) &&
    formData.value.phone.length >= 8 &&
    formData.value.dateOfBirth !== '' &&
    formData.value.address.length >= 5 &&
    formData.value.postalCode !== '' &&
    formData.value.city.length >= 2 &&
    formData.value.province !== '' &&
    formData.value.licenseDate !== '' &&
    formData.value.licenseNumber.length >= 5
  );
});

// Watchers
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal);
    emit('valid', isFormValid.value);
  },
  { deep: true }
);
</script>