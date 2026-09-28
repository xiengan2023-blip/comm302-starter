import heroExplorerImg from '../assets/images/hero_market_explorer_1790582809804.jpg';
import ideaNvdaImg from '../assets/images/idea_chart_nvda_1790582830888.jpg';
import ideaBtcImg from '../assets/images/idea_chart_btc_1790582845025.jpg';
import newsFedImg from '../assets/images/news_fed_macro_1790582858260.jpg';

export { heroExplorerImg, ideaNvdaImg, ideaBtcImg, newsFedImg };

export type AssetCategory = 'Indices' | 'Stocks' | 'Crypto' | 'Futures' | 'Forex' | 'Bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface MarketSymbol {
  ticker: string;
  name: string;
  exchange: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  relVolume: number;
  marketCap: string;
  peRatio: string;
  eps: string;
  sector: string;
  rsi14: number;
  high52w: number;
  low52w: number;
  rating: TechnicalRating;
  currency: string;
  decimals: number;
  seed: number;
  description: string;
}

export interface CandlePoint {
  time: number; // unix timestamp seconds
  label: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  bbUpper?: number;
  bbLower?: number;
  vwap?: number;
  rsi?: number;
}

export interface TradeIdea {
  id: string;
  title: string;
  ticker: string;
  exchange: string;
  timeframe: string;
  direction: 'Long' | 'Short' | 'Educational';
  author: string;
  authorRole: string;
  publishedAt: string;
  summary: string;
  thesisPoints: string[];
  targetPrice: string;
  invalidationPrice: string;
  boosts: number;
  commentsCount: number;
  imageUrl: string;
  indicatorsUsed: string[];
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  currency: string;
  event: string;
  impact: 'High' | 'Medium' | 'Low';
  actual: string;
  forecast: string;
  previous: string;
}

export interface MarketNewsItem {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  relatedTicker: string;
  category: string;
  summary: string;
  imageUrl?: string;
}

