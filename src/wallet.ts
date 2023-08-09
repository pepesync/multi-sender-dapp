import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { environment } from './environment';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: { [environment.networkId]: environment.rpcUrl },
      chainId: environment.networkId,
      qrcodeModalOptions: {
        mobileLinks: [
          'trust',
          'metamask',
          'rainbow',
          'argent',
          'imtoken',
          'pillar',
        ],
      },
    },
  },
};

export const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions, // required
  theme: {
    background: 'rgb(39, 49, 56)',
    main: 'rgb(199, 199, 199)',
    secondary: 'rgb(136, 136, 136)',
    border: 'rgba(195, 195, 195, 0.14)',
    hover: 'rgb(16, 26, 32)',
  },
});
