import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import type { Chain } from 'viem';

// Kaia Kairos Testnet 체인 정의
export const kaiaKairos: Chain = {
  id: 1001,
  name: 'Kaia Kairos Testnet',
  nativeCurrency: {
    name: 'KAIA',
    symbol: 'KAIA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KaiaScan',
      url: 'https://kairos.kaiascan.io',
    },
  },
  testnet: true,
};

// wagmi config with connectors properly configured
export const config = createConfig({
  chains: [kaiaKairos],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [kaiaKairos.id]: http(),
  },
});