export const INITIAL_SYMBOLS: MarketSymbol[] = [
  // Indices
  {
    ticker: 'SPX',
    name: 'S&P 500 Index',
    exchange: 'SP',
    category: 'Indices',
    price: 5984.40,
    change: 46.85,
    changePercent: 0.79,
    volume: '3.48B',
    relVolume: 1.14,
    marketCap: '51.2T',
    peRatio: '27.4',
    eps: '218.40',
    sector: 'Broad Market Index',
    rsi14: 61.8,
    high52w: 6020.15,
    low52w: 4953.56,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 101,
    description: 'Standard & Poor’s 500 tracking 500 large-cap US public companies across 11 GICS sectors.'
  },
  {
    ticker: 'NDX',
    name: 'Nasdaq 100 Index',
    exchange: 'NASDAQ',
    category: 'Indices',
    price: 21142.75,
    change: 248.10,
    changePercent: 1.19,
    volume: '5.12B',
    relVolume: 1.28,
    marketCap: '26.8T',
    peRatio: '33.8',
    eps: '625.50',
    sector: 'Technology & Growth Index',
    rsi14: 64.4,
    high52w: 21310.00,
    low52w: 17032.40,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 102,
    description: 'Includes 100 of the largest domestic and international non-financial companies listed on Nasdaq.'
  },
  {
    ticker: 'DJI',
    name: 'Dow Jones Industrial Average',
    exchange: 'DJ',
    category: 'Indices',
    price: 43918.20,
    change: -92.40,
    changePercent: -0.21,
    volume: '412.6M',
    relVolume: 0.94,
    marketCap: '16.9T',
    peRatio: '23.1',
    eps: '1901.20',
    sector: 'Industrial Blue-Chip',
    rsi14: 53.2,
    high52w: 44486.70,
    low52w: 37611.56,
    rating: 'Neutral',
    currency: 'USD',
    decimals: 2,
    seed: 103,
    description: 'Price-weighted measurement stock market index of 30 prominent companies listed on US exchanges.'
  },
  {
    ticker: 'NI225',
    name: 'Nikkei 225 Index',
    exchange: 'TVC',
    category: 'Indices',
    price: 39480.50,
    change: 315.00,
    changePercent: 0.80,
    volume: '1.19B',
    relVolume: 1.07,
    marketCap: '6.8T',
    peRatio: '21.6',
    eps: '1827.80',
    sector: 'Japan Benchmark Index',
    rsi14: 57.9,
    high52w: 42426.77,
    low52w: 31156.12,
    rating: 'Buy',
    currency: 'JPY',
    decimals: 2,
    seed: 104,
    description: 'Price-weighted equity index for the Tokyo Stock Exchange tracking 225 large Japanese corporations.'
  },

  // Stocks
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 142.85,
    change: 4.32,
    changePercent: 3.12,
    volume: '68.4M',
    relVolume: 1.46,
    marketCap: '3.49T',
    peRatio: '54.2',
    eps: '2.64',
    sector: 'Electronic Technology',
    rsi14: 66.8,
    high52w: 149.76,
    low52w: 75.60,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 201,
    description: 'Designs and supplies accelerated computing platforms, data center GPUs, and enterprise networking architecture.'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 234.60,
    change: 1.85,
    changePercent: 0.79,
    volume: '44.2M',
    relVolume: 1.02,
    marketCap: '3.56T',
    peRatio: '35.6',
    eps: '6.59',
    sector: 'Consumer Hardware & Services',
    rsi14: 58.1,
    high52w: 237.23,
    low52w: 164.08,
    rating: 'Buy',
    currency: 'USD',
    decimals: 2,
    seed: 202,
    description: 'Designs, manufactures, and markets smartphones, personal computers, wearables, and digital services.'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 446.20,
    change: 5.10,
    changePercent: 1.16,
    volume: '21.9M',
    relVolume: 1.11,
    marketCap: '3.31T',
    peRatio: '37.1',
    eps: '12.03',
    sector: 'Cloud & Enterprise Software',
    rsi14: 60.4,
    high52w: 468.35,
    low52w: 385.58,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 203,
    description: 'Develops enterprise cloud infrastructure (Azure), productivity applications, and operating systems.'
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 338.45,
    change: -8.15,
    changePercent: -2.35,
    volume: '91.7M',
    relVolume: 1.62,
    marketCap: '1.07T',
    peRatio: '89.4',
    eps: '3.78',
    sector: 'Automotive & Energy Storage',
    rsi14: 44.2,
    high52w: 358.64,
    low52w: 138.80,
    rating: 'Neutral',
    currency: 'USD',
    decimals: 2,
    seed: 204,
    description: 'Designs, manufactures, and sells electric vehicles, grid-scale battery energy storage, and solar solutions.'
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 214.90,
    change: 3.45,
    changePercent: 1.63,
    volume: '39.8M',
    relVolume: 1.19,
    marketCap: '2.25T',
    peRatio: '43.8',
    eps: '4.91',
    sector: 'Retail & Cloud Infrastructure',
    rsi14: 63.5,
    high52w: 215.90,
    low52w: 151.61,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 205,
    description: 'Global e-commerce logistics leader and cloud computing infrastructure provider via AWS.'
  },
  {
    ticker: 'META',
    name: 'Meta Platforms, Inc.',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 608.75,
    change: 11.40,
    changePercent: 1.91,
    volume: '14.6M',
    relVolume: 1.24,
    marketCap: '1.54T',
    peRatio: '29.2',
    eps: '20.85',
    sector: 'Digital Advertising & Social',
    rsi14: 65.1,
    high52w: 612.40,
    low52w: 414.50,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 206,
    description: 'Operates global social networking platforms, digital advertising infrastructure, and open-weights AI research.'
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    exchange: 'NASDAQ',
    category: 'Stocks',
    price: 156.30,
    change: -2.95,
    changePercent: -1.85,
    volume: '48.1M',
    relVolume: 1.09,
    marketCap: '253.4B',
    peRatio: '46.5',
    eps: '3.36',
    sector: 'Semiconductors',
    rsi14: 41.8,
    high52w: 227.30,
    low52w: 131.12,
    rating: 'Sell',
    currency: 'USD',
    decimals: 2,
    seed: 207,
    description: 'Semiconductor company designing EPYC server processors, Instinct accelerators, and Ryzen client CPUs.'
  },

  // Crypto
  {
    ticker: 'BTCUSD',
    name: 'Bitcoin / U.S. Dollar',
    exchange: 'COINBASE',
    category: 'Crypto',
    price: 94680.00,
    change: 2410.50,
    changePercent: 2.61,
    volume: '48.2B',
    relVolume: 1.54,
    marketCap: '1.87T',
    peRatio: '—',
    eps: '—',
    sector: 'Layer-1 Digital Reserve',
    rsi14: 68.4,
    high52w: 99588.00,
    low52w: 52550.00,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 301,
    description: 'Decentralized proof-of-work digital currency and institutional liquidity benchmark.'
  },
  {
    ticker: 'ETHUSD',
    name: 'Ethereum / U.S. Dollar',
    exchange: 'COINBASE',
    category: 'Crypto',
    price: 3428.50,
    change: 84.20,
    changePercent: 2.52,
    volume: '24.6B',
    relVolume: 1.38,
    marketCap: '412.8B',
    peRatio: '—',
    eps: '—',
    sector: 'Smart Contract Settlement',
    rsi14: 61.2,
    high52w: 4092.00,
    low52w: 2116.00,
    rating: 'Buy',
    currency: 'USD',
    decimals: 2,
    seed: 302,
    description: 'Decentralized proof-of-stake smart contract platform and DeFi settlement layer.'
  },
  {
    ticker: 'SOLUSD',
    name: 'Solana / U.S. Dollar',
    exchange: 'COINBASE',
    category: 'Crypto',
    price: 238.40,
    change: 11.80,
    changePercent: 5.21,
    volume: '9.8B',
    relVolume: 1.78,
    marketCap: '113.1B',
    peRatio: '—',
    eps: '—',
    sector: 'High-Throughput L1',
    rsi14: 71.5,
    high52w: 264.39,
    low52w: 110.00,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 303,
    description: 'High-throughput Layer-1 blockchain optimized for low-latency on-chain orderbooks and consumer apps.'
  },

  // Futures & Commodities
  {
    ticker: 'XAUUSD',
    name: 'Gold Spot / U.S. Dollar',
    exchange: 'OANDA',
    category: 'Futures',
    price: 2714.80,
    change: 18.60,
    changePercent: 0.69,
    volume: '214.5K',
    relVolume: 1.15,
    marketCap: '18.2T',
    peRatio: '—',
    eps: '—',
    sector: 'Precious Metals',
    rsi14: 62.7,
    high52w: 2790.15,
    low52w: 1984.30,
    rating: 'Strong Buy',
    currency: 'USD',
    decimals: 2,
    seed: 401,
    description: 'Spot price of physical gold per troy ounce quoted in United States Dollars.'
  },
  {
    ticker: 'USOIL',
    name: 'WTI Crude Oil Futures',
    exchange: 'NYMEX',
    category: 'Futures',
    price: 69.42,
    change: -1.18,
    changePercent: -1.67,
    volume: '842.1K',
    relVolume: 1.21,
    marketCap: '—',
    peRatio: '—',
    eps: '—',
    sector: 'Energy Commodities',
    rsi14: 43.1,
    high52w: 87.63,
    low52w: 65.27,
    rating: 'Sell',
    currency: 'USD',
    decimals: 2,
    seed: 402,
    description: 'West Texas Intermediate light sweet crude oil benchmark futures contract.'
  },

  // Forex
  {
    ticker: 'EURUSD',
    name: 'Euro / U.S. Dollar',
    exchange: 'FX_IDC',
    category: 'Forex',
    price: 1.0584,
    change: 0.0042,
    changePercent: 0.40,
    volume: '142.8B',
    relVolume: 1.06,
    marketCap: '—',
    peRatio: '—',
    eps: '—',
    sector: 'G10 Currency Pair',
    rsi14: 51.4,
    high52w: 1.1214,
    low52w: 1.0332,
    rating: 'Neutral',
    currency: 'USD',
    decimals: 4,
    seed: 501,
    description: 'Spot exchange rate between the Eurozone Euro and the United States Dollar.'
  },
  {
    ticker: 'USDJPY',
    name: 'U.S. Dollar / Japanese Yen',
    exchange: 'FX_IDC',
    category: 'Forex',
    price: 151.62,
    change: -0.84,
    changePercent: -0.55,
    volume: '118.4B',
    relVolume: 1.18,
    marketCap: '—',
    peRatio: '—',
    eps: '—',
    sector: 'G10 Currency Pair',
    rsi14: 46.8,
    high52w: 161.95,
    low52w: 139.58,
    rating: 'Sell',
    currency: 'JPY',
    decimals: 2,
    seed: 502,
    description: 'Spot exchange rate between the United States Dollar and the Japanese Yen.'
  },

  // Bonds
  {
    ticker: 'US10Y',
    name: 'U.S. 10-Year Treasury Yield',
    exchange: 'TVC',
    category: 'Bonds',
    price: 4.248,
    change: -0.036,
    changePercent: -0.84,
    volume: '—',
    relVolume: 1.01,
    marketCap: '—',
    peRatio: '—',
    eps: '—',
    sector: 'Sovereign Fixed Income',
    rsi14: 48.5,
    high52w: 4.739,
    low52w: 3.603,
    rating: 'Neutral',
    currency: '%',
    decimals: 3,
    seed: 601,
    description: 'Yield to maturity on the benchmark 10-year United States Treasury Note.'
  },
  {
    ticker: 'US02Y',
    name: 'U.S. 2-Year Treasury Yield',
    exchange: 'TVC',
    category: 'Bonds',
    price: 4.112,
    change: -0.028,
    changePercent: -0.68,
    volume: '—',
    relVolume: 0.98,
    marketCap: '—',
    peRatio: '—',
    eps: '—',
    sector: 'Sovereign Fixed Income',
    rsi14: 47.2,
    high52w: 5.042,
    low52w: 3.541,
    rating: 'Neutral',
    currency: '%',
    decimals: 3,
    seed: 602,
    description: 'Short-end Treasury yield sensitive to Federal Open Market Committee policy expectations.'
  }
];

