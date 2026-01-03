import { ExternalLink, AlertTriangle } from 'lucide-react';
import { FAUCET_URL } from '@/config/wagmi';

const TestnetBanner = () => {
  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-warning font-medium">
          Mantle Sepolia Testnet
        </span>
        <span className="text-muted-foreground hidden sm:inline">—</span>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
        >
          Get test MNT
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default TestnetBanner;
