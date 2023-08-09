<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AppHeader from './components/AppHeader.vue';
import { environment } from './environment';
import { useTheme } from './store/theme';
import TabsHeader from './components/TabsHeader.vue';
import PrepareStage from './components/PrepareStage.vue';
import ApproveStage from './components/ApproveStage.vue';
import SendStage from './components/SendStage.vue';
import TransactionHistory from './components/TransactionHistory.vue';

const { setTheme, theme } = useTheme();
const title = environment.meta.title;
const description = environment.meta.description;
const imageUrl = '/images/logo.png';

const activeTab = ref(0);
const tabs = ['prepare', 'approve', 'multisend', 'transactions'];

onMounted(() => {
  setTheme(theme);
});
</script>

<template>
  <teleport to="head">
    <title>{{ title }}</title>
    <meta name="description" :content="description" />
    <meta name="og:title" :content="title" />
    <meta name="og:description" :content="description" />
    <meta name="og:image" :content="imageUrl" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" :content="title" />
    <meta name="twitter:description" :content="description" />
    <meta name="twitter:image" :content="imageUrl" />
  </teleport>
  <main class="flex flex-col min-h-screen">
    <AppHeader />
    <div class="container flex-1 px-4 py-6 mx-auto">
      <div class="flex flex-wrap gap-5">
        <div class="mx-auto max-w-full w-[45rem]">
          <h1 class="mb-4 text-4xl lg:pt-20 font-extrabold tracking-tight leading-none text-gray-900 md:text-3xl lg:text-4xl text-center dark:text-white">Cryptocurrency Bulk Sender</h1>
          <p class="mb-4 text-lg font-normal text-gray-500 lg:text-xl text-center dark:text-gray-400">
            Use ZiLab Crypto Bulk Sender for Airdrop rewards or increase holder amount of your token with just a few clicks.
          </p>

          <TabsHeader
            :tabs="tabs"
            :active="activeTab"
            @change="(index) => (activeTab = index)"
          />

          <PrepareStage
            v-if="tabs[activeTab] === 'prepare'"
            @next="() => activeTab++"
          />

          <ApproveStage
            v-else-if="tabs[activeTab] === 'approve'"
            @next="() => activeTab++"
          />

          <SendStage
            v-else-if="tabs[activeTab] === 'multisend'"
            @next="() => activeTab++"
          />

          <TransactionHistory v-else @reset="() => (activeTab = 0)" />
        </div>
      </div>
    </div>

    <div class="w-full pb-5 text-center">
      Copyright © {{ new Date().getFullYear() }}
      All rights reserved.
    </div>
  </main>
</template>