export const COMMUNITY_IDEAS: TradeIdea[] = [
  {
    id: 'idea-nvda-breakout',
    title: 'NVDA: Ascending Channel Consolidation Above $138 Institutional VWAP Anchor',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    timeframe: '1D',
    direction: 'Long',
    author: 'QuantStructure_Alpha',
    authorRole: 'Pro Quantitative Strategist',
    publishedAt: '3 hours ago',
    summary: 'NVIDIA continues to respect its multi-month ascending channel after absorbing supply near $140. Volume profile shows heavy institutional accumulation between $135.50 and $138.20 with RSI resetting cleanly above the 55 midline.',
    thesisPoints: [
      'Anchored VWAP from the August swing low holds at $136.40 as primary institutional defense.',
      '20-day EMA crossed above the upper volume value area with expanding positive delta.',
      'Measured extension targets the 1.618 Fibonacci projection at $158.00 if daily close holds above $145.00.'
    ],
    targetPrice: '$158.00',
    invalidationPrice: '$133.80',
    boosts: 642,
    commentsCount: 89,
    imageUrl: ideaNvdaImg,
    indicatorsUsed: ['EMA 20/50', 'VWAP', 'Volume']
  },
  {
    id: 'idea-btc-macro',
    title: 'BTCUSD: Spot ETF Inflow Impulse & Macro Liquidity Flag Targeting $102K',
    ticker: 'BTCUSD',
    exchange: 'COINBASE',
    timeframe: '4H',
    direction: 'Long',
    author: 'MacroFlow_Desk',
    authorRole: 'Digital Asset Macro Research',
    publishedAt: '5 hours ago',
    summary: 'Bitcoin is compressing inside a tight high-timeframe bull pennant following a +28% impulse leg. Orderbook depth and declining exchange reserves point to supply exhaustion below $95,000.',
    thesisPoints: [
      'Bollinger Band bandwidth on the 4H chart has contracted to 30-day lows, preceding volatility expansion.',
      'Coinbase spot premium remains positive during US trading hours alongside sustained ETF creations.',
      'Break above $96,200 unlocks the psychological $100,000–$102,500 liquidity pocket.'
    ],
    targetPrice: '$102,500',
    invalidationPrice: '$89,400',
    boosts: 918,
    commentsCount: 147,
    imageUrl: ideaBtcImg,
    indicatorsUsed: ['Bollinger Bands', 'RSI 14', 'EMA 20/50']
  },
  {
    id: 'idea-spx-yields',
    title: 'SPX & US10Y: Real Yield Compression Supports Year-End S&P 500 Rotation to 6,120',
    ticker: 'SPX',
    exchange: 'SP',
    timeframe: '1D',
    direction: 'Educational',
    author: 'Helena_Vance_CFA',
    authorRole: 'Cross-Asset Portfolio Strategist',
    publishedAt: '7 hours ago',
    summary: 'As the 10-Year Treasury yield stabilizes below 4.30%, equity risk premia across cyclical and software components of the S&P 500 are expanding without triggering valuation multiple compression.',
    thesisPoints: [
      'Equal-weight S&P 500 breadth (% of stocks above 50-day MA) recovered from 54% to 69%.',
      '10-Year yield rejection at 4.45% removes headwind for long-duration technology cash flows.',
      'Key support cluster sits at 5,890–5,910 (prior breakout structure).'
    ],
    targetPrice: '6,120.00',
    invalidationPrice: '5,865.00',
    boosts: 429,
    commentsCount: 54,
    imageUrl: newsFedImg,
    indicatorsUsed: ['EMA 20/50', 'RSI 14']
  }
];

