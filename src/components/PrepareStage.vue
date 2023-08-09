<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import csvtojson from 'csvtojson';
import { useStore } from '../store';
import { useToast } from 'vue-toastification';
import { ref } from 'vue';
import Button from './Button.vue';
import CsvExampleModal from './CsvExampleModal.vue';

const emit = defineEmits<{
  (e: 'next'): void;
}>();

const toast = useToast();
const store = useStore();
const addressesValue = ref('');
const fileInput = ref();
const isCsvExampleModalActive = ref(false);
const error = ref<string | undefined>(undefined);

const {
  selectedTokenAddress,
  isConnected,
  loading,
  tokens,
  addressesList,
  dublicateAddresses,
  web3,
} = storeToRefs(store);

const getCsvFile = (e: any) => {
  const files = e.target.files;
  if (files.length > 0) {
    const reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = (e: any) => {
      addressesValue.value = e.target.result.replaceAll(';', ',');
    };
    reader.onerror = (e: any) => {
      toast.error(e.target.error.name);
    };
    // csvtojson({
    //   noheader: true,
    //   output: 'csv',
    // })
    //   .fromFile(data)
    //   .then((csvRows) => {
    //     console.log(csvRows);
    //   });
  }
};

const parseCsv = (value: string): Promise<AddressItem[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const csvRows = await csvtojson({
        noheader: true,
        output: 'csv',
      }).fromString(value);

      const arry: AddressItem[] = [];
      dublicateAddresses.value = [];

      csvRows.forEach((row, index) => {
        if (Object.keys(row).length === 0) {
          reject({
            message: `There was an error parsing ${JSON.stringify(
              row
            )} at line ${index + 1}`,
          });
        }
        const address = row[0].replace(/\s/g, '');
        if (!web3.value.utils.isAddress(address)) {
          reject({
            message: `There was an invalid address ${JSON.stringify(
              address
            )} at line ${index + 1}`,
          });
          // this.invalid_addresses.push(address);
        }
        const amount = +row[1];

        if (isNaN(amount)) {
          reject({
            message: `There was an error with amount at ${JSON.stringify(
              address
            )} at line ${index + 1}`,
          });
        }

        // this.totalBalance = new BN(balance).plus(this.totalBalance).toString(10)
        const indexAddr = arry.findIndex(
          (account) => account.address === address
        );
        if (indexAddr === -1) {
          arry.push({ address, amount });
        } else {
          if (dublicateAddresses.value.indexOf(address) === -1) {
            dublicateAddresses.value.push(address);
          }
          arry[indexAddr].amount += amount;
        }
      });

      resolve(arry);
    } catch (e) {
      reject(e);
    }
  });
};

const parse = async () => {
  loading.value = true;
  error.value = undefined;

  try {
    addressesList.value = await parseCsv(addressesValue.value);
    if (addressesList.value.length > 1) emit('next');
  } catch (e: any) {
    error.value = e?.message || 'Your CSV is invalid';
  }

  loading.value = false;
};
</script>

<template>
  <div class="card">
    <div class="field">
      <label class="label">Token address (You must connect to your wallet)</label>
      <div class="relative">
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        >
          <svg
            aria-hidden="true"
            class="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>

        <select
          id="token"
          v-model="selectedTokenAddress"
          name="token"
          class="control !pl-10"
          :disabled="!isConnected || loading"
        >
          <option
            v-for="(token, index) in tokens"
            :key="index"
            :value="token.address"
          >
            {{ token.symbol }} - {{ token.balance }} - {{ token.name }}
          </option>
        </select>
      </div>
    </div>
    <div class="field">
      <label class="label">List of Addresses in CSV</label>

      <textarea
        v-model="addressesValue"
        class="mb-3 control"
        rows="6"
      ></textarea>
      <div class="flex flex-wrap items-center justify-between">
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".csv"
          @change="getCsvFile"
        />
        <button class="btn primary-alt" @click="() => fileInput.click()">
          Upload CSV
        </button>

        <span
          class="mb-2 cursor-pointer text-primary-500 hover:text-primary-600"
          @click="isCsvExampleModalActive = true"
        >
          Show Sample CSV
        </span>
      </div>
    </div>
    <div v-if="error" class="p-3 text-sm text-red-500 rounded-xl bg-red-500/20">
      {{ error }}
    </div>
    <Button
      type="primary"
      :disabled="!isConnected || loading"
      :loading="loading"
      @click="parse"
    >
      Continue
    </Button>
    <CsvExampleModal
      v-if="isCsvExampleModalActive"
      @close-modal="isCsvExampleModalActive = false"
    />
  </div>
</template>
