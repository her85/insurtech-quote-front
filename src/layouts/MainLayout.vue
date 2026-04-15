<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="shield" size="sm" class="q-mr-sm" />
          Cotizador de Seguros Online
        </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          round
          dense
          icon="help_outline"
          @click="showHelp"
        >
          <q-tooltip>Ayuda</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="phone"
        >
          <q-tooltip>0800-123-4567</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-2 text-grey-8">
      <q-toolbar>
        <q-toolbar-title class="text-caption">
          © 2024 InsurTech Seguros. Todos los derechos reservados.
        </q-toolbar-title>
        <div class="text-caption">
          <a href="#" class="text-grey-8 q-mr-md">Términos y Condiciones</a>
          <a href="#" class="text-grey-8">Política de Privacidad</a>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { Dialog } from 'quasar';

const showHelp = () => {
  Dialog.create({
    title: '¿Necesitás ayuda?',
    message: `
      <div class="q-pa-md">
        <p><strong>Paso 1:</strong> Seleccioná tu vehículo</p>
        <p><strong>Paso 2:</strong> Completá tus datos personales</p>
        <p><strong>Paso 3:</strong> Elegí el tipo de cobertura</p>
        <p><strong>Paso 4:</strong> Obtené tu cotización</p>
        <br>
        <p>Si tenés dudas, llamanos al <strong>0800-123-4567</strong></p>
      </div>
    `,
    html: true
  });
};
</script>

<style scoped>
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>