export const ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: 'eco-1',
    time: '08:30 EST',
    country: 'United States',
    currency: 'USD',
    event: 'Core PCE Price Index (YoY)',
    impact: 'High',
    actual: '2.7%',
    forecast: '2.7%',
    previous: '2.6%'
  },
  {
    id: 'eco-2',
    time: '08:30 EST',
    country: 'United States',
    currency: 'USD',
    event: 'Initial Jobless Claims',
    impact: 'High',
    actual: '213K',
    forecast: '220K',
    previous: '215K'
  },
  {
    id: 'eco-3',
    time: '10:00 EST',
    country: 'Eurozone',
    currency: 'EUR',
    event: 'ECB Consumer Inflation Expectations',
    impact: 'Medium',
    actual: '2.4%',
    forecast: '2.5%',
    previous: '2.7%'
  },
  {
    id: 'eco-4',
    time: '14:00 EST',
    country: 'United States',
    currency: 'USD',
    event: 'FOMC Minutes & Balance Sheet Release',
    impact: 'High',
    actual: '—',
    forecast: '—',
    previous: '—'
  },
  {
    id: 'eco-5',
    time: '18:50 EST',
    country: 'Japan',
    currency: 'JPY',
    event: 'BoJ Core CPI (YoY)',
    impact: 'Medium',
    actual: '2.2%',
    forecast: '2.1%',
    previous: '2.0%'
  }
];

