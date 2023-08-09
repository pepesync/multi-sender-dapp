<template>
  <div
    class="fixed inset-0 px-4 pt-16 bg-opacity-50 z-4 bg-slate-700"
    @click="clickOutside"
  >
    <div
      ref="dialog"
      class="max-h-[80vh] w-[40rem] overflow-y-auto px-4 w-lg max-w-full bg-white dark:bg-slate-700 rounded-2xl shadow-lg mx-auto py-4"
    >
      <div class="flex items-center justify-between pb-4">
        <p class="text-xl text-white">Example CSV</p>
        <button class="block ml-auto group" @click="$emit('closeModal')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="modal-close-icon group-hover:bg-slate-700 group-hover:text-slate-200 dark:group-hover:bg-slate-200 dark:group-hover:text-slate-900"
            viewBox="0 0 512 512"
          >
            <title>Close modal</title>
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="32"
              d="M368 368L144 144M368 144L144 368"
            />
          </svg>
        </button>
      </div>
      <p class="mb-3 text-gray-300">Ex: Address, Balance</p>

      <div class="p-4 text-white rounded-xl bg-slate-500">
        0x14b02E90305Cb16493475cb764194CCDA163c46C,12 <br />
        0x9893Ccf1070B61D44295EA9A668142b8350D8eC4,113.45 <br />
        0xfFe46696dA1E322EB80e9b04D7b324292d725B64,1.049 <br />
        0xd6297dc08a53abF0d965c9ab3DCD1bAeA30fa029,14546 <br />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits(['closeModal']);

const dialog = ref<HTMLElement>();
const clickOutside = (event: Event): void => {
  const childElement = dialog.value;
  if (
    event.target instanceof HTMLElement &&
    !childElement?.contains(event.target)
  ) {
    emit('closeModal');
  }
};
</script>

<style scoped>
.modal-close-icon {
  @apply w-6 h-6 border border-slate-900 dark:border-slate-200 rounded-full transition duration-300;
}
</style>
