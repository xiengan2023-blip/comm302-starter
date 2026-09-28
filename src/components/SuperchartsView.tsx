import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Trash2,
  Crosshair,
  Minus,
  TrendingUp,
  Layers,
  Sliders,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  Check
} from 'lucide-react';
import {
  CandlePoint,
  MarketSymbol,
  generateCandlesForSymbol
} from '../data/marketData';
import {
  ChartStyleType,
  DrawingToolType,
  FinancialChartCanvas,
  PriceAlertLine,
  UserDrawing
} from './FinancialChartCanvas';

interface PaperPosition {
  id: string;
  ticker: string;
  side: 'Long' | 'Short';
  qty: number;
  entryPrice: number;
  timestamp: string;
}

interface SuperchartsViewProps {
  selectedSymbol: MarketSymbol;
  allSymbols: MarketSymbol[];
  onSelectSymbol: (symbol: MarketSymbol) => void;
  onOpenSearch: () => void;
  watchlistTickers: string[];
  onToggleWatchlist: (ticker: string) => void;
  initialIndicators?: string[];
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const CHART_STYLES: ChartStyleType[] = [
  'Candles',
  'Hollow Candles',
  'Heikin Ashi',
  'Area',
  'Line'
];
const AVAILABLE_INDICATORS = [
  'EMA 20/50',
  'Bollinger Bands',
  'VWAP',
  'Volume',
  'RSI 14'
];

export const SuperchartsView: React.FC<SuperchartsViewProps> = ({
  selectedSymbol,
  allSymbols,
  onSelectSymbol,
  onOpenSearch,
  watchlistTickers,
  onToggleWatchlist,
  initialIndicators
}) => {
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyleType>('Candles');
  const [activeIndicators, setActiveIndicators] = useState<string[]>(
    initialIndicators && initialIndicators.length > 0
      ? initialIndicators
      : ['EMA 20/50', 'Volume', 'RSI 14']
  );
  const [activeTool, setActiveTool] = useState<DrawingToolType>('Crosshair');
  const [drawings, setDrawings] = useState<UserDrawing[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<CandlePoint | null>(null);

  // Bar Replay state
  const [replayMode, setReplayMode] = useState<boolean>(false);
  const [replayCutoff, setReplayCutoff] = useState<number>(95);
  const [isPlayingReplay, setIsPlayingReplay] = useState<boolean>(false);

  // Price Alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlertLine[]>([
    {
      id: 'alrt-default-1',
      ticker: 'NVDA',
      price: 148.50,
      condition: 'Crossing Up',
      active: true
    },
    {
      id: 'alrt-default-2',
      ticker: 'BTCUSD',
      price: 98000.00,
      condition: 'Crossing Up',
      active: true
    }
  ]);
  const [showAlertInput, setShowAlertInput] = useState<boolean>(false);
  const [newAlertPrice, setNewAlertPrice] = useState<string>('');

  // Bottom Dock state
  const [dockOpen, setDockOpen] = useState<boolean>(true);
  const [activeDockTab, setActiveDockTab] = useState<
    'Paper Trading' | 'Pine Editor' | 'Strategy Tester'
  >('Paper Trading');

  // Paper Trading state
  const [orderQty, setOrderQty] = useState<string>('10');
  const [accountBalance, setAccountBalance] = useState<number>(100000);
  const [positions, setPositions] = useState<PaperPosition[]>([
    {
      id: 'pos-1',
      ticker: 'NVDA',
      side: 'Long',
      qty: 50,
      entryPrice: 138.40,
      timestamp: '09:34 EST'
    },
    {
      id: 'pos-2',
      ticker: 'SPX',
      side: 'Long',
      qty: 5,
      entryPrice: 5942.10,
      timestamp: '10:15 EST'
    }
  ]);

