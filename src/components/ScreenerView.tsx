import React, { useMemo, useState } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Check
} from 'lucide-react';
import {
  AssetCategory,
  MarketSymbol,
  TechnicalRating
} from '../data/marketData';

interface ScreenerViewProps {
  symbols: MarketSymbol[];
  onSelectSymbolForChart: (symbol: MarketSymbol) => void;
  watchlistTickers: string[];
  onToggleWatchlist: (ticker: string) => void;
}

type SortField = 'ticker' | 'price' | 'changePercent' | 'relVolume' | 'rsi14';

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  symbols,
  onSelectSymbolForChart,
  watchlistTickers,
  onToggleWatchlist
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | AssetCategory>('All');
  const [ratingFilter, setRatingFilter] = useState<'All' | TechnicalRating>('All');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = symbols.filter((s) => {
      const catMatch = categoryFilter === 'All' || s.category === categoryFilter;
      const ratingMatch = ratingFilter === 'All' || s.rating === ratingFilter;
      const queryMatch =
        !q ||
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);
      return catMatch && ratingMatch && queryMatch;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'ticker') {
        cmp = a.ticker.localeCompare(b.ticker);
      } else {
        cmp = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [symbols, searchQuery, categoryFilter, ratingFilter, sortField, sortAsc]);

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Screener Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
            Multi-Asset Market Screener
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Filter global equities, indices, digital assets, forex pairs, and sovereign yields by live technical ratings and relative volume.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ticker, company, or sector..."
            className="w-full pl-9 pr-4 py-2 bg-[#131722] border border-[#2A2E39] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#2962FF]"
          />
        </div>
      </div>

      {/* Interactive Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#1E2433]">
        {/* Category Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#131722] border border-[#1E2433] rounded-lg overflow-x-auto">
          {(
            ['All', 'Stocks', 'Indices', 'Crypto', 'Futures', 'Forex', 'Bonds'] as const
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#2962FF] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Technical Rating Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#131722] border border-[#1E2433] rounded-lg overflow-x-auto">
          {(['All', 'Strong Buy', 'Buy', 'Neutral', 'Sell'] as const).map((rt) => (
            <button
              key={rt}
              onClick={() => setRatingFilter(rt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                ratingFilter === rt
                  ? 'bg-[#1E293B] text-[#38BDF8] border border-[#38BDF8]/30'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {rt === 'All' ? 'All Ratings' : rt}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Screener Data Grid */}
      <div className="mt-4 bg-[#131722] border border-[#1E2433] rounded-xl overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="py-14 text-center px-6">
            <p className="text-sm text-[#94A3B8] mb-3">
              No symbols match your current screener filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setRatingFilter('All');
              }}
              className="px-4 py-2 text-xs font-medium bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors"
            >
              Reset All Screener Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1E2433] bg-[#0F131C] text-[11px] font-semibold text-[#64748B]">
                  <th className="py-3 pl-4 pr-3">
                    <button
                      onClick={() => handleSort('ticker')}
                      className="flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                    >
                      <span>Symbol</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleSort('price')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                    >
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleSort('changePercent')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                    >
                      <span>Change %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">Volume</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleSort('relVolume')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                    >
                      <span>Rel Vol</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3 text-right">Mkt Cap</th>
                  <th className="py-3 px-3 text-right">P/E</th>
                  <th className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleSort('rsi14')}
                      className="inline-flex items-center gap-1 hover:text-[#F8FAFC] transition-colors"
                    >
                      <span>RSI (14)</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Technical Rating</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2433] text-xs">
                {filteredAndSorted.map((sym) => {
                  const isPos = sym.changePercent >= 0;
                  const inWatch = watchlistTickers.includes(sym.ticker);
                  return (
                    <tr
                      key={sym.ticker}
                      onClick={() => onSelectSymbolForChart(sym)}
                      className="hover:bg-[#1A2030] cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-[#1E2433] flex items-center justify-center font-mono text-[11px] font-bold text-[#F8FAFC] shrink-0">
                            {sym.ticker.slice(0, 4)}
                          </div>
                          <div>
                            <div className="font-mono font-semibold text-[#F8FAFC]">
                              {sym.ticker}
                            </div>
                            <div className="text-[11px] text-[#64748B] truncate max-w-[170px]">
                              {sym.name}
                            </div>
                          </div>
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
                      <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums whitespace-nowrap">
                        {sym.volume}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums whitespace-nowrap">
                        {sym.relVolume.toFixed(2)}x
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums whitespace-nowrap">
                        {sym.marketCap}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums whitespace-nowrap">
                        {sym.peRatio}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#CBD5E1] tabular-nums whitespace-nowrap">
                        {sym.rsi14.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-[#94A3B8] whitespace-nowrap">
                        {sym.sector}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            sym.rating.includes('Buy')
                              ? 'text-[#089981]'
                              : sym.rating.includes('Sell')
                              ? 'text-[#F23645]'
                              : 'text-[#94A3B8]'
                          }`}
                        >
                          {sym.rating.includes('Buy') && (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {sym.rating.includes('Sell') && (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {sym.rating}
                        </span>
                      </td>
                      <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist(sym.ticker);
                            }}
                            className={`p-1.5 rounded border transition-colors ${
                              inWatch
                                ? 'border-[#089981]/50 text-[#089981]'
                                : 'border-[#2A2E39] text-[#94A3B8] hover:text-white'
                            }`}
                            title="Toggle Watchlist"
                          >
                            {inWatch ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSymbolForChart(sym);
                            }}
                            className="px-2.5 py-1 bg-[#1E2433] hover:bg-[#2962FF] text-[#F8FAFC] rounded text-xs font-medium transition-colors"
                          >
                            Superchart
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
