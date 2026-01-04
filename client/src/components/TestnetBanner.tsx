import { ExternalLink, AlertTriangle } from 'lucide-react';
import { FAUCET_URL } from '@/config/wagmi';

const TestnetBanner = () => {
  return (
    <div className="bg-muted border-b border-border px-6 py-3">
      <div className="container mx-auto flex items-center justify-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-foreground" />
        <span className="text-foreground font-medium">
          Mantle Sepolia Testnet
        </span>
        <span className="text-muted-foreground hidden sm:inline">—</span>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:opacity-70 transition-opacity inline-flex items-center gap-1"
        >
          Get test MNT
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

export default TestnetBanner;
