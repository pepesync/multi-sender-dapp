<script lang="ts" setup>
import { computed, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    limit?: number;
  }>(),
  {
    limit: 20,
  }
);

const page = ref(1);
const start = computed(() => (page.value - 1) * props.limit);
const end = computed(() => page.value * props.limit);
const totalPages = computed(() => Math.ceil(props.data.length / props.limit));

const paginateData = computed(() => props.data.slice(start.value, end.value));
</script>

<template>
  <div>
    <p class="mb-1">{{ title }}</p>

    <ul class="mb-6 divide-y divide-slate-500">
      <slot
        v-for="(item, index) in paginateData"
        :key="index"
        :item="item"
        :index="index"
        :number="index + 1 + start"
      >
      </slot>
    </ul>
    <div
      v-if="props.data.length > props.limit"
      class="flex flex-wrap items-center justify-between gap-3"
    >
      <span class="text-sm text-gray-700 dark:text-gray-400">
        Showing
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ start + 1 }}
        </span>
        to
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ end > data.length ? data.length : end }}
        </span>
        of
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ data.length }}
        </span>
        Entries
      </span>
      <div class="flex flex-wrap items-center justify-center">
        <!-- Previous Button -->
        <button
          class="inline-flex items-center px-4 py-2 mr-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          :disabled="page === 1"
          @click="page--"
        >
          <svg
            aria-hidden="true"
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
          Previous
        </button>
        <button
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          :disabled="page === totalPages"
          @click="page++"
        >
          Next
          <svg
            aria-hidden="true"
            class="w-5 h-5 ml-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
