import React, { useEffect, useRef, useState } from 'react';
import { CandlePoint, MarketSymbol } from '../data/marketData';

export type ChartStyleType = 'Candles' | 'Hollow Candles' | 'Heikin Ashi' | 'Area' | 'Line';
export type DrawingToolType = 'Crosshair' | 'Trend Line' | 'Horizontal Line' | 'Fib Retracement';

export interface UserDrawing {
  id: string;
  type: 'Horizontal Line' | 'Trend Line' | 'Fib Retracement';
  price1: number;
  index1: number;
  price2?: number;
  index2?: number;
  color: string;
  label?: string;
}

export interface PriceAlertLine {
  id: string;
  ticker: string;
  price: number;
  condition: 'Crossing Up' | 'Crossing Down';
  active: boolean;
}

interface FinancialChartCanvasProps {
  symbol: MarketSymbol;
  candles: CandlePoint[];
  chartStyle: ChartStyleType;
  activeIndicators: string[];
  activeTool?: DrawingToolType;
  drawings?: UserDrawing[];
  onAddDrawing?: (drawing: UserDrawing) => void;
  priceAlerts?: PriceAlertLine[];
  height?: number;
  compact?: boolean;
  onHoverCandle?: (candle: CandlePoint | null) => void;
}

export const FinancialChartCanvas: React.FC<FinancialChartCanvasProps> = ({
  symbol,
  candles,
  chartStyle,
  activeIndicators,
  activeTool = 'Crosshair',
  drawings = [],
  onAddDrawing,
  priceAlerts = [],
  height = 460,
  compact = false,
  onHoverCandle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 75 : 85);
  const [panOffset, setPanOffset] = useState<number>(0); // 0 = latest candle on right
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [pendingStart, setPendingStart] = useState<{ index: number; price: number } | null>(null);

  // Reset pan when symbol changes
  useEffect(() => {
    setPanOffset(0);
    setPendingStart(null);
  }, [symbol.ticker]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const totalHeight = height;

    canvas.width = width * dpr;
    canvas.height = totalHeight * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${totalHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Layout geometry
    const rightAxisWidth = compact ? 64 : 74;
    const bottomAxisHeight = 26;
    const showRsi = !compact && activeIndicators.includes('RSI 14');
    const rsiPaneHeight = showRsi ? Math.round(totalHeight * 0.22) : 0;
    const chartWidth = width - rightAxisWidth;
    const mainChartHeight = totalHeight - bottomAxisHeight - rsiPaneHeight;

    // Background fill
    ctx.fillStyle = '#0B0E14';
    ctx.fillRect(0, 0, width, totalHeight);

    // Determine visible candle slice
    const count = Math.min(Math.max(visibleCount, 24), candles.length);
    const endIdx = Math.max(count, candles.length - panOffset);
    const startIdx = Math.max(0, endIdx - count);
    const slice = candles.slice(startIdx, endIdx);
    if (slice.length === 0) return;

    // Price range calculation
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 1;

    slice.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (activeIndicators.includes('Bollinger Bands') && c.bbUpper && c.bbLower) {
        if (c.bbLower < minPrice) minPrice = c.bbLower;
        if (c.bbUpper > maxPrice) maxPrice = c.bbUpper;
      }
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const pricePadding = (maxPrice - minPrice) * 0.12 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceSpan = Math.max(maxPrice - minPrice, 1e-6);

    const priceToY = (p: number) => {
      return mainChartHeight - ((p - minPrice) / priceSpan) * (mainChartHeight - 24) - 12;
    };

    const yToPrice = (y: number) => {
      const normalized = (mainChartHeight - 12 - y) / (mainChartHeight - 24);
      return minPrice + normalized * priceSpan;
    };

    const stepX = chartWidth / slice.length;
    const idxToX = (localIdx: number) => localIdx * stepX + stepX * 0.5;

    // Draw subtle grid lines
    ctx.strokeStyle = '#161B26';
    ctx.lineWidth = 1;
    const horizontalGridSteps = compact ? 5 : 7;

    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748B';
    ctx.textAlign = 'left';

    for (let i = 0; i <= horizontalGridSteps; i++) {
      const y = Math.round((mainChartHeight / horizontalGridSteps) * i) + 0.5;
      if (y > 10 && y < mainChartHeight - 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        const labelPrice = yToPrice(y);
        ctx.fillText(labelPrice.toFixed(symbol.decimals), chartWidth + 8, y + 4);
      }
    }

    // Vertical grid lines & time labels
    const labelInterval = Math.max(Math.floor(slice.length / (compact ? 5 : 8)), 1);
    ctx.textAlign = 'center';
    for (let i = 0; i < slice.length; i += labelInterval) {
      const x = Math.round(idxToX(i)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, totalHeight - bottomAxisHeight);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.fillText(slice[i].label, x, totalHeight - 8);
    }

    // Volume histogram at bottom of main chart
    if (activeIndicators.includes('Volume')) {
      const volMaxHeight = mainChartHeight * 0.2;
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const barW = Math.max(stepX * 0.62, 2);
        const barH = (c.volume / maxVolume) * volMaxHeight;
        const isBull = c.close >= c.open;
        ctx.fillStyle = isBull ? 'rgba(8, 153, 129, 0.20)' : 'rgba(242, 54, 69, 0.20)';
        ctx.fillRect(x - barW / 2, mainChartHeight - barH, barW, barH);
      });
    }

    // Bollinger Bands overlay
    if (activeIndicators.includes('Bollinger Bands')) {
      ctx.save();
      ctx.beginPath();
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = priceToY(c.bbUpper ?? c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      for (let i = slice.length - 1; i >= 0; i--) {
        const x = idxToX(i);
        const y = priceToY(slice[i].bbLower ?? slice[i].close);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(41, 98, 255, 0.07)';
      ctx.fill();

      // Upper and lower lines
      ['bbUpper', 'bbLower'].forEach((key) => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(41, 98, 255, 0.45)';
        ctx.lineWidth = 1.2;
        slice.forEach((c, i) => {
          const val = (c[key as keyof CandlePoint] as number) ?? c.close;
          const x = idxToX(i);
          const y = priceToY(val);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      ctx.restore();
    }

    // Main Price Series (Area / Line / Candles / Hollow / Heikin Ashi)
    if (chartStyle === 'Area' || chartStyle === 'Line') {
      const isPositive = symbol.changePercent >= 0;
      const lineColor = chartStyle === 'Area' ? (isPositive ? '#089981' : '#F23645') : '#2962FF';

      if (chartStyle === 'Area') {
        const grad = ctx.createLinearGradient(0, 0, 0, mainChartHeight);
        if (isPositive) {
          grad.addColorStop(0, 'rgba(8, 153, 129, 0.28)');
          grad.addColorStop(1, 'rgba(8, 153, 129, 0.0)');
        } else {
          grad.addColorStop(0, 'rgba(242, 54, 69, 0.28)');
          grad.addColorStop(1, 'rgba(242, 54, 69, 0.0)');
        }

        ctx.beginPath();
        slice.forEach((c, i) => {
          const x = idxToX(i);
          const y = priceToY(c.close);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.lineTo(idxToX(slice.length - 1), mainChartHeight);
        ctx.lineTo(idxToX(0), mainChartHeight);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = priceToY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    } else {
      // Candlesticks / Hollow Candles / Heikin Ashi
      let prevHaOpen = slice[0].open;
      let prevHaClose = slice[0].close;

      slice.forEach((c, i) => {
        let drawOpen = c.open;
        let drawClose = c.close;
        let drawHigh = c.high;
        let drawLow = c.low;

        if (chartStyle === 'Heikin Ashi') {
          drawClose = (c.open + c.high + c.low + c.close) / 4;
          drawOpen = i === 0 ? (c.open + c.close) / 2 : (prevHaOpen + prevHaClose) / 2;
          drawHigh = Math.max(c.high, drawOpen, drawClose);
          drawLow = Math.min(c.low, drawOpen, drawClose);
          prevHaOpen = drawOpen;
          prevHaClose = drawClose;
        }

        const isBull = drawClose >= drawOpen;
        const color = isBull ? '#089981' : '#F23645';
        const x = Math.round(idxToX(i)) + 0.5;
        const highY = priceToY(drawHigh);
        const lowY = priceToY(drawLow);
        const openY = priceToY(drawOpen);
        const closeY = priceToY(drawClose);

        // Wick
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Body
        const candleWidth = Math.max(Math.min(stepX * 0.7, 14), 3);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);

        if (chartStyle === 'Hollow Candles' && isBull) {
          ctx.fillStyle = '#0B0E14';
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
          ctx.strokeStyle = color;
          ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        }
      });
    }

    // EMA 20 & EMA 50 Overlays
    if (activeIndicators.includes('EMA 20/50')) {
      // EMA 20 - Electric Blue
      ctx.beginPath();
      ctx.strokeStyle = '#2962FF';
      ctx.lineWidth = 1.6;
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = priceToY(c.ema20 ?? c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // EMA 50 - Amber Gold
      ctx.beginPath();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.6;
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = priceToY(c.ema50 ?? c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // VWAP Overlay
    if (activeIndicators.includes('VWAP')) {
      ctx.beginPath();
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = priceToY(c.vwap ?? c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Active Price Alerts Lines
    priceAlerts
      .filter((a) => a.ticker === symbol.ticker && a.active)
      .forEach((alert) => {
        const y = priceToY(alert.price);
        if (y >= 0 && y <= mainChartHeight) {
          ctx.save();
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Right Axis Tag
          ctx.fillStyle = '#B45309';
          ctx.fillRect(chartWidth, y - 9, rightAxisWidth, 18);
          ctx.fillStyle = '#FEF3C7';
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`ALRT ${alert.price.toFixed(symbol.decimals)}`, chartWidth + 4, y + 3.5);
          ctx.restore();
        }
      });

    // User Drawings (Horizontal Lines, Trend Lines, Fib Retracements)
    drawings.forEach((d) => {
      ctx.save();
      if (d.type === 'Horizontal Line') {
        const y = priceToY(d.price1);
        ctx.strokeStyle = d.color || '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#0284C7';
        ctx.fillRect(chartWidth, y - 9, rightAxisWidth, 18);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(d.price1.toFixed(symbol.decimals), chartWidth + 6, y + 3.5);
      } else if (d.type === 'Trend Line' && d.price2 !== undefined && d.index2 !== undefined) {
        const localIdx1 = d.index1 - startIdx;
        const localIdx2 = d.index2 - startIdx;
        const x1 = idxToX(localIdx1);
        const y1 = priceToY(d.price1);
        const x2 = idxToX(localIdx2);
        const y2 = priceToY(d.price2);

        ctx.strokeStyle = d.color || '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Anchor nodes
        [
          { x: x1, y: y1 },
          { x: x2, y: y2 }
        ].forEach((pt) => {
          ctx.fillStyle = '#0B0E14';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      } else if (d.type === 'Fib Retracement' && d.price2 !== undefined) {
        const levels = [
          { ratio: 0, color: '#94A3B8' },
          { ratio: 0.236, color: '#F43F5E' },
          { ratio: 0.382, color: '#F59E0B' },
          { ratio: 0.5, color: '#10B981' },
          { ratio: 0.618, color: '#06B6D4' },
          { ratio: 1, color: '#3B82F6' }
        ];
        const diff = d.price2 - d.price1;
        levels.forEach((lvl) => {
          const lvlPrice = d.price1 + diff * lvl.ratio;
          const y = priceToY(lvlPrice);
          ctx.strokeStyle = lvl.color;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = lvl.color;
          ctx.font = '500 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Fib ${lvl.ratio.toFixed(3)} (${lvlPrice.toFixed(symbol.decimals)})`, 46, y - 3);
        });
      }
      ctx.restore();
    });

    // Live Last Price Horizontal Dashed Line & Axis Badge
    const lastCandle = slice[slice.length - 1];
    const lastY = priceToY(lastCandle.close);
    const isBullLast = lastCandle.close >= lastCandle.open;
    const badgeColor = isBullLast ? '#089981' : '#F23645';

    ctx.save();
    ctx.strokeStyle = badgeColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(chartWidth, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right axis current price badge
    ctx.fillStyle = badgeColor;
    ctx.fillRect(chartWidth, lastY - 10, rightAxisWidth, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(lastCandle.close.toFixed(symbol.decimals), chartWidth + 6, lastY + 4);
    ctx.restore();

    // RSI 14 Lower Sub-pane
    if (showRsi) {
      const rsiTop = mainChartHeight;
      const rsiBottom = totalHeight - bottomAxisHeight;
      const rsiH = rsiBottom - rsiTop;

      // Top divider line
      ctx.strokeStyle = '#1E2433';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rsiTop + 0.5);
      ctx.lineTo(width, rsiTop + 0.5);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      const lastRsi = lastCandle.rsi ?? 54.0;
      ctx.fillText(`RSI (14, close)  ${lastRsi.toFixed(1)}`, 10, rsiTop + 15);

      const rsiToY = (val: number) => rsiBottom - (val / 100) * (rsiH - 16) - 8;

      // 70 / 30 Band
      const y70 = rsiToY(70);
      const y30 = rsiToY(30);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.07)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.setLineDash([3, 3]);
      [70, 30].forEach((lvl) => {
        const y = rsiToY(lvl);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillText(String(lvl), chartWidth + 8, y + 3);
      });
      ctx.setLineDash([]);

      // RSI Line
      ctx.beginPath();
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 1.6;
      slice.forEach((c, i) => {
        const x = idxToX(i);
        const y = rsiToY(c.rsi ?? 50);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Right & Bottom Axis Border Lines
    ctx.strokeStyle = '#1E2433';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartWidth + 0.5, 0);
    ctx.lineTo(chartWidth + 0.5, totalHeight);
    ctx.moveTo(0, totalHeight - bottomAxisHeight + 0.5);
    ctx.lineTo(width, totalHeight - bottomAxisHeight + 0.5);
    ctx.stroke();

    // Interactive Crosshair & Hovered Candle Readout
    if (mousePos && mousePos.x >= 0 && mousePos.x <= chartWidth && mousePos.y >= 0 && mousePos.y <= totalHeight - bottomAxisHeight) {
      const hoveredLocalIdx = Math.min(Math.max(Math.floor(mousePos.x / stepX), 0), slice.length - 1);
      const hoveredCandle = slice[hoveredLocalIdx];
      const snapX = Math.round(idxToX(hoveredLocalIdx)) + 0.5;
      const snapY = Math.round(mousePos.y) + 0.5;

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical crosshair
      ctx.beginPath();
      ctx.moveTo(snapX, 0);
      ctx.lineTo(snapX, totalHeight - bottomAxisHeight);
      ctx.stroke();

      // Horizontal crosshair
      ctx.beginPath();
      ctx.moveTo(0, snapY);
      ctx.lineTo(chartWidth, snapY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price callout on right axis if inside main chart
      if (mousePos.y <= mainChartHeight) {
        const hoverPrice = yToPrice(mousePos.y);
        ctx.fillStyle = '#334155';
        ctx.fillRect(chartWidth, snapY - 10, rightAxisWidth, 20);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '600 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(hoverPrice.toFixed(symbol.decimals), chartWidth + 6, snapY + 4);
      }

      // Time callout on bottom axis
      const timeLabel = hoveredCandle.label;
      const labelW = 68;
      const boxX = Math.min(Math.max(snapX - labelW / 2, 2), chartWidth - labelW - 2);
      ctx.fillStyle = '#334155';
      ctx.fillRect(boxX, totalHeight - bottomAxisHeight + 2, labelW, 20);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeLabel, boxX + labelW / 2, totalHeight - 9);

      // Pending Trend Line / Fib preview
      if (pendingStart && (activeTool === 'Trend Line' || activeTool === 'Fib Retracement')) {
        const startLocal = pendingStart.index - startIdx;
        const x1 = idxToX(startLocal);
        const y1 = priceToY(pendingStart.price);
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(snapX, snapY);
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [
    symbol,
    candles,
    chartStyle,
    activeIndicators,
    activeTool,
    drawings,
    priceAlerts,
    height,
    compact,
    mousePos,
    visibleCount,
    panOffset,
    pendingStart
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const rightAxisWidth = compact ? 64 : 74;
    const chartWidth = Math.max(rect.width - rightAxisWidth, 100);
    const count = Math.min(Math.max(visibleCount, 24), candles.length);
    const endIdx = Math.max(count, candles.length - panOffset);
    const startIdx = Math.max(0, endIdx - count);
    const slice = candles.slice(startIdx, endIdx);

    if (isDragging && activeTool === 'Crosshair') {
      const dx = e.clientX - dragStartX;
      const candlesMoved = Math.round((dx / chartWidth) * count);
      if (candlesMoved !== 0) {
        setPanOffset((prev) => Math.min(Math.max(0, prev + candlesMoved), Math.max(0, candles.length - count)));
        setDragStartX(e.clientX);
      }
    }

    if (onHoverCandle && slice.length > 0 && x >= 0 && x <= chartWidth) {
      const stepX = chartWidth / slice.length;
      const localIdx = Math.min(Math.max(Math.floor(x / stepX), 0), slice.length - 1);
      onHoverCandle(slice[localIdx]);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setIsDragging(false);
    if (onHoverCandle) onHoverCandle(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rightAxisWidth = compact ? 64 : 74;
    const bottomAxisHeight = 26;
    const showRsi = !compact && activeIndicators.includes('RSI 14');
    const rsiPaneHeight = showRsi ? Math.round(height * 0.22) : 0;
    const chartWidth = rect.width - rightAxisWidth;
    const mainChartHeight = height - bottomAxisHeight - rsiPaneHeight;

    if (x > chartWidth || y > mainChartHeight) return;

    const count = Math.min(Math.max(visibleCount, 24), candles.length);
    const endIdx = Math.max(count, candles.length - panOffset);
    const startIdx = Math.max(0, endIdx - count);
    const slice = candles.slice(startIdx, endIdx);
    if (slice.length === 0) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    slice.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
    });
    const pricePadding = (maxPrice - minPrice) * 0.12 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceSpan = Math.max(maxPrice - minPrice, 1e-6);

    const clickedPrice = Number(
      (minPrice + ((mainChartHeight - 12 - y) / (mainChartHeight - 24)) * priceSpan).toFixed(symbol.decimals)
    );
    const stepX = chartWidth / slice.length;
    const localIdx = Math.min(Math.max(Math.floor(x / stepX), 0), slice.length - 1);
    const globalIdx = startIdx + localIdx;

    if (activeTool === 'Horizontal Line' && onAddDrawing) {
      onAddDrawing({
        id: `hl-${Date.now()}`,
        type: 'Horizontal Line',
        price1: clickedPrice,
        index1: globalIdx,
        color: '#38BDF8'
      });
    } else if ((activeTool === 'Trend Line' || activeTool === 'Fib Retracement') && onAddDrawing) {
      if (!pendingStart) {
        setPendingStart({ index: globalIdx, price: clickedPrice });
      } else {
        onAddDrawing({
          id: `drw-${Date.now()}`,
          type: activeTool,
          price1: pendingStart.price,
          index1: pendingStart.index,
          price2: clickedPrice,
          index2: globalIdx,
          color: '#38BDF8'
        });
        setPendingStart(null);
      }
    } else {
      setIsDragging(true);
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 8 : -8;
    setVisibleCount((prev) => Math.min(Math.max(28, prev + delta), candles.length));
  };

  return (
    <div ref={containerRef} className="relative w-full select-none overflow-hidden bg-[#0B0E14]">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={
          activeTool !== 'Crosshair'
            ? 'cursor-crosshair block w-full'
            : isDragging
            ? 'cursor-grabbing block w-full'
            : 'cursor-crosshair block w-full'
        }
      />
      {pendingStart && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1E293B] border border-[#38BDF8]/40 rounded text-xs text-[#E2E8F0] pointer-events-none shadow">
          Click second point on chart to complete {activeTool}
        </div>
      )}
    </div>
  );
};
