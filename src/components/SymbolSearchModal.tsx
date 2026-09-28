import React, { useEffect, useState } from 'react';
import { Search, X, ArrowUpRight, Plus, Check } from 'lucide-react';
import { AssetCategory, MarketSymbol } from '../data/marketData';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbols: MarketSymbol[];
  onSelectSymbol: (symbol: MarketSymbol, openSupercharts?: boolean) => void;
  watchlistTickers: string[];
  onToggleWatchlist: (ticker: string) => void;
}

const CATEGORIES: ('All' | AssetCategory)[] = [
  'All',
  'Stocks',
  'Crypto',
  'Indices',
  'Futures',
  'Forex',
  'Bonds'
];

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  symbols,
  onSelectSymbol,
  watchlistTickers,
  onToggleWatchlist
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | AssetCategory>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = symbols.filter((s) => {
    const matchesCat = activeCategory === 'All' || s.category === activeCategory;
    const q = query.trim().toLowerCase();
    if (!q) return matchesCat;
    return (
      matchesCat &&
      (s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.exchange.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#131722] border border-[#2A2E39] rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#2A2E39] gap-3">
          <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company name, exchange, or asset class (e.g. NVDA, BTCUSD, SPX)..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#94A3B8] hover:text-white px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E2433] transition-colors"
            aria-label="Close symbol search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Category Filter Buttons */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0F131C] border-b border-[#1E2433] overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#2962FF] text-white'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E2433]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[400px] overflow-y-auto divide-y divide-[#1E2433]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center px-6">
              <p className="text-sm text-[#94A3B8] mb-3">
                No matching instruments found for "{query}".
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setActiveCategory('All');
                }}
                className="px-4 py-2 text-xs font-medium bg-[#1E2433] text-[#F8FAFC] rounded-lg hover:bg-[#2A3246] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const isPos = item.changePercent >= 0;
              const inWatchlist = watchlistTickers.includes(item.ticker);
              return (
                <div
                  key={item.ticker}
                  onClick={() => {
                    onSelectSymbol(item, true);
                    onClose();
                  }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#1C2230] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#1E2433] flex items-center justify-center font-mono text-xs font-semibold text-[#F8FAFC] shrink-0">
                      {item.ticker.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#F8FAFC]">
                          {item.ticker}
                        </span>
                        <span className="text-xs text-[#94A3B8] truncate">{item.name}</span>
                      </div>
                      <div className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                        <span>{item.exchange}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{item.sector}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-sm font-medium text-[#F8FAFC]">
                        {item.price.toFixed(item.decimals)}{' '}
                        <span className="text-[11px] text-[#64748B]">{item.currency}</span>
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          isPos ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.ticker);
                        }}
                        title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className={`p-2 rounded-lg border transition-colors ${
                          inWatchlist
                            ? 'border-[#089981]/50 bg-[#089981]/10 text-[#089981]'
                            : 'border-[#2A2E39] text-[#94A3B8] hover:text-white hover:border-[#475569]'
                        }`}
                      >
                        {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSymbol(item, true);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 text-xs font-medium bg-[#2962FF] text-white rounded-lg hover:bg-[#1E53E5] transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <span>Chart</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-2.5 bg-[#0F131C] border-t border-[#1E2433] flex items-center justify-between text-xs text-[#64748B]">
          <span>Click any symbol to launch full Supercharts terminal</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
};
