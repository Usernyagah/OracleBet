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
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/market/${market.id}`}>
        <Card className={cn(
          'p-6 card-hover cursor-pointer group bg-card border-border'
        )}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <Badge variant="outline" className="shrink-0 text-xs">
              {getCategoryLabel(market.category)}
            </Badge>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTimeRemaining(market.endDate)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-medium text-base mb-6 line-clamp-2 group-hover:opacity-70 transition-opacity text-foreground leading-relaxed">
            {market.title}
          </h3>

          {/* Odds */}
          <OddsGauge yesOdds={market.yesOdds} className="mb-6" />

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{formatVolume(market.volume)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5" />
              <span>{formatVolume(market.liquidity)}</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MarketCard;
