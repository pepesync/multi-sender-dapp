<template>
  <header>
    <nav
      class="container flex flex-wrap items-center justify-between gap-2 p-4 mx-auto xl:gap-5"
    >
      <a href="/" class="flex items-center w-auto gap-3 xl:w-96">
        <img :src="environment.logo" alt="logo" class="h-8 xl:h-12" />
        <p
          class="text-lg font-bold uppercase transition xl:text-3xl hover:text-blue-500"
        >
          {{ environment.title }}
        </p>
      </a>
      <div class="flex justify-end w-auto flex-center xl:w-96">
        <WalletConnectButton />

        <a
          :href="environment.telegramUrl"
          target="_blank"
          class="flex items-center justify-center p-2 ml-2 font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 sm:w-auto bg-sky-500 highlight-white/20 hover:bg-sky-400"
        >
          <img
            src="/images/telegram.svg"
            alt="telegram"
            class="h-5 mx-2 text-white"
          />
          <span class="hidden xl:block">Telegram</span>
        </a>
        <!-- <theme-toggle /> -->
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { environment } from '../environment';
import WalletConnectButton from './WalletConnectButton.vue';
</script>
