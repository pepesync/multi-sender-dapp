<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStore } from '../store';
import { computed } from 'vue';
import { environment } from '../environment';
import { useToast } from 'vue-toastification';

const emit = defineEmits<{
  (e: 'next'): void;
}>();

const toast = useToast();
const store = useStore();
const {
  addressesList,
  selectedToken,
  networkBalance,
  arrayLimit,
  totalAmount,
  currentFee,
} = storeToRefs(store);

const totalNumberOfTx = computed(() =>
  Math.ceil(addressesList.value.length / arrayLimit.value)
);

const process = async () => {
  try {
    await store.multisendTransactions({
      slice: totalNumberOfTx.value,
      addPerTx: arrayLimit.value,
    });
    emit('next');
  } catch (error: any) {
    toast.error(error?.message || 'Signing failed, please try again!');
  }
};
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-2 gap-3">
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white">
          {{ addressesList.length }}
        </span>
        <span class="text-sm text-gray-400"> Total number of addresses </span>
      </div>
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white">
          {{ totalAmount }} {{ selectedToken?.symbol }}
        </span>
        <span class="text-sm text-gray-400">
          Total number of tokens to be sent
        </span>
      </div>
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white">
          {{ selectedToken?.balance }} {{ selectedToken?.symbol }}
        </span>
        <span class="text-sm text-gray-400">Your token balance</span>
      </div>
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white" :title="`${networkBalance}`">
          {{ store.fixedNumber(networkBalance) }}
          {{ environment.networkMainToken }}
        </span>
        <span class="text-sm text-gray-400">
          Your {{ environment.networkMainToken }} balance
        </span>
      </div>
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white">
          {{ totalNumberOfTx }}
        </span>
        <span class="text-sm text-gray-400">
          Total number of transactions needed
        </span>
      </div>
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white">
          {{ store.fixedNumber(currentFee * totalNumberOfTx) }}
          {{ environment.networkMainToken }}
        </span>
        <span class="text-sm text-gray-400"> Cost of operation </span>
      </div>
    </div>

    <button class="btn primary" @click="process()">Process</button>
  </div>
</template>
