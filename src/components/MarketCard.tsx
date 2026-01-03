import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OddsGauge from './OddsGauge';
import { Market, getCategoryLabel, getCategoryColor, formatVolume, formatTimeRemaining } from '@/data/mockMarkets';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  market: Market;
  index?: number;
  featured?: boolean;
}

const MarketCard = ({ market, index = 0, featured = false }: MarketCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/market/${market.id}`}>
        <Card className={cn(
          'p-5 card-hover cursor-pointer group bg-card border-border',
          featured && 'glow'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <Badge className={cn('shrink-0', getCategoryColor(market.category))}>
              {getCategoryLabel(market.category)}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimeRemaining(market.endDate)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {market.title}
          </h3>

          {/* Odds */}
          <OddsGauge yesOdds={market.yesOdds} className="mb-4" />

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{formatVolume(market.volume)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4" />
              <span>{formatVolume(market.liquidity)}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MarketCard;
