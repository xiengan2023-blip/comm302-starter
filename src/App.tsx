import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ThumbsUp,
  MessageSquare,
  Plus,
  Calendar,
  Newspaper,
  BarChart2,
  TrendingUp
} from 'lucide-react';
import {
  AssetCategory,
  COMMUNITY_IDEAS,
  ECONOMIC_EVENTS,
  INITIAL_SYMBOLS,
  MARKET_NEWS,
  MarketSymbol,
  TradeIdea,
  generateCandlesForSymbol,
  heroExplorerImg,
  ideaNvdaImg
} from './data/marketData';
import { FinancialChartCanvas, ChartStyleType } from './components/FinancialChartCanvas';
import { SuperchartsView } from './components/SuperchartsView';
import { ScreenerView } from './components/ScreenerView';
import { SymbolSearchModal } from './components/SymbolSearchModal';
import { IdeaModal } from './components/IdeaModal';
import { ResilientImage } from './components/ResilientImage';

type ActiveView = 'Markets' | 'Supercharts' | 'Screener' | 'Community' | 'News';

const SUMMARY_CATEGORIES: AssetCategory[] = [
  'Indices',
  'Stocks',
  'Crypto',
  'Futures',
  'Forex',
  'Bonds'
];

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('Markets');
  const [symbols, setSymbols] = useState<MarketSymbol[]>(INITIAL_SYMBOLS);

  // Market Summary state on Home view
  const [summaryCategory, setSummaryCategory] = useState<AssetCategory>('Indices');
  const [summaryTicker, setSummaryTicker] = useState<string>('SPX');
  const [summaryTimeframe, setSummaryTimeframe] = useState<string>('1D');
  const [summaryChartStyle, setSummaryChartStyle] = useState<ChartStyleType>('Area');

  // Supercharts state
  const [chartTicker, setChartTicker] = useState<string>('NVDA');
  const [presetIndicators, setPresetIndicators] = useState<string[]>([
    'EMA 20/50',
    'Volume',
    'RSI 14'
  ]);

  // Watchlist state
  const [watchlistTickers, setWatchlistTickers] = useState<string[]>([
    'SPX',
    'NDX',
    'NVDA',
    'AAPL',
    'MSFT',
    'TSLA',
    'BTCUSD',
    'ETHUSD',
    'XAUUSD',
    'EURUSD',
    'US10Y'
  ]);

  // Modals & Community Ideas state
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [ideas, setIdeas] = useState<TradeIdea[]>(COMMUNITY_IDEAS);
  const [selectedIdea, setSelectedIdea] = useState<TradeIdea | null>(null);
  const [boostedIdeaIds, setBoostedIdeaIds] = useState<string[]>([]);
  const [showPublishForm, setShowPublishForm] = useState<boolean>(false);

  // Publish New Idea Form State
  const [newIdeaTicker, setNewIdeaTicker] = useState<string>('NVDA');
  const [newIdeaDirection, setNewIdeaDirection] = useState<'Long' | 'Short'>('Long');
  const [newIdeaTitle, setNewIdeaTitle] = useState<string>('');
  const [newIdeaTarget, setNewIdeaTarget] = useState<string>('');
  const [newIdeaStop, setNewIdeaStop] = useState<string>('');
  const [newIdeaSummary, setNewIdeaSummary] = useState<string>('');

  // Market Movers tab on Home screen
  const [moversTab, setMoversTab] = useState<'Gainers' | 'Most Active' | 'Losers'>('Gainers');

  // Economic Calendar filter
  const [impactFilter, setImpactFilter] = useState<'All' | 'High'>('All');

  // Live simulated market price ticks every 2.8 seconds
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSymbols((prev) =>
        prev.map((sym) => {
          const randDelta = (Math.random() - 0.492) * (sym.category === 'Crypto' ? 0.0028 : 0.0014);
          const nextPrice = Number(
            Math.max(sym.price * (1 + randDelta), 0.0001).toFixed(sym.decimals)
          );
          const baseOpen = sym.price / (1 + sym.changePercent / 100);
          const nextChange = Number((nextPrice - baseOpen).toFixed(sym.decimals));
          const nextChangePct = Number(((nextChange / baseOpen) * 100).toFixed(2));
          return {
            ...sym,
            price: nextPrice,
            change: nextChange,
            changePercent: nextChangePct
          };
        })
      );
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut Cmd+K / Ctrl+K for Symbol Search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const summaryCategorySymbols = useMemo(
    () => symbols.filter((s) => s.category === summaryCategory),
    [symbols, summaryCategory]
  );

  const activeSummarySymbol = useMemo(
    () =>
      symbols.find((s) => s.ticker === summaryTicker) ||
      summaryCategorySymbols[0] ||
      symbols[0],
    [symbols, summaryTicker, summaryCategorySymbols]
  );

  const activeSuperchartSymbol = useMemo(
    () => symbols.find((s) => s.ticker === chartTicker) || symbols[0],
    [symbols, chartTicker]
  );

  const summaryCandles = useMemo(
    () => generateCandlesForSymbol(activeSummarySymbol, summaryTimeframe, 85),
    [activeSummarySymbol, summaryTimeframe]
  );

  const handleToggleWatchlist = (ticker: string) => {
    setWatchlistTickers((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  };

  const handleOpenInSupercharts = (symbol: MarketSymbol, customIndicators?: string[]) => {
    setChartTicker(symbol.ticker);
    if (customIndicators && customIndicators.length > 0) {
      setPresetIndicators(customIndicators);
    }
    setActiveView('Supercharts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBoostIdea = (id: string) => {
    setBoostedIdeaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePublishIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim() || !newIdeaSummary.trim()) return;
    const sym = symbols.find((s) => s.ticker === newIdeaTicker) || symbols[0];
    const created: TradeIdea = {
      id: `idea-custom-${Date.now()}`,
      title: newIdeaTitle.trim(),
      ticker: sym.ticker,
      exchange: sym.exchange,
      timeframe: '4H',
      direction: newIdeaDirection,
      author: 'ProDesk_Member',
      authorRole: 'Verified Chartist',
      publishedAt: 'Just now',
      summary: newIdeaSummary.trim(),
      thesisPoints: [
        `Key horizontal structure identified on ${sym.ticker} (${sym.exchange}).`,
        `Risk management defined with target at ${newIdeaTarget || 'next liquidity zone'} and invalidation at ${newIdeaStop || 'prior swing low'}.`
      ],
      targetPrice: newIdeaTarget.trim() || `${(sym.price * 1.06).toFixed(sym.decimals)}`,
      invalidationPrice: newIdeaStop.trim() || `${(sym.price * 0.96).toFixed(sym.decimals)}`,
      boosts: 1,
      commentsCount: 0,
      imageUrl: ideaNvdaImg,
      indicatorsUsed: ['EMA 20/50', 'VWAP', 'Volume']
    };
    setIdeas((prev) => [created, ...prev]);
    setNewIdeaTitle('');
    setNewIdeaTarget('');
    setNewIdeaStop('');
    setNewIdeaSummary('');
    setShowPublishForm(false);
  };

  // Movers list sorted by selected tab
  const moversList = useMemo(() => {
    const copy = [...symbols];
    if (moversTab === 'Gainers') {
      return copy.sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
    }
    if (moversTab === 'Losers') {
      return copy.sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
    }
    return copy.sort((a, b) => b.relVolume - a.relVolume).slice(0, 6);
  }, [symbols, moversTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-[#E2E8F0]">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#1E2433]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('Markets');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xl font-extrabold tracking-tight text-[#F8FAFC] font-display whitespace-nowrap"
        >
          TradingView
        </a>

        {/* Zone 2: 5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {(['Markets', 'Supercharts', 'Screener', 'Community', 'News'] as const).map(
            (navItem) => (
              <button
                key={navItem}
                onClick={() => {
                  setActiveView(navItem);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                  activeView === navItem
                    ? 'text-[#F8FAFC] border-[#2962FF]'
                    : 'text-[#94A3B8] border-transparent hover:text-[#F8FAFC]'
                }`}
              >
                {navItem}
              </button>
            )
          )}
        </nav>

        {/* Zone 3: 2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#CBD5E1] bg-[#131722] hover:bg-[#1E2433] border border-[#2A2E39] rounded-lg transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Search</span>
            <span className="hidden sm:inline font-mono text-[11px] text-[#64748B]">
              ⌘K
            </span>
          </button>

          <button
            onClick={() => setActiveView('Supercharts')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#2962FF] hover:bg-[#1E53E5] rounded-lg transition-colors whitespace-nowrap"
          >
            Launch Supercharts
          </button>
        </div>
      </header>

      {/* Mobile Navigation Strip (under 768px) */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 bg-[#131722] border-b border-[#1E2433] overflow-x-auto">
        {(['Markets', 'Supercharts', 'Screener', 'Community', 'News'] as const).map(
          (navItem) => (
            <button
              key={navItem}
              onClick={() => setActiveView(navItem)}
              className={`px-3 py-1 text-xs font-medium rounded whitespace-nowrap ${
                activeView === navItem
                  ? 'bg-[#2962FF] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {navItem}
            </button>
          )
        )}
      </div>

      {/* MAIN VIEW ROUTER */}
      <main className="flex-1">
        {activeView === 'Supercharts' && (
          <SuperchartsView
            selectedSymbol={activeSuperchartSymbol}
            allSymbols={symbols}
            onSelectSymbol={(sym) => setChartTicker(sym.ticker)}
            onOpenSearch={() => setSearchModalOpen(true)}
            watchlistTickers={watchlistTickers}
            onToggleWatchlist={handleToggleWatchlist}
            initialIndicators={presetIndicators}
          />
        )}

        {activeView === 'Screener' && (
          <ScreenerView
            symbols={symbols}
            onSelectSymbolForChart={(sym) => handleOpenInSupercharts(sym)}
            watchlistTickers={watchlistTickers}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}

        {activeView === 'Community' && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                  Community Trade Ideas &amp; Quantitative Research
                </h1>
                <p className="text-sm text-[#94A3B8] mt-1">
                  Actionable technical setups, institutional orderflow theses, and Pine Script indicator overlays published by global traders.
                </p>
              </div>
              <button
                onClick={() => setShowPublishForm((prev) => !prev)}
                className="px-4 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Trade Setup</span>
              </button>
            </div>

            {showPublishForm && (
              <form
                onSubmit={handlePublishIdea}
                className="mb-8 p-5 bg-[#131722] border border-[#2A2E39] rounded-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#F8FAFC]">
                    Publish New Technical Chart Idea
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPublishForm(false)}
                    className="text-xs text-[#94A3B8] hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Symbol</label>
                    <select
                      value={newIdeaTicker}
                      onChange={(e) => setNewIdeaTicker(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                    >
                      {symbols.map((s) => (
                        <option key={s.ticker} value={s.ticker}>
                          {s.ticker} — {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Direction</label>
                    <select
                      value={newIdeaDirection}
                      onChange={(e) =>
                        setNewIdeaDirection(e.target.value as 'Long' | 'Short')
                      }
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="Long">Long Setup</option>
                      <option value="Short">Short Setup</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">
                      Target Price
                    </label>
                    <input
                      type="text"
                      value={newIdeaTarget}
                      onChange={(e) => setNewIdeaTarget(e.target.value)}
                      placeholder="e.g. $160.00"
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">
                      Invalidation Level
                    </label>
                    <input
                      type="text"
                      value={newIdeaStop}
                      onChange={(e) => setNewIdeaStop(e.target.value)}
                      placeholder="e.g. $134.50"
                      className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">
                    Setup Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    placeholder="e.g. NVDA: Multi-Week Ascending Triangle Breakout Above $145"
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1">
                    Technical Thesis &amp; Key Levels
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newIdeaSummary}
                    onChange={(e) => setNewIdeaSummary(e.target.value)}
                    placeholder="Describe volume structure, key moving averages, and invalidation criteria..."
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Publish Setup to Feed
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ideas.map((idea) => {
                const isBoosted = boostedIdeaIds.includes(idea.id);
                return (
                  <article
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="flex flex-col justify-between bg-[#131722] border border-[#1E2433] hover:border-[#2E384D] rounded-xl overflow-hidden cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[#0B0E14] border-b border-[#1E2433]">
                        <ResilientImage
                          src={idea.imageUrl}
                          alt={idea.title}
                          fallbackLabel={`${idea.ticker} Technical Chart`}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                        />
                      </div>
                      <div className="p-5">
                        {/* Unboxed Metadata with · separators */}
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#94A3B8] mb-2">
                          <span className="font-mono font-semibold text-[#F8FAFC]">
                            {idea.ticker}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{idea.timeframe}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              idea.direction === 'Long'
                                ? 'text-[#089981] font-medium'
                                : idea.direction === 'Short'
                                ? 'text-[#F23645] font-medium'
                                : 'text-[#38BDF8] font-medium'
                            }
                          >
                            {idea.direction}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{idea.publishedAt}</span>
                        </div>

                        <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#60A5FA] transition-colors leading-snug mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                          {idea.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 border-t border-[#1E2433] flex items-center justify-between text-xs">
                      <div className="text-[#94A3B8] truncate pr-2">
                        By <span className="text-[#E2E8F0] font-medium">{idea.author}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBoostIdea(idea.id);
                          }}
                          className={`flex items-center gap-1 font-mono tabular-nums ${
                            isBoosted
                              ? 'text-[#60A5FA]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{idea.boosts + (isBoosted ? 1 : 0)}</span>
                        </button>
                        <span className="flex items-center gap-1 text-[#94A3B8] font-mono tabular-nums">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{idea.commentsCount}</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeView === 'News' && (
          <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                Global Financial News &amp; Macro Economic Calendar
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Real-time central bank policy releases, institutional orderflow headlines, and cross-asset macro catalysts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-base font-bold text-[#F8FAFC] mb-3">
                  Top Market Headlines
                </h2>
                {MARKET_NEWS.map((item) => {
                  const sym =
                    symbols.find((s) => s.ticker === item.relatedTicker) || symbols[0];
                  return (
                    <article
                      key={item.id}
                      onClick={() => handleOpenInSupercharts(sym)}
                      className="p-5 bg-[#131722] border border-[#1E2433] hover:border-[#2E384D] rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-2">
                        <span className="font-mono font-semibold text-[#38BDF8]">
                          {item.relatedTicker}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.source}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.publishedAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#F8FAFC] mb-2 leading-snug">
                        {item.headline}
                      </h3>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {item.summary}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="lg:col-span-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-[#F8FAFC]">
                    Economic Releases Calendar
                  </h2>
                  <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded border border-[#1E2433]">
                    {(['All', 'High'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setImpactFilter(f)}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${
                          impactFilter === f
                            ? 'bg-[#2962FF] text-white'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        {f === 'All' ? 'All Events' : 'High Impact'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#131722] border border-[#1E2433] rounded-xl divide-y divide-[#1E2433]">
                  {ECONOMIC_EVENTS.filter(
                    (ev) => impactFilter === 'All' || ev.impact === 'High'
                  ).map((ev) => (
                    <div key={ev.id} className="p-4 text-xs">
                      <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                        <span className="font-mono">{ev.time}</span>
                        <span>
                          {ev.country} ({ev.currency}) ·{' '}
                          <span
                            className={
                              ev.impact === 'High'
                                ? 'text-[#F59E0B] font-semibold'
                                : 'text-[#94A3B8]'
                            }
                          >
                            {ev.impact} Impact
                          </span>
                        </span>
                      </div>
                      <div className="font-semibold text-[#F8FAFC] text-sm mb-2">
                        {ev.event}
                      </div>
                      <div className="grid grid-cols-3 gap-2 font-mono tabular-nums pt-2 border-t border-[#1E2433]/60">
                        <div>
                          <span className="text-[#64748B] block text-[11px]">
                            Actual
                          </span>
                          <span className="text-[#F8FAFC] font-semibold">
                            {ev.actual}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">
                            Forecast
                          </span>
                          <span className="text-[#CBD5E1]">{ev.forecast}</span>
                        </div>
                        <div>
                          <span className="text-[#64748B] block text-[11px]">
                            Previous
                          </span>
                          <span className="text-[#94A3B8]">{ev.previous}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TRADINGVIEW HOME PORTAL ('Markets' View) */}
        {activeView === 'Markets' && (
          <div>
            {/* 1. HERO SECTION: "Look first / Then leap." */}
            <section className="relative w-full min-h-[540px] flex items-center justify-center overflow-hidden border-b border-[#1E2433]">
              {/* Background Hero Image with Measured Contrast Scrim */}
              <div className="absolute inset-0 z-0">
                <ResilientImage
                  src={heroExplorerImg}
                  alt="Lone mountaineer overlooking alpine peaks at twilight"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/70 to-[#0B0E14]/40" />
                <div className="absolute inset-0 bg-radial from-transparent via-[#0B0E14]/30 to-[#0B0E14]/90" />
              </div>

              <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-20">
                <h1
                  className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.06] font-display"
                  style={{ textWrap: 'balance' }}
                >
                  Look first / Then leap.
                </h1>
                <p className="mt-5 text-base sm:text-xl text-[#CBD5E1] max-w-2xl mx-auto leading-relaxed font-normal">
                  The best trades require research, then commitment. Track global indices, equities, digital assets, and sovereign yields on institutional-grade Supercharts.
                </p>

                {/* Interactive Hero Symbol Search Bar */}
                <div className="mt-8 max-w-xl mx-auto">
                  <div className="flex items-center bg-[#131722]/95 border border-[#2E384D] hover:border-[#38BDF8]/60 rounded-xl p-1.5 shadow-2xl transition-colors">
                    <button
                      type="button"
                      onClick={() => setSearchModalOpen(true)}
                      className="flex-1 flex items-center gap-3 px-3.5 py-2.5 text-left text-sm text-[#94A3B8] hover:text-white"
                    >
                      <Search className="w-4 h-4 text-[#38BDF8] shrink-0" />
                      <span className="truncate">
                        Search markets, tickers, or asset classes (e.g. NVDA, BTCUSD, SPX)...
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('Supercharts')}
                      className="px-5 py-2.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Explore Supercharts
                    </button>
                  </div>

                  {/* Quick Symbol Launch Buttons */}
                  <div className="mt-4 flex items-center justify-center flex-wrap gap-2">
                    <span className="text-xs text-[#94A3B8] mr-1">Popular tickers:</span>
                    {['NVDA', 'BTCUSD', 'SPX', 'TSLA', 'XAUUSD', 'EURUSD'].map((tkr) => {
                      const sym = symbols.find((s) => s.ticker === tkr);
                      if (!sym) return null;
                      const isPos = sym.changePercent >= 0;
                      return (
                        <button
                          key={tkr}
                          onClick={() => handleOpenInSupercharts(sym)}
                          className="px-3 py-1 bg-[#131722]/90 hover:bg-[#1E2433] border border-[#2A2E39] rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span className="font-semibold text-[#F8FAFC]">{sym.ticker}</span>
                          <span
                            className={`tabular-nums ${
                              isPos ? 'text-[#089981]' : 'text-[#F23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {sym.changePercent.toFixed(2)}%
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. MARKET SUMMARY INTERACTIVE WORKSPACE */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#1E2433]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                      Market Summary
                    </h2>
                  </div>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Select any global benchmark or asset class to inspect intraday and multi-year price structure.
                  </p>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-[#131722] border border-[#1E2433] rounded-lg overflow-x-auto">
                  {SUMMARY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSummaryCategory(cat);
                        const firstInCat = symbols.find((s) => s.category === cat);
                        if (firstInCat) setSummaryTicker(firstInCat.ticker);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        summaryCategory === cat
                          ? 'bg-[#2962FF] text-white'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clickable Benchmark Ticker Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {summaryCategorySymbols.slice(0, 4).map((item) => {
                  const isSelected = item.ticker === activeSummarySymbol.ticker;
                  const isPos = item.changePercent >= 0;
                  return (
                    <button
                      key={item.ticker}
                      onClick={() => setSummaryTicker(item.ticker)}
                      className={`p-4 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? 'bg-[#171E2E] border-[#2962FF]'
                          : 'bg-[#131722] border-[#1E2433] hover:border-[#2E384D]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                            {item.ticker}
                          </span>
                          <span className="text-xs text-[#94A3B8] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#64748B] shrink-0">
                          {item.exchange}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between gap-2 font-mono tabular-nums mt-2">
                        <span className="text-lg font-bold text-[#F8FAFC]">
                          {item.price.toFixed(item.decimals)}{' '}
                          <span className="text-[11px] font-normal text-[#64748B]">
                            {item.currency}
                          </span>
                        </span>
                        <span
                          className={`text-xs font-semibold flex items-center gap-0.5 ${
                            isPos ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {isPos ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPos ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Embedded Interactive Summary Canvas Card */}
              <div className="bg-[#131722] border border-[#1E2433] rounded-xl overflow-hidden">
                {/* Summary Chart Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#1E2433]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-bold text-[#F8FAFC]">
                      {activeSummarySymbol.name} ({activeSummarySymbol.ticker})
                    </span>
                    <span className="font-mono text-sm font-semibold text-[#F8FAFC] tabular-nums">
                      {activeSummarySymbol.price.toFixed(activeSummarySymbol.decimals)}{' '}
                      {activeSummarySymbol.currency}
                    </span>
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        activeSummarySymbol.changePercent >= 0
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }`}
                    >
                      {activeSummarySymbol.changePercent >= 0 ? '+' : ''}
                      {activeSummarySymbol.change.toFixed(activeSummarySymbol.decimals)} (
                      {activeSummarySymbol.changePercent >= 0 ? '+' : ''}
                      {activeSummarySymbol.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* Timeframe Switcher */}
                    <div className="flex items-center gap-0.5 bg-[#0B0E14] p-0.5 rounded-lg border border-[#1E2433]">
                      {(['15m', '1H', '4H', '1D', '1W'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setSummaryTimeframe(tf)}
                          className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                            summaryTimeframe === tf
                              ? 'bg-[#2962FF] text-white'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    {/* Area vs Candles Toggle */}
                    <div className="flex items-center gap-0.5 bg-[#0B0E14] p-0.5 rounded-lg border border-[#1E2433]">
                      {(['Area', 'Candles'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setSummaryChartStyle(st)}
                          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                            summaryChartStyle === st
                              ? 'bg-[#1E293B] text-[#38BDF8]'
                              : 'text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleOpenInSupercharts(activeSummarySymbol)}
                      className="px-3.5 py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Open in Supercharts</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Canvas */}
                <FinancialChartCanvas
                  symbol={activeSummarySymbol}
                  candles={summaryCandles}
                  chartStyle={summaryChartStyle}
                  activeIndicators={['Volume']}
                  height={360}
                  compact={true}
                />
              </div>
            </section>

            {/* 3. COMMUNITY IDEAS & TECHNICAL SETUPS SECTION */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#1E2433]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
                    Community Ideas &amp; Institutional Setups
                  </h2>
                  <p className="text-sm text-[#94A3B8] mt-1">
                    Curated technical chart analyses with explicit target levels, invalidation triggers, and indicator overlays.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setActiveView('Community');
                      setShowPublishForm(true);
                    }}
                    className="px-3.5 py-2 bg-[#131722] hover:bg-[#1E2433] border border-[#2A2E39] text-[#F8FAFC] text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Publish Idea</span>
                  </button>
                  <button
                    onClick={() => setActiveView('Community')}
                    className="px-3.5 py-2 bg-[#131722] hover:bg-[#1E2433] border border-[#2A2E39] text-[#CBD5E1] text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    View All Ideas →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ideas.slice(0, 3).map((idea) => {
                  const isBoosted = boostedIdeaIds.includes(idea.id);
                  return (
                    <article
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea)}
                      className="flex flex-col justify-between bg-[#131722] border border-[#1E2433] hover:border-[#2E384D] rounded-xl overflow-hidden cursor-pointer transition-colors group"
                    >
                      <div>
                        <div className="aspect-[4/3] w-full overflow-hidden bg-[#0B0E14] border-b border-[#1E2433]">
                          <ResilientImage
                            src={idea.imageUrl}
                            alt={idea.title}
                            fallbackLabel={`${idea.ticker} ${idea.timeframe} Chart Setup`}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>

                        <div className="p-5">
                          {/* Zero-Pill Unboxed Metadata with · separators */}
                          <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#94A3B8] mb-2">
                            <span className="font-mono font-semibold text-[#F8FAFC]">
                              {idea.ticker}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{idea.timeframe}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                idea.direction === 'Long'
                                  ? 'text-[#089981] font-medium'
                                  : idea.direction === 'Short'
                                  ? 'text-[#F23645] font-medium'
                                  : 'text-[#38BDF8] font-medium'
                              }
                            >
                              {idea.direction}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{idea.publishedAt}</span>
                          </div>

                          <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#60A5FA] transition-colors leading-snug mb-2">
                            {idea.title}
                          </h3>
                          <p className="text-xs text-[#94A3B8] line-clamp-3 leading-relaxed">
                            {idea.summary}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 py-3.5 border-t border-[#1E2433] flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8] truncate pr-2">
                          By <span className="text-[#E2E8F0] font-medium">{idea.author}</span>
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBoostIdea(idea.id);
                            }}
                            className={`flex items-center gap-1 font-mono tabular-nums ${
                              isBoosted
                                ? 'text-[#60A5FA]'
                                : 'text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{idea.boosts + (isBoosted ? 1 : 0)}</span>
                          </button>
                          <span className="flex items-center gap-1 text-[#94A3B8] font-mono tabular-nums">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{idea.commentsCount}</span>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* 4. MARKET MOVERS & MACRO ECONOMIC CALENDAR SPLIT SECTION */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 Columns: Stock & Crypto Movers Table */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#2962FF]" />
                          <span>Top Market Movers &amp; Volume Leaders</span>
                        </h2>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Click any row to launch its live candlestick chart in Supercharts.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-[#131722] border border-[#1E2433] rounded-lg">
                        {(['Gainers', 'Most Active', 'Losers'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setMoversTab(tab)}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                              moversTab === tab
                                ? 'bg-[#2962FF] text-white'
                                : 'text-[#94A3B8] hover:text-white'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#131722] border border-[#1E2433] rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#1E2433] bg-[#0F131C] text-[11px] font-semibold text-[#64748B]">
                            <th className="py-3 pl-4 pr-2">Instrument</th>
                            <th className="py-3 px-3 text-right">Last Price</th>
                            <th className="py-3 px-3 text-right">Chg %</th>
                            <th className="py-3 px-3 text-right hidden sm:table-cell">
                              Volume
                            </th>
                            <th className="py-3 pl-3 pr-4 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E2433] text-xs">
                          {moversList.map((sym) => {
                            const isPos = sym.changePercent >= 0;
                            return (
                              <tr
                                key={sym.ticker}
                                onClick={() => handleOpenInSupercharts(sym)}
                                className="hover:bg-[#1C2230] cursor-pointer transition-colors"
                              >
                                <td className="py-3 pl-4 pr-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="font-mono font-bold text-[#F8FAFC]">
                                      {sym.ticker}
                                    </span>
                                    <span className="text-[#94A3B8] truncate max-w-[160px]">
                                      {sym.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-[#F8FAFC] tabular-nums whitespace-nowrap">
                                  {sym.price.toFixed(sym.decimals)}{' '}
                                  <span className="text-[10px] text-[#64748B]">
                                    {sym.currency}
                                  </span>
                                </td>
                                <td
                                  className={`py-3 px-3 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                                    isPos ? 'text-[#089981]' : 'text-[#F23645]'
                                  }`}
                                >
                                  {isPos ? '+' : ''}
                                  {sym.changePercent.toFixed(2)}%
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums hidden sm:table-cell whitespace-nowrap">
                                  {sym.volume}
                                </td>
                                <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                                  <span
                                    className={`font-medium ${
                                      sym.rating.includes('Buy')
                                        ? 'text-[#089981]'
                                        : sym.rating.includes('Sell')
                                        ? 'text-[#F23645]'
                                        : 'text-[#94A3B8]'
                                    }`}
                                  >
                                    {sym.rating}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setActiveView('Screener')}
                      className="text-xs font-medium text-[#38BDF8] hover:text-white transition-colors"
                    >
                      Open Full Multi-Asset Screener ({symbols.length} Instruments) →
                    </button>
                  </div>
                </div>

                {/* Right 5 Columns: Economic Calendar & Breaking News Feed */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#F59E0B]" />
                        <span>Macro Economic Calendar</span>
                      </h2>
                      <button
                        onClick={() => setActiveView('News')}
                        className="text-xs text-[#38BDF8] hover:text-white"
                      >
                        Full Calendar →
                      </button>
                    </div>

                    <div className="bg-[#131722] border border-[#1E2433] rounded-xl divide-y divide-[#1E2433]">
                      {ECONOMIC_EVENTS.slice(0, 4).map((ev) => (
                        <div key={ev.id} className="p-3.5 text-xs">
                          <div className="flex items-center justify-between text-[#94A3B8] mb-1">
                            <span className="font-mono">{ev.time}</span>
                            <span>
                              {ev.country} ({ev.currency}) ·{' '}
                              <span
                                className={
                                  ev.impact === 'High'
                                    ? 'text-[#F59E0B] font-medium'
                                    : 'text-[#94A3B8]'
                                }
                              >
                                {ev.impact}
                              </span>
                            </span>
                          </div>
                          <div className="font-semibold text-[#F8FAFC] mb-1.5">
                            {ev.event}
                          </div>
                          <div className="flex items-center gap-4 font-mono text-[11px] text-[#94A3B8] tabular-nums">
                            <span>
                              Actual: <strong className="text-[#F8FAFC]">{ev.actual}</strong>
                            </span>
                            <span>Forecast: {ev.forecast}</span>
                            <span>Prev: {ev.previous}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick News Wire */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-[#38BDF8]" />
                        <span>Real-Time Financial Wire</span>
                      </h3>
                    </div>
                    <div className="bg-[#131722] border border-[#1E2433] rounded-xl divide-y divide-[#1E2433]">
                      {MARKET_NEWS.slice(0, 3).map((nw) => {
                        const sym =
                          symbols.find((s) => s.ticker === nw.relatedTicker) || symbols[0];
                        return (
                          <div
                            key={nw.id}
                            onClick={() => handleOpenInSupercharts(sym)}
                            className="p-3.5 hover:bg-[#1C2230] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] mb-1">
                              <span className="font-mono font-semibold text-[#38BDF8]">
                                {nw.relatedTicker}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{nw.source}</span>
                              <span aria-hidden="true">·</span>
                              <span>{nw.publishedAt}</span>
                            </div>
                            <div className="text-xs font-semibold text-[#F8FAFC] leading-snug">
                              {nw.headline}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* QUIET FOOTER */}
      <footer className="bg-[#0B0E14] border-t border-[#1E2433] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-lg font-extrabold text-[#F8FAFC] font-display tracking-tight">
              TradingView
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Look first / Then leap. Market data, multi-asset Supercharts, and quantitative analytical tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#94A3B8]">
            <button
              onClick={() => setActiveView('Markets')}
              className="hover:text-white transition-colors"
            >
              Markets Summary
            </button>
            <button
              onClick={() => setActiveView('Supercharts')}
              className="hover:text-white transition-colors"
            >
              Supercharts Workstation
            </button>
            <button
              onClick={() => setActiveView('Screener')}
              className="hover:text-white transition-colors"
            >
              Stock &amp; Crypto Screener
            </button>
            <button
              onClick={() => setActiveView('Community')}
              className="hover:text-white transition-colors"
            >
              Community Ideas
            </button>
            <button
              onClick={() => setActiveView('News')}
              className="hover:text-white transition-colors"
            >
              Economic Calendar
            </button>
          </div>
        </div>
      </footer>

      {/* GLOBAL SYMBOL SEARCH MODAL (⌘K) */}
      <SymbolSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        symbols={symbols}
        onSelectSymbol={(sym, openSupercharts) => {
          if (openSupercharts) {
            handleOpenInSupercharts(sym);
          } else {
            setSummaryTicker(sym.ticker);
          }
        }}
        watchlistTickers={watchlistTickers}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* TRADE IDEA DETAIL & DISCUSSION MODAL */}
      <IdeaModal
        idea={selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onOpenInSupercharts={(tkr, inds) => {
          const found = symbols.find((s) => s.ticker === tkr) || symbols[0];
          handleOpenInSupercharts(found, inds);
        }}
        onBoostIdea={handleBoostIdea}
        boostedIds={boostedIdeaIds}
      />
    </div>
  );
}
