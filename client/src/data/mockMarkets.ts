export interface Market {
  id: string;
  title: string;
  description: string;
  category: 'crypto' | 'rwa' | 'mantle' | 'other';
  yesOdds: number;
  noOdds: number;
  volume: number;
  liquidity: number;
  endDate: Date;
  createdAt: Date;
  resolved: boolean;
  outcome?: boolean;
  imageUrl?: string;
}

export interface Position {
  marketId: string;
  market: Market;
  side: 'yes' | 'no';
  shares: number;
  avgPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

const now = new Date();
const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

export const mockMarkets: Market[] = [
  {
    id: '1',
    title: 'Will BTC reach $150,000 by June 2025?',
    description: 'This market resolves YES if Bitcoin reaches or exceeds $150,000 USD on any major exchange (Binance, Coinbase, Kraken) before June 30, 2025 UTC.',
    category: 'crypto',
    yesOdds: 0.42,
    noOdds: 0.58,
    volume: 245000,
    liquidity: 89000,
    endDate: addDays(180),
    createdAt: addDays(-30),
    resolved: false,
  },
  {
    id: '2',
    title: 'Will Mantle TVL exceed $5B in Q1 2025?',
    description: 'Resolves YES if Mantle Network total value locked (TVL) exceeds $5 billion USD according to DefiLlama by March 31, 2025.',
    category: 'mantle',
    yesOdds: 0.67,
    noOdds: 0.33,
    volume: 156000,
    liquidity: 67000,
    endDate: addDays(90),
    createdAt: addDays(-14),
    resolved: false,
  },
  {
    id: '3',
    title: 'Will US approve spot ETH ETF by March 2025?',
    description: 'This market resolves YES if the U.S. Securities and Exchange Commission (SEC) approves at least one spot Ethereum ETF before March 31, 2025.',
    category: 'crypto',
    yesOdds: 0.78,
    noOdds: 0.22,
    volume: 520000,
    liquidity: 180000,
    endDate: addDays(60),
    createdAt: addDays(-45),
    resolved: false,
  },
  {
    id: '4',
    title: 'Will tokenized US Treasury market reach $10B?',
    description: 'Resolves YES if total tokenized US Treasury securities across all blockchains exceeds $10 billion by end of Q2 2025.',
    category: 'rwa',
    yesOdds: 0.55,
    noOdds: 0.45,
    volume: 89000,
    liquidity: 34000,
    endDate: addDays(120),
    createdAt: addDays(-7),
    resolved: false,
  },
  {
    id: '5',
    title: 'Will ETH/BTC ratio exceed 0.1 by May 2025?',
    description: 'This market resolves YES if the ETH/BTC trading ratio reaches 0.1 or higher on Binance before May 31, 2025 UTC.',
    category: 'crypto',
    yesOdds: 0.23,
    noOdds: 0.77,
    volume: 178000,
    liquidity: 62000,
    endDate: addDays(150),
    createdAt: addDays(-21),
    resolved: false,
  },
  {
    id: '6',
    title: 'Will Mantle launch native stablecoin in 2025?',
    description: 'Resolves YES if Mantle Network officially launches a native stablecoin (not bridged) before December 31, 2025.',
    category: 'mantle',
    yesOdds: 0.35,
    noOdds: 0.65,
    volume: 45000,
    liquidity: 23000,
    endDate: addDays(365),
    createdAt: addDays(-3),
    resolved: false,
  },
  {
    id: '7',
    title: 'Will BlackRock tokenize real estate by 2025?',
    description: 'Resolves YES if BlackRock announces or launches a tokenized real estate product on any blockchain before end of 2025.',
    category: 'rwa',
    yesOdds: 0.48,
    noOdds: 0.52,
    volume: 134000,
    liquidity: 56000,
    endDate: addDays(300),
    createdAt: addDays(-10),
    resolved: false,
  },
  {
    id: '8',
    title: 'Will SOL flip ETH in daily DEX volume?',
    description: 'Resolves YES if Solana DEX daily volume exceeds Ethereum DEX daily volume for at least 7 consecutive days before July 2025.',
    category: 'crypto',
    yesOdds: 0.31,
    noOdds: 0.69,
    volume: 287000,
    liquidity: 95000,
    endDate: addDays(200),
    createdAt: addDays(-5),
    resolved: false,
  },
];

export const mockPositions: Position[] = [
  {
    marketId: '1',
    market: mockMarkets[0],
    side: 'yes',
    shares: 150,
    avgPrice: 0.38,
    currentValue: 63,
    pnl: 6,
    pnlPercentage: 10.5,
  },
  {
    marketId: '2',
    market: mockMarkets[1],
    side: 'yes',
    shares: 200,
    avgPrice: 0.60,
    currentValue: 134,
    pnl: 14,
    pnlPercentage: 11.7,
  },
  {
    marketId: '5',
    market: mockMarkets[4],
    side: 'no',
    shares: 100,
    avgPrice: 0.72,
    currentValue: 77,
    pnl: 5,
    pnlPercentage: 6.9,
  },
];

export const getCategoryLabel = (category: Market['category']) => {
  const labels = {
    crypto: 'Crypto',
    rwa: 'RWA',
    mantle: 'Mantle Ecosystem',
    other: 'Other',
  };
  return labels[category];
};

export const getCategoryColor = (category: Market['category']) => {
  const colors = {
    crypto: 'bg-primary/20 text-primary',
    rwa: 'bg-warning/20 text-warning',
    mantle: 'bg-success/20 text-success',
    other: 'bg-muted text-muted-foreground',
  };
  return colors[category];
};

export const formatVolume = (volume: number) => {
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
  return `$${volume}`;
};

export const formatTimeRemaining = (endDate: Date) => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff < 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};