  // Pine Script state
  const [pineCode, setPineCode] = useState<string>(
    `//@version=5
indicator("Institutional EMA & VWAP Confluence", overlay=true)
fastLen = input.int(20, "Fast EMA Length")
slowLen = input.int(50, "Slow EMA Length")
emaFast = ta.ema(close, fastLen)
emaSlow = ta.ema(close, slowLen)
vwapVal = ta.vwap(hlc3)
plot(emaFast, color=color.new(#2962FF, 0), linewidth=2, title="EMA 20")
plot(emaSlow, color=color.new(#F59E0B, 0), linewidth=2, title="EMA 50")
plot(vwapVal, color=color.new(#A855F7, 20), style=plot.style_circles, title="Session VWAP")`
  );
  const [pineAppliedMessage, setPineAppliedMessage] = useState<string>('');

  // Generate full candle dataset
  const fullCandles = useMemo(
    () => generateCandlesForSymbol(selectedSymbol, timeframe, 115),
    [selectedSymbol, timeframe]
  );

  // Replay timer effect
  React.useEffect(() => {
    if (!replayMode || !isPlayingReplay) return;
    const timer = window.setInterval(() => {
      setReplayCutoff((prev) => {
        if (prev >= fullCandles.length) {
          setIsPlayingReplay(false);
          return fullCandles.length;
        }
        return prev + 1;
      });
    }, 650);
    return () => clearInterval(timer);
  }, [replayMode, isPlayingReplay, fullCandles.length]);

  const displayedCandles = useMemo(() => {
    if (!replayMode) return fullCandles;
    return fullCandles.slice(0, Math.max(25, Math.min(replayCutoff, fullCandles.length)));
  }, [fullCandles, replayMode, replayCutoff]);

  const activeCandle = hoveredCandle || displayedCandles[displayedCandles.length - 1];

  const toggleIndicator = (ind: string) => {
    setActiveIndicators((prev) =>
      prev.includes(ind) ? prev.filter((item) => item !== ind) : [...prev, ind]
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newAlertPrice);
    if (isNaN(parsed) || parsed <= 0) return;
    const condition = parsed >= selectedSymbol.price ? 'Crossing Up' : 'Crossing Down';
    setPriceAlerts((prev) => [
      ...prev,
      {
        id: `alrt-${Date.now()}`,
        ticker: selectedSymbol.ticker,
        price: parsed,
        condition,
        active: true
      }
    ]);
    setNewAlertPrice('');
    setShowAlertInput(false);
  };

  const executePaperOrder = (side: 'Long' | 'Short') => {
    const qty = Math.max(1, parseFloat(orderQty) || 1);
    const newPos: PaperPosition = {
      id: `pos-${Date.now()}`,
      ticker: selectedSymbol.ticker,
      side,
      qty,
      entryPrice: selectedSymbol.price,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    };
    setPositions((prev) => [newPos, ...prev]);
    setDockOpen(true);
    setActiveDockTab('Paper Trading');
  };

  const closePosition = (pos: PaperPosition) => {
    const liveSym = allSymbols.find((s) => s.ticker === pos.ticker) || selectedSymbol;
    const diff =
      pos.side === 'Long'
        ? liveSym.price - pos.entryPrice
        : pos.entryPrice - liveSym.price;
    const realizedPnl = diff * pos.qty;
    setAccountBalance((prev) => prev + realizedPnl);
    setPositions((prev) => prev.filter((item) => item.id !== pos.id));
  };

  const watchlistItems = allSymbols.filter((s) => watchlistTickers.includes(s.ticker));

  // Total unrealized PnL
  const unrealizedPnl = positions.reduce((acc, pos) => {
    const liveSym = allSymbols.find((s) => s.ticker === pos.ticker) || selectedSymbol;
    const diff =
      pos.side === 'Long'
        ? liveSym.price - pos.entryPrice
        : pos.entryPrice - liveSym.price;
    return acc + diff * pos.qty;
  }, 0);

