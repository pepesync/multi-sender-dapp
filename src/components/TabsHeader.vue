<script lang="ts" setup>
const props = defineProps<{
  tabs: string[];
  active: number;
}>();
const emit = defineEmits<{
  (e: 'change', index: number): void;
}>();
const change = (index: number) => {
  if (index >= props.active) return;
  emit('change', index);
};
</script>

<template>
  <div class="w-full py-6">
    <div class="flex">
      <div v-for="(tab, index) in tabs" :key="index" class="w-1/3">
        <div
          class="relative mb-2"
          :class="{ 'cursor-pointer': index < active }"
          @click="change(index)"
        >
          <div
            v-if="index !== 0"
            class="absolute flex items-center top-[50%] -translate-x-1/2 -translate-y-1/2 content-center align-middle align-center"
            style="width: calc(100% - 2.5rem - 1rem)"
          >
            <div
              class="items-center flex-1 w-full align-middle bg-gray-200 rounded-xl align-center"
            >
              <div
                :class="`${
                  index <= active ? 'w-100' : 'w-0'
                } h-1 bg-primary-500 rounded`"
              ></div>
            </div>
          </div>
          <div
            class="flex items-center justify-center mx-auto text-lg text-white border-2 rounded-full border-primary-500 w-7 h-7"
          >
            <span
              v-if="index <= active"
              class="w-4 h-4 text-white rounded-full bg-primary-500"
            />
          </div>
        </div>
        <div class="text-xs text-center capitalize">
          {{ tab }}
        </div>
      </div>
    </div>
  </div>
</template>
