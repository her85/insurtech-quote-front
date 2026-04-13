// src/composables/useFormValidation.ts
import { ref } from 'vue';

export function useFormValidation() {
  const errors = ref<Record<string, string>>({});

  const required = (message = 'Este campo es requerido') => {
    return (val: unknown) => {
      if (val === null || val === undefined) return message;
      if (typeof val === 'string' || Array.isArray(val)) return (val.length > 0) || message;
      if (typeof val === 'object') return Object.keys(val).length > 0 || message;
      return true;
    };
  };

  const email = (message = 'Email inválido') => {
    return (val: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(val) || message;
    };
  };

  const minLength = (min: number, message?: string) => {
    return (val: string) => {
      return (
        (val && val.length >= min) ||
        message ||
        `Debe tener al menos ${min} caracteres`
      );
    };
  };

  const maxLength = (max: number, message?: string) => {
    return (val: string) => {
      return (
        (val && val.length <= max) ||
        message ||
        `No puede exceder ${max} caracteres`
      );
    };
  };

  const numeric = (message = 'Solo se permiten números') => {
    return (val: string) => /^\d+$/.test(val) || message;
  };

  const dni = (message = 'DNI inválido (7-8 dígitos)') => {
    return (val: string) => /^\d{7,8}$/.test(val) || message;
  };

  const phone = (message = 'Teléfono inválido') => {
    return (val: string) => /^[\d\s\-+()]{8,20}$/.test(val) || message;
  };

  const postalCode = (message = 'Código postal inválido') => {
    return (val: string) => /^[A-Z]?\d{4}[A-Z]{0,3}$/i.test(val) || message;
  };

  const plate = (message = 'Patente inválida (ej: ABC123 o AB123CD)') => {
    return (val: string) => {
      return /^[A-Z]{2,3}\d{3}[A-Z]{2,3}$|^[A-Z]{3}\d{3}$/i.test(val) || message;
    };
  };

  const minAge = (min: number, message?: string) => {
    return (val: string) => {
      const birthDate = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      let calculatedAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      
      return (
        calculatedAge >= min ||
        message ||
        `Debe ser mayor de ${min} años`
      );
    };
  };

  const clearErrors = () => {
    errors.value = {};
  };

  return {
    errors,
    required,
    email,
    minLength,
    maxLength,
    numeric,
    dni,
    phone,
    postalCode,
    plate,
    minAge,
    clearErrors
  };
}