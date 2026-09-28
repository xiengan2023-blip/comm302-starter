import React, { useState } from 'react';
import { X, ArrowUpRight, ThumbsUp, MessageSquare } from 'lucide-react';
import { TradeIdea } from '../data/marketData';
import { ResilientImage } from './ResilientImage';

interface IdeaModalProps {
  idea: TradeIdea | null;
  onClose: () => void;
  onOpenInSupercharts: (ticker: string, indicators: string[]) => void;
  onBoostIdea: (id: string) => void;
  boostedIds: string[];
}

export const IdeaModal: React.FC<IdeaModalProps> = ({
  idea,
  onClose,
  onOpenInSupercharts,
  onBoostIdea,
  boostedIds
}) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<
    { id: string; author: string; time: string; body: string }[]
  >([
    {
      id: 'c-1',
      author: 'DeltaDesk_NY',
      time: '1 hour ago',
      body: 'Clean confluence on the anchored VWAP level. Watching the 4H close for confirmation before adding size.'
    },
    {
      id: 'c-2',
      author: 'Systematic_Macro',
      time: '42 minutes ago',
      body: 'Relative volume confirms institutional absorption at that exact support shelf.'
    }
  ]);

  if (!idea) return null;

  const isBoosted = boostedIds.includes(idea.id);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      {
        id: `c-${Date.now()}`,
        author: 'Trader_Session',
        time: 'Just now',
        body: commentText.trim()
      },
      ...prev
    ]);
    setCommentText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#131722] border border-[#2A2E39] rounded-xl overflow-hidden shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[#1E2433]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1.5">
              <span className="font-mono font-semibold text-[#F8FAFC]">
                {idea.ticker}
              </span>
              <span aria-hidden="true">·</span>
              <span>{idea.exchange}</span>
              <span aria-hidden="true">·</span>
              <span>{idea.timeframe} Timeframe</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  idea.direction === 'Long'
                    ? 'text-[#089981] font-semibold'
                    : idea.direction === 'Short'
                    ? 'text-[#F23645] font-semibold'
                    : 'text-[#38BDF8] font-semibold'
                }
              >
                {idea.direction} Setup
              </span>
              <span aria-hidden="true">·</span>
              <span>{idea.publishedAt}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC] leading-snug">
              {idea.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1E2433] transition-colors shrink-0"
            aria-label="Close idea modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5">
          <div className="relative rounded-lg overflow-hidden border border-[#1E2433] aspect-[16/9] bg-[#0B0E14]">
            <ResilientImage
              src={idea.imageUrl}
              alt={idea.title}
              fallbackLabel={`${idea.ticker} ${idea.timeframe} Chart Analysis`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Key Trade Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#0B0E14] border border-[#1E2433] rounded-lg text-xs">
            <div>
              <span className="text-[#64748B] block">Author</span>
              <span className="font-semibold text-[#F8FAFC] mt-0.5 block">
                {idea.author} · <span className="text-[#94A3B8] font-normal">{idea.authorRole}</span>
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block">Primary Target Level</span>
              <span className="font-mono font-semibold text-[#089981] mt-0.5 block tabular-nums">
                {idea.targetPrice}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block">Invalidation Level</span>
              <span className="font-mono font-semibold text-[#F23645] mt-0.5 block tabular-nums">
                {idea.invalidationPrice}
              </span>
            </div>
          </div>

          {/* Thesis Summary & Breakdown */}
          <div className="space-y-3 text-sm text-[#CBD5E1] leading-relaxed">
            <p>{idea.summary}</p>
            <ul className="space-y-2 pl-4 list-disc text-xs text-[#94A3B8]">
              {idea.thesisPoints.map((pt, i) => (
                <li key={i} className="text-[#CBD5E1]">
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E2433]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onBoostIdea(idea.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  isBoosted
                    ? 'bg-[#2962FF]/20 border-[#2962FF] text-[#60A5FA]'
                    : 'bg-[#0B0E14] border-[#2A2E39] text-[#CBD5E1] hover:text-white'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">
                  Boost ({idea.boosts + (isBoosted ? 1 : 0)})
                </span>
              </button>
              <span className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">
                  {idea.commentsCount + comments.length - 2} Comments
                </span>
              </span>
            </div>

            <button
              onClick={() => {
                onOpenInSupercharts(idea.ticker, idea.indicatorsUsed);
                onClose();
              }}
              className="px-4 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Open {idea.ticker} Setup in Supercharts</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Discussion Section */}
          <div className="pt-4 border-t border-[#1E2433] space-y-3">
            <h3 className="text-xs font-semibold text-[#F8FAFC]">
              Community Desk Discussion
            </h3>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your technical view or level on this chart..."
                className="flex-1 px-3 py-2 bg-[#0B0E14] border border-[#2A2E39] rounded-lg text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#2962FF]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E2433] hover:bg-[#2A3246] text-xs font-medium text-[#F8FAFC] rounded-lg transition-colors whitespace-nowrap"
              >
                Post Comment
              </button>
            </form>

            <div className="space-y-2.5 pt-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-[#0B0E14] border border-[#1E2433] rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 text-[#64748B] mb-1">
                    <span className="font-semibold text-[#E2E8F0]">{c.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-[#CBD5E1]">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
