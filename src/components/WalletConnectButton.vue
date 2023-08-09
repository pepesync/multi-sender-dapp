<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { storeToRefs } from 'pinia';
import { useStore } from '../store';
import { useClipboard } from '@vueuse/core';
import { useToast } from 'vue-toastification';

const toast = useToast();
const store = useStore();
const { address } = storeToRefs(store);

const { isConnected } = storeToRefs(store);
const addressLabel = computed(
  () => address.value.slice(0, 6) + '...' + address.value.slice(-4)
);

const copyAddress = () => {
  const { copy, copied } = useClipboard({ source: address });
  copy();
  if (copied) toast.success('Address copied!');
};
</script>
<template>
  <div>
    <template v-if="!isConnected">
      <button
        class="gap-2 btn primary-alt"
        type="button"
        @click="store.connectWallet()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
          />
        </svg>

        <span class="hidden lg:inline">Connect to Web3</span>
      </button>
    </template>
    <template v-else>
      <div
        class="gap-2 cursor-pointer btn primary-alt"
        @click.exact="copyAddress"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
          />
        </svg>

        <span>{{ addressLabel }}</span>
        <button
          class="btn danger-alt btn-sm"
          type="button"
          @click="store.disconnectWallet()"
        >
          Disconnect
        </button>
      </div>
    </template>
  </div>
</template>
