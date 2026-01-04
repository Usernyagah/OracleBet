import { cn } from '@/lib/utils';

interface OddsGaugeProps {
  yesOdds: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const OddsGauge = ({ yesOdds, size = 'md', showLabels = true, className }: OddsGaugeProps) => {
  const noOdds = 1 - yesOdds;
  const yesPercentage = Math.round(yesOdds * 100);
  const noPercentage = Math.round(noOdds * 100);
  
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-success font-medium">Yes {yesPercentage}%</span>
          <span className="text-destructive font-medium">No {noPercentage}%</span>
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden flex bg-muted', sizeClasses[size])}>
        <div 
          className="bg-success transition-all duration-500"
          style={{ width: `${yesPercentage}%` }}
        />
        <div 
          className="bg-destructive transition-all duration-500"
          style={{ width: `${noPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default OddsGauge;