  return (
    <div className="flex flex-col w-full bg-[#0B0E14] border-t border-[#1E2433]">
      {/* TOP CHART WORKSTATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#131722] border-b border-[#1E2433]">
        {/* Left: Symbol Button + Timeframes + Chart Styles */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1E2433] hover:bg-[#2A3246] text-[#F8FAFC] rounded-md text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="font-mono">{selectedSymbol.ticker}</span>
            <span className="text-[#94A3B8] font-normal hidden sm:inline">
              · {selectedSymbol.exchange}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-[#2A2E39] mx-1 hidden sm:block" />

          {/* Timeframe Selector */}
          <div className="flex items-center gap-0.5 bg-[#0B0E14] p-0.5 rounded-md border border-[#1E2433]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-[#2962FF] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-[#2A2E39] mx-1 hidden md:block" />

          {/* Chart Style Selector */}
          <div className="flex items-center gap-1">
            {CHART_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setChartStyle(style)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  chartStyle === style
                    ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/40'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E2433]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Indicators + Bar Replay + Alert + Quick Buy/Sell */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 bg-[#0B0E14] p-0.5 rounded-md border border-[#1E2433]">
            <span className="text-[11px] text-[#64748B] px-2 flex items-center gap-1 whitespace-nowrap">
              <Sliders className="w-3 h-3" />
              Indicators:
            </span>
            {AVAILABLE_INDICATORS.map((ind) => {
              const active = activeIndicators.includes(ind);
              return (
                <button
                  key={ind}
                  onClick={() => toggleIndicator(ind)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#2962FF]/20 text-[#60A5FA] border border-[#2962FF]/40'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {ind}
                </button>
              );
            })}
          </div>

          {/* Bar Replay Toggle */}
          <button
            onClick={() => {
              setReplayMode((prev) => !prev);
              setIsPlayingReplay(false);
              setReplayCutoff(Math.max(40, fullCandles.length - 20));
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
              replayMode
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#FBBF24]'
                : 'border-[#2A2E39] text-[#CBD5E1] hover:bg-[#1E2433]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Bar Replay</span>
          </button>

          {/* Price Alert Button */}
          <div className="relative">
            <button
              onClick={() => {
                setNewAlertPrice(
                  (selectedSymbol.price * 1.02).toFixed(selectedSymbol.decimals)
                );
                setShowAlertInput((prev) => !prev);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-[#2A2E39] text-[#CBD5E1] hover:bg-[#1E2433] transition-colors whitespace-nowrap"
            >
              <Bell className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>+ Alert</span>
            </button>

            {showAlertInput && (
              <form
                onSubmit={handleCreateAlert}
                className="absolute right-0 mt-2 w-64 p-3 bg-[#131722] border border-[#2A2E39] rounded-lg shadow-xl z-30"
              >
                <div className="text-xs font-semibold text-[#F8FAFC] mb-2">
                  Set Price Alert for {selectedSymbol.ticker}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#0B0E14] border border-[#2A2E39] rounded text-white focus:outline-none focus:border-[#2962FF]"
                    placeholder="Price level"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium bg-[#2962FF] text-white rounded hover:bg-[#1E53E5] whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* BAR REPLAY CONTROL STRIP (when active) */}
      {replayMode && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#171C28] border-b border-[#2A2E39] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#FBBF24]">
              Historical Bar Replay Mode ({displayedCandles.length} / {fullCandles.length} bars)
            </span>
            <button
              onClick={() => setIsPlayingReplay((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#2962FF] text-white rounded font-medium hover:bg-[#1E53E5]"
            >
              {isPlayingReplay ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Play
                </>
              )}
            </button>
            <button
              onClick={() =>
                setReplayCutoff((prev) => Math.min(fullCandles.length, prev + 1))
              }
              className="flex items-center gap-1 px-2.5 py-1 bg-[#1E2433] text-[#F8FAFC] rounded hover:bg-[#2A3246]"
            >
              <StepForward className="w-3.5 h-3.5" /> Step +1 Bar
            </button>
          </div>
          <button
            onClick={() => {
              setReplayMode(false);
              setIsPlayingReplay(false);
            }}
            className="text-[#94A3B8] hover:text-white"
          >
            Exit Replay
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE ROW: Left Drawing Toolbar + Center Canvas & Dock + Right Watchlist */}
      <div className="flex flex-col lg:flex-row w-full min-h-[640px]">
        {/* LEFT DRAWING TOOLBAR */}
        <div className="flex lg:flex-col items-center justify-start gap-1.5 p-2 bg-[#131722] border-b lg:border-b-0 lg:border-r border-[#1E2433] shrink-0">
          {(
            [
              { id: 'Crosshair', icon: Crosshair, label: 'Crosshair & Pan' },
              { id: 'Horizontal Line', icon: Minus, label: 'Horizontal Support/Resistance Line' },
              { id: 'Trend Line', icon: TrendingUp, label: 'Two-Point Trend Line' },
              { id: 'Fib Retracement', icon: Layers, label: 'Fibonacci Retracement Levels' }
            ] as const
          ).map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`p-2.5 rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-[#2962FF] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E2433]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}

          <div className="h-4 w-[1px] lg:h-[1px] lg:w-6 bg-[#2A2E39] my-1" />

          <button
            onClick={() => setDrawings([])}
            title="Clear All Chart Drawings"
            className="p-2.5 rounded-lg text-[#94A3B8] hover:text-[#F23645] hover:bg-[#1E2433] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* CENTER CHART + OHLC HEADER + BOTTOM DOCK */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0B0E14]">
          {/* Live Symbol & OHLCV Readout Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0B0E14] border-b border-[#1E2433]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#F8FAFC] tracking-tight">
                  {selectedSymbol.name}
                </span>
                <span className="text-xs text-[#64748B]">
                  · {timeframe} · {selectedSymbol.exchange}
                </span>
              </div>

              {activeCandle && (
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span>
                    <span className="text-[#64748B]">O </span>
                    <span
                      className={
                        activeCandle.close >= activeCandle.open
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }
                    >
                      {activeCandle.open.toFixed(selectedSymbol.decimals)}
                    </span>
                  </span>
                  <span>
                    <span className="text-[#64748B]">H </span>
                    <span
                      className={
                        activeCandle.close >= activeCandle.open
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }
                    >
                      {activeCandle.high.toFixed(selectedSymbol.decimals)}
                    </span>
                  </span>
                  <span>
                    <span className="text-[#64748B]">L </span>
                    <span
                      className={
                        activeCandle.close >= activeCandle.open
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }
                    >
                      {activeCandle.low.toFixed(selectedSymbol.decimals)}
                    </span>
                  </span>
                  <span>
                    <span className="text-[#64748B]">C </span>
                    <span
                      className={
                        activeCandle.close >= activeCandle.open
                          ? 'text-[#089981]'
                          : 'text-[#F23645]'
                      }
                    >
                      {activeCandle.close.toFixed(selectedSymbol.decimals)}
                    </span>
                  </span>
                  {activeCandle.ema20 && activeIndicators.includes('EMA 20/50') && (
                    <span className="hidden sm:inline text-[#2962FF]">
                      EMA20 {activeCandle.ema20.toFixed(selectedSymbol.decimals)}
                    </span>
                  )}
                  {activeCandle.ema50 && activeIndicators.includes('EMA 20/50') && (
                    <span className="hidden sm:inline text-[#F59E0B]">
                      EMA50 {activeCandle.ema50.toFixed(selectedSymbol.decimals)}
                    </span>
                  )}
                  {activeCandle.vwap && activeIndicators.includes('VWAP') && (
                    <span className="hidden md:inline text-[#A855F7]">
                      VWAP {activeCandle.vwap.toFixed(selectedSymbol.decimals)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Instant Buy / Sell Bid-Ask Execution Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => executePaperOrder('Short')}
                className="px-3 py-1 bg-[#F23645]/15 hover:bg-[#F23645] text-[#F23645] hover:text-white border border-[#F23645]/40 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap"
              >
                SELL {(selectedSymbol.price * 0.9998).toFixed(selectedSymbol.decimals)}
              </button>
              <input
                type="number"
                min="1"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                aria-label="Order quantity"
                className="w-16 px-2 py-1 text-center text-xs font-mono bg-[#131722] border border-[#2A2E39] rounded text-white focus:outline-none"
              />
              <button
                onClick={() => executePaperOrder('Long')}
                className="px-3 py-1 bg-[#089981]/15 hover:bg-[#089981] text-[#089981] hover:text-white border border-[#089981]/40 rounded text-xs font-mono font-semibold transition-colors whitespace-nowrap"
              >
                BUY {(selectedSymbol.price * 1.0002).toFixed(selectedSymbol.decimals)}
              </button>
            </div>
          </div>

          {/* Interactive HTML5 Candlestick Canvas */}
          <FinancialChartCanvas
            symbol={selectedSymbol}
            candles={displayedCandles}
            chartStyle={chartStyle}
            activeIndicators={activeIndicators}
            activeTool={activeTool}
            drawings={drawings}
            onAddDrawing={(d) => setDrawings((prev) => [...prev, d])}
            priceAlerts={priceAlerts}
            height={dockOpen ? 460 : 610}
            onHoverCandle={setHoveredCandle}
          />

          {/* BOTTOM DOCK: PAPER TRADING / PINE EDITOR / STRATEGY TESTER */}
          <div className="border-t border-[#1E2433] bg-[#131722]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2433]">
              <div className="flex items-center gap-2">
                {(['Paper Trading', 'Pine Editor', 'Strategy Tester'] as const).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveDockTab(tab);
                        setDockOpen(true);
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        activeDockTab === tab && dockOpen
                          ? 'bg-[#2962FF] text-white'
                          : 'text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-xs font-mono tabular-nums">
                  <span className="text-[#94A3B8]">
                    Paper Equity:{' '}
                    <span className="text-[#F8FAFC] font-semibold">
                      ${(accountBalance + unrealizedPnl).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </span>
                  <span
                    className={
                      unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                    }
                  >
                    Open P&amp;L: {unrealizedPnl >= 0 ? '+' : ''}$
                    {unrealizedPnl.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => setDockOpen((prev) => !prev)}
                  className="p-1 text-[#94A3B8] hover:text-white rounded"
                  aria-label="Toggle bottom panel"
                >
                  {dockOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {dockOpen && (
              <div className="p-4 max-h-56 overflow-y-auto">
                {activeDockTab === 'Paper Trading' && (
                  <div>
                    {positions.length === 0 ? (
                      <div className="text-center py-6 text-xs text-[#94A3B8]">
                        No open paper positions. Click{' '}
                        <span className="text-[#089981] font-mono">BUY</span> or{' '}
                        <span className="text-[#F23645] font-mono">SELL</span> above to
                        open a simulated position at live market prices.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#1E2433] text-[#64748B]">
                              <th className="py-2 pr-4 font-medium">Symbol</th>
                              <th className="py-2 px-3 font-medium">Side</th>
                              <th className="py-2 px-3 font-medium text-right">Qty</th>
                              <th className="py-2 px-3 font-medium text-right">
                                Avg Fill
                              </th>
                              <th className="py-2 px-3 font-medium text-right">
                                Last Price
                              </th>
                              <th className="py-2 px-3 font-medium text-right">
                                Unrealized P&amp;L
                              </th>
                              <th className="py-2 pl-3 font-medium text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E2433] font-mono tabular-nums">
                            {positions.map((pos) => {
                              const liveSym =
                                allSymbols.find((s) => s.ticker === pos.ticker) ||
                                selectedSymbol;
                              const diff =
                                pos.side === 'Long'
                                  ? liveSym.price - pos.entryPrice
                                  : pos.entryPrice - liveSym.price;
                              const pnl = diff * pos.qty;
                              const isPosPnl = pnl >= 0;
                              return (
                                <tr
                                  key={pos.id}
                                  className="hover:bg-[#191F2E] transition-colors"
                                >
                                  <td className="py-2.5 pr-4 font-semibold text-[#F8FAFC]">
                                    {pos.ticker}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 font-sans font-medium ${
                                      pos.side === 'Long'
                                        ? 'text-[#089981]'
                                        : 'text-[#F23645]'
                                    }`}
                                  >
                                    {pos.side}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-[#CBD5E1]">
                                    {pos.qty}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-[#CBD5E1]">
                                    {pos.entryPrice.toFixed(liveSym.decimals)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right text-[#F8FAFC]">
                                    {liveSym.price.toFixed(liveSym.decimals)}
                                  </td>
                                  <td
                                    className={`py-2.5 px-3 text-right font-semibold ${
                                      isPosPnl ? 'text-[#089981]' : 'text-[#F23645]'
                                    }`}
                                  >
                                    {isPosPnl ? '+' : ''}${pnl.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 pl-3 text-right font-sans">
                                    <button
                                      onClick={() => closePosition(pos)}
                                      className="px-2.5 py-1 text-xs bg-[#1E2433] hover:bg-[#F23645] text-[#CBD5E1] hover:text-white rounded transition-colors"
                                    >
                                      Close
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeDockTab === 'Pine Editor' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">
                        Pine Script™ v5 Indicator Compiler
                      </span>
                      <div className="flex items-center gap-2">
                        {pineAppliedMessage && (
                          <span className="text-xs text-[#089981]">
                            {pineAppliedMessage}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (!activeIndicators.includes('EMA 20/50')) {
                              setActiveIndicators((prev) => [...prev, 'EMA 20/50']);
                            }
                            if (!activeIndicators.includes('VWAP')) {
                              setActiveIndicators((prev) => [...prev, 'VWAP']);
                            }
                            setPineAppliedMessage('Compiled & applied to Superchart');
                            setTimeout(() => setPineAppliedMessage(''), 3000);
                          }}
                          className="px-3 py-1 text-xs font-medium bg-[#2962FF] text-white rounded hover:bg-[#1E53E5] transition-colors"
                        >
                          Add to Chart
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={pineCode}
                      onChange={(e) => setPineCode(e.target.value)}
                      rows={5}
                      className="w-full p-2.5 bg-[#0B0E14] border border-[#2A2E39] rounded font-mono text-xs text-[#E2E8F0] focus:outline-none focus:border-[#2962FF]"
                    />
                  </div>
                )}

                {activeDockTab === 'Strategy Tester' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1">
                    <div className="p-3 bg-[#0B0E14] border border-[#1E2433] rounded-lg">
                      <div className="text-xs text-[#64748B]">Net Profit (1Y Backtest)</div>
                      <div className="text-base font-mono font-semibold text-[#089981] mt-1 tabular-nums">
                        +$28,490.00 (+28.49%)
                      </div>
                    </div>
                    <div className="p-3 bg-[#0B0E14] border border-[#1E2433] rounded-lg">
                      <div className="text-xs text-[#64748B]">Win Rate (64 Closed Trades)</div>
                      <div className="text-base font-mono font-semibold text-[#F8FAFC] mt-1 tabular-nums">
                        67.19%
                      </div>
                    </div>
                    <div className="p-3 bg-[#0B0E14] border border-[#1E2433] rounded-lg">
                      <div className="text-xs text-[#64748B]">Profit Factor</div>
                      <div className="text-base font-mono font-semibold text-[#38BDF8] mt-1 tabular-nums">
                        2.34
                      </div>
                    </div>
                    <div className="p-3 bg-[#0B0E14] border border-[#1E2433] rounded-lg">
                      <div className="text-xs text-[#64748B]">Max Strategy Drawdown</div>
                      <div className="text-base font-mono font-semibold text-[#F23645] mt-1 tabular-nums">
                        -4.82%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: WATCHLIST + SYMBOL SNAPSHOT + ACTIVE ALERTS */}
        <aside className="w-full lg:w-80 bg-[#131722] border-t lg:border-t-0 lg:border-l border-[#1E2433] flex flex-col shrink-0">
          {/* Watchlist Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2433]">
            <span className="text-xs font-semibold text-[#F8FAFC] tracking-tight">
              Watchlist ({watchlistItems.length})
            </span>
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1 text-xs text-[#38BDF8] hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Symbol</span>
            </button>
          </div>

          {/* Watchlist Column Headers */}
          <div className="grid grid-cols-12 px-4 py-2 text-[11px] text-[#64748B] border-b border-[#1E2433]">
            <div className="col-span-5">Symbol</div>
            <div className="col-span-4 text-right">Last</div>
            <div className="col-span-3 text-right">Chg%</div>
          </div>

          {/* Watchlist Rows */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#1E2433]/60">
            {watchlistItems.map((item) => {
              const isSelected = item.ticker === selectedSymbol.ticker;
              const isPos = item.changePercent >= 0;
              return (
                <button
                  key={item.ticker}
                  onClick={() => onSelectSymbol(item)}
                  className={`w-full grid grid-cols-12 items-center px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-[#2962FF]/15 border-l-2 border-l-[#2962FF]'
                      : 'hover:bg-[#1C2230]'
                  }`}
                >
                  <div className="col-span-5 min-w-0 pr-2">
                    <div className="font-mono text-xs font-semibold text-[#F8FAFC] truncate">
                      {item.ticker}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">
                      {item.exchange}
                    </div>
                  </div>
                  <div className="col-span-4 text-right font-mono text-xs text-[#F8FAFC] tabular-nums">
                    {item.price.toFixed(item.decimals)}
                  </div>
                  <div
                    className={`col-span-3 text-right font-mono text-xs font-medium tabular-nums ${
                      isPos ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Symbol Key Stats & Technical Summary */}
          <div className="p-4 border-t border-[#1E2433] flex-1 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                  {selectedSymbol.ticker}
                </span>
                <button
                  onClick={() => onToggleWatchlist(selectedSymbol.ticker)}
                  className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1"
                >
                  {watchlistTickers.includes(selectedSymbol.ticker) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#089981]" /> In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Watch
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                {selectedSymbol.description}
              </p>

              {/* Key Telemetry Grid */}
              <div className="space-y-2 text-xs border-t border-[#1E2433] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Volume (24h)</span>
                  <span className="font-mono text-[#F8FAFC] tabular-nums">
                    {selectedSymbol.volume}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Market Cap</span>
                  <span className="font-mono text-[#F8FAFC] tabular-nums">
                    {selectedSymbol.marketCap}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">52W High / Low</span>
                  <span className="font-mono text-[#F8FAFC] tabular-nums">
                    {selectedSymbol.high52w.toFixed(selectedSymbol.decimals)} /{' '}
                    {selectedSymbol.low52w.toFixed(selectedSymbol.decimals)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">RSI (14)</span>
                  <span className="font-mono text-[#F8FAFC] tabular-nums">
                    {selectedSymbol.rsi14.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Technical Summary</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      selectedSymbol.rating.includes('Buy')
                        ? 'text-[#089981]'
                        : selectedSymbol.rating.includes('Sell')
                        ? 'text-[#F23645]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {selectedSymbol.rating.includes('Buy') && (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                    {selectedSymbol.rating.includes('Sell') && (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {selectedSymbol.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Price Alerts List */}
            <div className="border-t border-[#1E2433] pt-3">
              <div className="text-xs font-semibold text-[#F8FAFC] mb-2">
                Active Price Alerts ({priceAlerts.length})
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto">
                {priceAlerts.map((alrt) => (
                  <div
                    key={alrt.id}
                    className="flex items-center justify-between text-xs py-1 px-2 bg-[#0B0E14] rounded border border-[#1E2433]"
                  >
                    <span className="font-mono text-[#E2E8F0] tabular-nums">
                      {alrt.ticker} {alrt.condition === 'Crossing Up' ? '≥' : '≤'}{' '}
                      {alrt.price}
                    </span>
                    <button
                      onClick={() =>
                        setPriceAlerts((prev) =>
                          prev.filter((item) => item.id !== alrt.id)
                        )
                      }
                      className="text-[#64748B] hover:text-[#F23645]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
