import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MarketCard from '@/components/MarketCard';
import { MarketGridSkeleton } from '@/components/LoadingSkeleton';
import { mockMarkets, Market } from '@/data/mockMarkets';
import { cn } from '@/lib/utils';

type SortOption = 'volume' | 'liquidity' | 'ending' | 'newest';
type CategoryFilter = 'all' | Market['category'];

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All Markets' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'rwa', label: 'RWA' },
  { value: 'mantle', label: 'Mantle' },
  { value: 'other', label: 'Other' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'volume', label: 'Highest Volume' },
  { value: 'liquidity', label: 'Most Liquidity' },
  { value: 'ending', label: 'Ending Soon' },
  { value: 'newest', label: 'Newest' },
];

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [isLoading, setIsLoading] = useState(false);

  const filteredMarkets = useMemo(() => {
    let markets = [...mockMarkets];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      markets = markets.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category !== 'all') {
      markets = markets.filter((m) => m.category === category);
    }

    // Sort
    switch (sortBy) {
      case 'volume':
        markets.sort((a, b) => b.volume - a.volume);
        break;
      case 'liquidity':
        markets.sort((a, b) => b.liquidity - a.liquidity);
        break;
      case 'ending':
        markets.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
        break;
      case 'newest':
        markets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return markets;
  }, [searchQuery, category, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setSortBy('volume');
  };

  const hasActiveFilters = searchQuery || category !== 'all' || sortBy !== 'volume';

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Prediction Markets</h1>
          <p className="text-muted-foreground">
            Browse and trade on {mockMarkets.length} active prediction markets
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap lg:flex-nowrap">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={category === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'whitespace-nowrap',
                    category === cat.value && 'gradient-primary text-white'
                  )}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {category !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory('all')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredMarkets.length} market{filteredMarkets.length !== 1 && 's'}
          </p>
        </div>

        {/* Markets Grid */}
        {isLoading ? (
          <MarketGridSkeleton count={6} />
        ) : filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market, index) => (
              <MarketCard key={market.id} market={market} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No markets found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Markets;
