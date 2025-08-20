import { createConfig, http } from 'wagmi';
import { Chain } from 'viem';

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

// 심플한 wagmi config (MetaMask만 지원)
export const config = createConfig({
  chains: [kaiaKairos],
  transports: {
    [kaiaKairos.id]: http(),
  },
});