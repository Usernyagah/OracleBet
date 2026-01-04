import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockPositions } from '@/data/mockMarkets';
import { mantleSepolia, EXPLORER_URL } from '@/config/wagmi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Portfolio = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, chainId: mantleSepolia.id });

  const totalValue = mockPositions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnl = mockPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnlPercentage = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

  const handleRedeem = async (marketId: string) => {
    toast.success('Position redeemed successfully!', {
      description: 'Funds have been sent to your wallet.',
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mx-auto mb-8">
            <Wallet className="h-10 w-10 text-background" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your portfolio, positions, and trading history.
          </p>
          <ConnectButton />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-lg">
            Track your positions and trading performance
          </p>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Wallet</div>
            <div className="font-mono text-sm truncate">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <a
              href={`${EXPLORER_URL}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">MNT Balance</div>
            <div className="text-2xl font-bold">
              {balance ? parseFloat(balance.formatted).toFixed(4) : '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">MNT</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">{mockPositions.length} positions</div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
            <div className={cn('text-2xl font-bold', totalPnl >= 0 ? 'text-success' : 'text-destructive')}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </div>
            <div className={cn('text-xs flex items-center gap-1', totalPnl >= 0 ? 'text-success' : 'text-destructive')}>
              {totalPnl >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {totalPnlPercentage.toFixed(1)}%
            </div>
          </Card>
        </motion.div>

        {/* Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Open Positions</h2>
            </div>

            {mockPositions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPositions.map((position) => (
                    <TableRow key={position.marketId}>
                      <TableCell>
                        <Link
                          to={`/market/${position.marketId}`}
                          className="font-medium hover:text-primary transition-colors line-clamp-1 max-w-[200px]"
                        >
                          {position.market.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            position.side === 'yes'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {position.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {position.shares}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Math.round(position.avgPrice * 100)}¢
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${position.currentValue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-mono',
                            position.pnl >= 0 ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {position.pnl >= 0 ? '+' : ''}
                          {position.pnlPercentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link to={`/market/${position.marketId}`}>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">No positions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start trading to build your portfolio
                </p>
                <Link to="/markets">
                  <Button className="bg-foreground text-background hover:opacity-90">
                    Explore Markets
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Resolved Positions (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Resolved Positions</h2>
            </div>
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">No resolved positions</h3>
              <p className="text-muted-foreground">
                Resolved markets will appear here for redemption
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;