export const MARKET_NEWS: MarketNewsItem[] = [
  {
    id: 'news-1',
    headline: 'Hyperscaler AI Capital Expenditure Projections Raised 18% Through FY2027 on Rack-Scale GPU Demand',
    source: 'Reuters Financial',
    publishedAt: '24 minutes ago',
    relatedTicker: 'NVDA',
    category: 'Semiconductors',
    summary: 'Supply chain checks across Taiwanese foundry and CoWoS packaging partners indicate full capacity utilization extending into Q3 next year.',
    imageUrl: ideaNvdaImg
  },
  {
    id: 'news-2',
    headline: 'Treasury 10-Year Yield Edges Lower to 4.248% as Institutional Duration Buyers Step In At Auction',
    source: 'MarketWatch Macro',
    publishedAt: '1 hour ago',
    relatedTicker: 'US10Y',
    category: 'Fixed Income',
    summary: 'Indirect bidder takedown reached 71.4% in the latest Treasury auction, signaling firm foreign and domestic pension appetite for sovereign duration.',
    imageUrl: newsFedImg
  },
  {
    id: 'news-3',
    headline: 'Spot Bitcoin & Ethereum ETPs Record $1.14B Combined Weekly Net Inflows Led by Institutional Allocations',
    source: 'CoinDesk Institutional',
    publishedAt: '2 hours ago',
    relatedTicker: 'BTCUSD',
    category: 'Digital Assets',
    summary: 'Quarterly 13F filings reveal expanded allocations from university endowments and multi-strategy macro hedge funds.',
    imageUrl: ideaBtcImg
  },
  {
    id: 'news-4',
    headline: 'Euro Stabilizes Above 1.0580 After Eurozone Services PMI Beats Consensus Estimates',
    source: 'FXStreet Desk',
    publishedAt: '3 hours ago',
    relatedTicker: 'EURUSD',
    category: 'Currencies',
    summary: 'Resilient domestic services activity in Germany and France tempered market pricing for an aggressive 50 bps ECB rate cut.',
  },
  {
    id: 'news-5',
    headline: 'Gold Spot Holds Above $2,710 as Central Bank Reserve Diversification Continues for Fourteenth Month',
    source: 'Bullion Desk',
    publishedAt: '4 hours ago',
    relatedTicker: 'XAUUSD',
    category: 'Commodities',
    summary: 'Emerging market central banks added a net 42 metric tons to sovereign gold reserves over the past 30 days.'
  }
];

/**
 * Generates deterministic, realistic OHLCV candlestick series with computed EMA20, EMA50, Bollinger Bands, VWAP, and RSI14
 */
