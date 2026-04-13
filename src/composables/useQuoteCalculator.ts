// src/composables/useQuoteCalculator.ts
import { ref, computed } from 'vue';
import axios from 'axios';
import { quoteService } from 'src/services/api/quote.service';
import  type { QuoteCalculationInput, Quote } from 'src/services/api/quote.service';
import { Notify } from 'quasar';

export function useQuoteCalculator() {
  const loading = ref(false);
  const currentQuote = ref<Quote | null>(null);
  const error = ref<string | null>(null);

  const calculate = async (input: QuoteCalculationInput) => {
    loading.value = true;
    error.value = null;

    try {
      const quote = await quoteService.calculate(input);
      currentQuote.value = quote;
      return quote;
    } catch (err: unknown) {
      let message = 'Error al calcular la cotización';

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        message = data?.message ?? err.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      error.value = message;

      Notify.create({
        type: 'negative',
        message: error.value,
        position: 'top'
      });

      throw err;
    } finally {
      loading.value = false;
    }
  };

  const monthlyPayment = computed(() => {
    return currentQuote.value?.totalMonthly || 0;
  });

  const annualPayment = computed(() => {
    return currentQuote.value?.totalAnnual || 0;
  });

  const hasQuote = computed(() => {
    return currentQuote.value !== null;
  });

  return {
    loading,
    currentQuote,
    error,
    calculate,
    monthlyPayment,
    annualPayment,
    hasQuote
  };
}
