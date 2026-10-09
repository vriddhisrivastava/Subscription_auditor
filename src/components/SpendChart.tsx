import React, { useState } from 'react';
import {
  Subscription,
  CATEGORY_INFO,
  calculateMonthlyCost,
  SubscriptionCategory,
} from '../types/subscription';
import { PieChart, DollarSign, Calendar, TrendingDown, Layers } from 'lucide-react';

interface SpendChartProps {
  subscriptions: Subscription[];
  currency?: string;
}

export const SpendChart: React.FC<SpendChartProps> = ({
  subscriptions,
  currency = 'INR',
}) => {
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<SubscriptionCategory | null>(null);

  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'TRIAL');

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amt);
  };

  // Group spend by category
  const categorySpendMap = new Map<
    SubscriptionCategory,
    { monthly: number; count: number; subs: Subscription[] }
  >();

  activeSubs.forEach(sub => {
    const monthly = calculateMonthlyCost(sub.cost, sub.billingCycle);
    const existing = categorySpendMap.get(sub.category) || { monthly: 0, count: 0, subs: [] };
    existing.monthly += monthly;
    existing.count += 1;
    existing.subs.push(sub);
    categorySpendMap.set(sub.category, existing);
  });

  const totalMonthly = Array.from(categorySpendMap.values()).reduce((acc, c) => acc + c.monthly, 0);
  const totalYearly = totalMonthly * 12;

  const categoryData = Array.from(categorySpendMap.entries())
    .map(([cat, val]) => {
      const percentage = totalMonthly > 0 ? (val.monthly / totalMonthly) * 100 : 0;
      const displayAmount = viewMode === 'MONTHLY' ? val.monthly : val.monthly * 12;
      return {
        category: cat,
        info: CATEGORY_INFO[cat] || CATEGORY_INFO.OTHER,
        monthly: val.monthly,
        displayAmount,
        percentage,
        count: val.count,
        subs: val.subs,
      };
    })
    .sort((a, b) => b.monthly - a.monthly);

  // Billing Cycle distribution
  const cycleCountMap: Record<string, number> = {};
  activeSubs.forEach(s => {
    cycleCountMap[s.billingCycle] = (cycleCountMap[s.billingCycle] || 0) + 1;
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs overflow-hidden">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            // ALLOCATION MATRIX
          </div>
          <h2 className="font-editorial text-2xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
            Spend Distribution
          </h2>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
            Active liabilities across {activeSubs.length} services
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-full border border-border bg-background self-start sm:self-auto">
          <button
            onClick={() => setViewMode('MONTHLY')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              viewMode === 'MONTHLY'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly View
          </button>
          <button
            onClick={() => setViewMode('YEARLY')}
            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
              viewMode === 'YEARLY'
                ? 'bg-foreground text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Annual Projection
          </button>
        </div>
      </div>

      {/* Main Grid: Visual bar stack + Category list */}
      <div className="mt-6 space-y-6">
        {/* Color Stacked Bar Meter */}
        <div>
          <div className="flex flex-wrap justify-between items-baseline gap-1 mb-2 font-mono text-xs uppercase tracking-wider">
            <span className="text-muted-foreground">// SHARE ALLOCATION</span>
            <span className="font-bold text-foreground">
              Total {viewMode === 'MONTHLY' ? 'Monthly' : 'Annual'}:{' '}
              {formatCurrency(viewMode === 'MONTHLY' ? totalMonthly : totalYearly)}
            </span>
          </div>

          <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted p-0.5 border border-border">
            {categoryData.map(item => (
              <div
                key={item.category}
                style={{
                  width: `${Math.max(item.percentage, 1)}%`,
                  backgroundColor: item.info.color,
                }}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-85 cursor-pointer relative group"
                onClick={() =>
                  setSelectedCategory(selectedCategory === item.category ? null : item.category)
                }
                title={`${item.info.label}: ${item.percentage.toFixed(1)}%`}
              />
            ))}
          </div>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categoryData.map(item => {
            const isSelected = selectedCategory === item.category;
            return (
              <div
                key={item.category}
                onClick={() =>
                  setSelectedCategory(isSelected ? null : item.category)
                }
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary/60 bg-primary/5 shadow-xs'
                    : 'border-border/60 hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.info.color }}
                    />
                    <span className="font-medium text-sm text-foreground truncate">
                      {item.info.label}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({item.count} {item.count === 1 ? 'sub' : 'subs'})
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-foreground">
                      {formatCurrency(item.displayAmount)}
                    </span>
                    <span className="text-[11px] text-muted-foreground ml-1">
                      /{viewMode === 'MONTHLY' ? 'mo' : 'yr'}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.info.color,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center mt-1.5 text-[11px] text-muted-foreground">
                  <span>{item.percentage.toFixed(1)}% of total spend</span>
                  {isSelected && (
                    <span className="text-primary font-medium">Click to collapse</span>
                  )}
                </div>

                {/* Expand sub list if selected */}
                {isSelected && (
                  <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
                    {item.subs.map(sub => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center text-xs text-foreground/80 py-0.5"
                      >
                        <span className="truncate pr-2">{sub.name}</span>
                        <span className="font-medium shrink-0">
                          {formatCurrency(calculateMonthlyCost(sub.cost, sub.billingCycle))}/mo
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wide">
              Top Category
            </span>
            <span className="font-semibold text-foreground text-sm mt-0.5 block truncate">
              {categoryData[0]?.info.label || 'None'}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {categoryData[0]?.percentage.toFixed(0)}% of monthly budget
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wide">
              Average Cost / Sub
            </span>
            <span className="font-semibold text-foreground text-sm mt-0.5 block">
              {activeSubs.length > 0
                ? formatCurrency(totalMonthly / activeSubs.length)
                : '$0.00'}
              /mo
            </span>
            <span className="text-muted-foreground text-[11px]">
              Across {activeSubs.length} active services
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
            <span className="text-muted-foreground block text-[11px] uppercase tracking-wide">
              Cycle Distribution
            </span>
            <span className="font-semibold text-foreground text-sm mt-0.5 block truncate">
              {cycleCountMap.MONTHLY || 0} Monthly • {cycleCountMap.YEARLY || 0} Yearly
            </span>
            <span className="text-muted-foreground text-[11px]">
              Billing cadences
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