export function generateCandlesForSymbol(
  symbol: MarketSymbol,
  timeframe: string = '1D',
  count: number = 110
): CandlePoint[] {
  const tfMultiplier: Record<string, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1H': 3600,
    '4H': 14400,
    '1D': 86400,
    '1W': 604800
  };
  const stepSeconds = tfMultiplier[timeframe] || 86400;
  const nowSec = Math.floor(Date.now() / 1000);

  // Deterministic pseudo-random generator seeded by symbol.seed + timeframe
  let state = symbol.seed * 997 + timeframe.charCodeAt(0) * 131 + (timeframe.charCodeAt(1) || 7) * 37;
  const nextRand = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };

  // Start slightly lower or higher so the final candle lands near symbol.price
  const volatility = symbol.category === 'Crypto' ? 0.018 : symbol.category === 'Forex' ? 0.0035 : 0.012;
  const rawCloses: number[] = [];
  let cursor = symbol.price * (symbol.changePercent >= 0 ? 0.88 : 1.08);

  for (let i = 0; i < count; i++) {
    const bias = symbol.changePercent >= 0 ? 0.482 : 0.518;
    const deltaPct = (nextRand() - bias) * volatility * 2.2;
    cursor = Math.max(cursor * (1 + deltaPct), symbol.price * 0.2);
    rawCloses.push(cursor);
  }

  // Scale so the final candle close matches current symbol.price exactly
  const scaleFactor = symbol.price / rawCloses[rawCloses.length - 1];
  const candles: CandlePoint[] = [];

  for (let i = 0; i < count; i++) {
    const close = Number((rawCloses[i] * scaleFactor).toFixed(symbol.decimals));
    const prevClose = i > 0 ? candles[i - 1].close : Number((close * (1 - (nextRand() - 0.5) * volatility)).toFixed(symbol.decimals));
    const open = prevClose;
    const bodySpan = Math.abs(close - open);
    const wickUp = bodySpan * (0.35 + nextRand() * 1.15) + close * volatility * 0.25 * nextRand();
    const wickDown = bodySpan * (0.35 + nextRand() * 1.15) + close * volatility * 0.25 * nextRand();
    const high = Number((Math.max(open, close) + wickUp).toFixed(symbol.decimals));
    const low = Number((Math.min(open, close) - wickDown).toFixed(symbol.decimals));
    const timestamp = nowSec - (count - 1 - i) * stepSeconds;
    const dateObj = new Date(timestamp * 1000);

    let label = '';
    if (stepSeconds < 86400) {
      label = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      label = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    const volBase = symbol.seed * 12000;
    const volume = Math.round(volBase * (0.5 + nextRand() * 1.6) * (1 + (bodySpan / close) * 40));

    candles.push({
      time: timestamp,
      label,
      open,
      high,
      low,
      close,
      volume
    });
  }

  // Compute EMA 20, EMA 50, Bollinger Bands (20, 2), VWAP, and RSI 14
  const k20 = 2 / (20 + 1);
  const k50 = 2 / (50 + 1);
  let ema20 = candles[0].close;
  let ema50 = candles[0].close;
  let cumPV = 0;
  let cumVol = 0;
  let avgGain = 0.0001;
  let avgLoss = 0.0001;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    ema20 = c.close * k20 + ema20 * (1 - k20);
    ema50 = c.close * k50 + ema50 * (1 - k50);
    c.ema20 = Number(ema20.toFixed(symbol.decimals));
    c.ema50 = Number(ema50.toFixed(symbol.decimals));

    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumPV += typicalPrice * c.volume;
    cumVol += c.volume;
    c.vwap = Number((cumPV / Math.max(cumVol, 1)).toFixed(symbol.decimals));

    // Bollinger Bands (20 period)
    const sliceStart = Math.max(0, i - 19);
    const windowSlice = candles.slice(sliceStart, i + 1);
    const mean = windowSlice.reduce((acc, item) => acc + item.close, 0) / windowSlice.length;
    const variance = windowSlice.reduce((acc, item) => acc + Math.pow(item.close - mean, 2), 0) / windowSlice.length;
    const stdDev = Math.sqrt(variance);
    c.bbUpper = Number((mean + 2 * stdDev).toFixed(symbol.decimals));
    c.bbLower = Number((mean - 2 * stdDev).toFixed(symbol.decimals));

    // RSI 14
    if (i > 0) {
      const diff = c.close - candles[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * 13 + gain) / 14;
      avgLoss = (avgLoss * 13 + loss) / 14;
      const rs = avgGain / Math.max(avgLoss, 1e-9);
      c.rsi = Number((100 - 100 / (1 + rs)).toFixed(1));
    } else {
      c.rsi = 54.0;
    }
  }

  return candles;
}
