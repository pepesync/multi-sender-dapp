<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useToast } from 'vue-toastification';
import { environment } from '../environment';
import { useStore } from '../store';
import Button from './Button.vue';
import PaginationList from './PaginationList.vue';

const emit = defineEmits<{
  (e: 'next'): void;
}>();

const store = useStore();
const toast = useToast();
const {
  addressesList,
  networkBalance,
  selectedToken,
  loading,
  totalAmount,
  dublicateAddresses,
} = storeToRefs(store);

const insufficient = computed(
  () => selectedToken.value.balance < totalAmount.value
);

const approve = async () => {
  try {
    await store.approve();
    emit('next');
  } catch (error: any) {
    toast.error(error?.message || 'Signing failed, please try again!');
  }
};
</script>

<template>
  <div class="card">
    <div class="grid grid-cols-2 gap-3">
      <!-- <div
                class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
              >
                <span class="text-2xl text-white"
                  >0 {{ selectedToken?.symbol }}</span
                >
                <span class="text-sm text-gray-400"
                  >Your current multisend allowance</span
                >
              </div> -->
      <div
        class="flex flex-col items-center justify-center gap-3 py-4 border border-slate-500 rounded-xl"
      >
        <span class="text-2xl text-white" :title="`${totalAmount}`">
          {{ store.fixedNumber(totalAmount) }}
          {{ selectedToken?.symbol }}
        </span>
        <span class="text-sm text-gray-400">
          Total number of tokens to be sent
        </span>
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
        <span class="text-2xl text-white" :title="`${selectedToken?.balance}`">
          {{ store.fixedNumber(selectedToken?.balance ?? 0) }}
          {{ selectedToken?.symbol }}
        </span>
        <span class="text-sm text-gray-400">Your token balance</span>
      </div>
    </div>

    <div
      v-if="dublicateAddresses.length"
      class="p-3 text-sm text-white rounded-xl bg-blue-500/20"
    >
      <p class="mb-3">
        There were duplicated addresses in your list, We already combined the
        amounts for those addreses. Please make sure it did the calculation
        correctly.
      </p>
      <ul v-for="item in dublicateAddresses" :key="item" class="list-disc">
        <li class="ml-3">
          <a
            class="text-primary-500 hover:opacity-90"
            :href="`${environment.explorerUrl}/address/${item}`"
            target="_blank"
          >
            {{ item }}
          </a>
        </li>
      </ul>
    </div>

    <PaginationList title="List of recipients" :data="addressesList">
      <template #default="{ item, number }">
        <li class="flex items-center justify-between py-2">
          <div>
            <span class="text-sm text-gray-400">{{ number }}. </span>
            <a
              class="text-primary-500 hover:opacity-90"
              :href="`${environment.explorerUrl}/address/${item.address}`"
              target="_blank"
            >
              {{ item.address }}
            </a>
          </div>
          <span class="text-primary-200"
            >{{ item.amount }} {{ selectedToken.symbol }}</span
          >
        </li>
      </template>
    </PaginationList>

    <div
      v-if="insufficient"
      class="p-3 text-sm text-red-500 rounded-xl bg-red-500/20"
    >
      Not enough tokens. Please add funds to your token balance or use a smaller
      batch
    </div>
    <div
      v-if="loading"
      class="p-3 text-sm text-green-500 rounded-xl bg-green-500/20"
    >
      Preparing transactions...
    </div>

    <Button :disabled="insufficient" :loading="loading" @click="approve()"
      >Approve</Button
    >
  </div>
</template>
