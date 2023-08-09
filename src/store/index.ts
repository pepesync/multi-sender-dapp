/* eslint-disable @typescript-eslint/no-explicit-any */
import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed, ref } from 'vue';

import multisenderAbi from '../contracts/multisenderAbi.json';
import tokenAbi from '../contracts/tokenAbi.json';
import Web3 from 'web3';
import { useToast } from 'vue-toastification';
import { environment } from '../environment';
import BN from 'bignumber.js';
import axios from 'axios';
import { web3Modal } from '../wallet';

export const useStore = defineStore('store', () => {
  const web3 = ref<any>(undefined);

  let provider: any = null;

  const multisender = ref<any>(undefined);

  const address = ref<string>('');

  const networkBalance = ref(0);

  const toast = useToast();

  const isConnected = ref(false);

  const loading = ref(false);

  const currentFee = ref(0);

  const arrayLimit = ref(999999);

  const transactions = ref<Transaction[]>([]);

  const txHashToIndex: any = {};

  const dublicateAddresses = ref<string[]>([]);

  let keepRunning = false;

  const nativeCurrency = {
    name: 'Binance Smart Chain Native Currency',
    symbol: 'BNB',
    balance: 0,
    address: '0x000000000000000000000000000000000000bEEF',
    decimals: 18,
  };

  const tokens = ref<Token[]>([]);

  const addressesList = ref<AddressItem[]>([]);

  const selectedTokenAddress = ref<string>(
    '0x000000000000000000000000000000000000bEEF'
  );

  const selectedToken = computed(
    () =>
      tokens.value.find(
        ({ address }: Token) => address === selectedTokenAddress.value
      ) ?? nativeCurrency
  );

  const totalAmount = computed(() =>
    addressesList.value.reduce(
      (acc: number, item: AddressItem) => (acc += +item.amount),
      0
    )
  );

  const fixedNumber = (num: number) => +parseFloat((+num).toFixed(6));

  const unitMap: any = {
    0: 'wei',
    3: 'kwei',
    6: 'mwei',
    9: 'gwei',
    12: 'szabo',
    15: 'finney',
    18: 'ether',
  };

  const formatUnit = (number: string, decimals: any = 18) =>
    web3.value.utils.fromWei(number, unitMap[decimals]);

  const parseUnit = (number: string | number, decimals: any = 18) =>
    web3.value.utils.toWei(number.toString(), unitMap[decimals]);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: web3.value.utils.toHex(environment.networkId) }],
      });
    } catch (err: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: environment.networkName,
              chainId: web3.value.utils.toHex(environment.networkId),
              nativeCurrency: {
                name: environment.networkMainToken,
                symbol: environment.networkMainToken,
              },
              rpcUrls: [environment.rpcUrl],
            },
          ],
        });
      } else {
        toast.error('Please switch to BSC Network');
        return false;
      }
    }
    return true;
  };

  const checkNetwork = async () => {
    const networkId = await web3.value.eth.net.getId();

    if (environment.networkId !== networkId) {
      const result = await switchNetwork();
      if (!result) return;
    }

    multisender.value = new web3.value.eth.Contract(
      multisenderAbi as any,
      environment.contractAddress
    );

    return true;
  };

  async function getAccount() {
    const accounts = await web3.value.eth.getAccounts();

    if (accounts && accounts.length > 0) address.value = accounts[0];

    if (!(await checkNetwork())) return;

    const netBalanceResourse = await web3.value.eth.getBalance(address.value);
    const netBalance = formatUnit(netBalanceResourse);
    networkBalance.value = netBalance;
    nativeCurrency.balance = netBalance;

    arrayLimit.value = await multisender.value.methods.arrayLimit().call();
    const currentFeeResourse = await multisender.value.methods
      .currentFee(address.value)
      .call();
    currentFee.value = formatUnit(currentFeeResourse);

    const res: any = await axios.get(
      `https://api.covalenthq.com/v1/${environment.networkId}/address/${address.value}/balances_v2/?no-nft-fetch=true&key=${environment.covalenthqApiKey}`
    );

    tokens.value = [nativeCurrency].concat(
      res.data.data.items.map((token: any) => ({
        name: token.contract_name,
        symbol: token.contract_ticker_symbol,
        balance: fixedNumber(
          formatUnit(token.balance, token.contract_decimals)
        ),
        address: token.contract_address,
        decimals: token.contract_decimals,
      }))
    );
  }

  const connectWallet = async () => {
    loading.value = true;

    provider = await web3Modal.connect();

    if (provider) {
      try {
        web3.value = new Web3(provider);

        provider.on('accountsChanged', () => getAccount());

        provider.on('chainChanged', () => getAccount());

        const accounts = await web3.value.eth.getAccounts();

        address.value = accounts[0];

        if (address.value) isConnected.value = true;

        if (!(await checkNetwork())) return;

        await getAccount();
      } catch (e) {
        console.log(e);
        toast.error('Connect grant failed! Please login again');
      }
    }

    loading.value = false;
  };

  const disconnectWallet = async () => {
    if (provider.close) {
      await provider.close();
      provider = null;
    }

    await web3Modal.clearCachedProvider();

    address.value = '';

    isConnected.value = false;
  };

  const approve = async () => {
    keepRunning = true;
    loading.value = true;

    if (selectedTokenAddress.value === nativeCurrency.address) return;
    const tokenContract = new web3.value.eth.Contract(
      tokenAbi,
      selectedTokenAddress.value
    );
    const allowance = await tokenContract.methods
      .allowance(address.value, environment.contractAddress)
      .call();

    // if(new BN(this.tokenStore.totalBalance).gt(new BN(allowance))){

    if (!Number(allowance)) {
      // @todo: make allownace optional with fixed number
      try {
        await tokenContract.methods
          .approve(
            environment.contractAddress,
            parseUnit('9999999999999999999999999999')
          )
          .send({ from: address.value });
        toast.success('Spend approved!');
      } finally {
        loading.value = false;
      }
    }
  };

  const multisendTransactions = async ({ slice, addPerTx }: any) => {
    if (!keepRunning) {
      return;
    }
    loading.value = true;

    try {
      const start = (slice - 1) * addPerTx;
      const end = slice * addPerTx;

      const list = addressesList.value.slice(start, end);
      const token: Token =
        tokens.value.find(
          (token: Token) => token.address === selectedTokenAddress.value
        ) ?? nativeCurrency;

      const addresses = list.map((item: AddressItem) => item.address);
      const balances = list.map((item: AddressItem) =>
        parseUnit(item.amount, token.decimals)
      );

      let ethValue;
      if (
        selectedTokenAddress.value ===
        '0x000000000000000000000000000000000000bEEF'
      ) {
        const totalInWei = balances.reduce((total, num) => {
          return new BN(total).plus(new BN(num));
        });
        const totalInEth = web3.value.utils.fromWei(totalInWei.toString());
        ethValue = new BN(currentFee.value).plus(totalInEth);
      } else {
        ethValue = new BN(currentFee.value);
      }

      const encodedData = await multisender.value.methods
        .multisendToken(selectedTokenAddress.value, addresses, balances)
        .encodeABI({ from: address.value });
      const gas = await web3.value.eth.estimateGas({
        from: address.value,
        data: encodedData,
        value: web3.value.utils.toHex(
          web3.value.utils.toWei(ethValue.toString())
        ),
        to: environment.contractAddress,
      });
      multisender.value.methods
        .multisendToken(selectedTokenAddress.value, addresses, balances)
        .send({
          from: address.value,
          gas: web3.value.utils.toHex(gas + 150000),
          value: web3.value.utils.toHex(
            web3.value.utils.toWei(ethValue.toString())
          ),
        })
        .on('transactionHash', (hash: string) => {
          txHashToIndex[hash] = transactions.value.length;
          transactions.value.push({
            status: 'pending',
            name: `Sending Batch #${transactions.value.length + 1} ${
              token.symbol
            }\n From ${addresses[0]} to: ${addresses[addresses.length - 1]} `,
            hash,
          });
          getTxStatus(hash);
        })
        .on('error', (error: any) => {
          toast.error('Error!', error.message);
        });
      slice--;

      if (slice > 0) {
        multisendTransactions({ slice, addPerTx });
      }
    } finally {
      loading.value = false;
    }
  };

  const getTxStatus = async (hash: string) => {
    if (!keepRunning) {
      return;
    }
    setTimeout(() => {
      web3.value.eth.getTransactionReceipt(hash, (error: any, res: any) => {
        if (res && res.blockNumber) {
          if (res.status) {
            const index = txHashToIndex[hash];
            transactions.value[index].status = `mined`;
          } else {
            const index = txHashToIndex[hash];
            transactions.value[index].status = `error`;
            transactions.value[
              index
            ].name = `Mined but with errors. Perhaps out of gas`;
          }
        } else {
          getTxStatus(hash);
        }
      });
    }, 3000);
  };

  const reset = () => {
    transactions.value = [];
    addressesList.value = [];
  };

  return {
    web3,
    provider,
    isConnected,
    loading,
    tokens,
    address,
    addressesList,
    selectedTokenAddress,
    networkBalance,
    nativeCurrency,
    transactions,
    arrayLimit,
    selectedToken,
    totalAmount,
    dublicateAddresses,
    currentFee,
    connectWallet,
    disconnectWallet,
    fixedNumber,
    approve,
    multisendTransactions,
    reset,
  } as const;
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStore, import.meta.hot));
}
