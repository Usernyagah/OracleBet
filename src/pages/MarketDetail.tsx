import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, TrendingUp, Droplets, ExternalLink, Loader2, Plus, Minus } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OddsGauge from '@/components/OddsGauge';
import { mockMarkets, mockPositions, getCategoryLabel, getCategoryColor, formatVolume, formatTimeRemaining } from '@/data/mockMarkets';
import { mantleSepolia, EXPLORER_URL } from '@/config/wagmi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock chart data
const generateChartData = (yesOdds: number) => {
  const data = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  for (let i = 30; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 0.1;
    const odds = Math.max(0.1, Math.min(0.9, yesOdds + variance * (i / 30)));
    data.push({
      date: new Date(now - i * dayMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yes: Math.round(odds * 100),
      no: Math.round((1 - odds) * 100),
    });
  }
  return data;
};

const MarketDetail = () => {
  const { id } = useParams();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, chainId: mantleSepolia.id });
  
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lpAmount, setLpAmount] = useState('');

  const market = mockMarkets.find((m) => m.id === id);
  const position = mockPositions.find((p) => p.marketId === id);
  const chartData = useMemo(() => market ? generateChartData(market.yesOdds) : [], [market]);

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Market not found</h2>
          <Link to="/markets">
            <Button>Back to Markets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const odds = side === 'yes' ? market.yesOdds : market.noOdds;
  const sharesReceived = amount ? (parseFloat(amount) / odds).toFixed(2) : '0';

  const handleTrade = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success(`Successfully bought ${sharesReceived} ${side.toUpperCase()} shares!`, {
      description: 'View on Mantle Explorer',
      action: {
        label: 'View TX',
        onClick: () => window.open(`${EXPLORER_URL}/tx/0x...`, '_blank'),
      },
    });
    
    setIsSubmitting(false);
    setAmount('');
  };

  const handleAddLiquidity = async () => {
    if (!isConnected || !lpAmount) return;
    
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success('Liquidity added successfully!');
    setIsSubmitting(false);
    setLpAmount('');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Back button */}
        <Link to="/markets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Markets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <Badge className={cn(getCategoryColor(market.category))}>
                    {getCategoryLabel(market.category)}
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeRemaining(market.endDate)}</span>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">{market.title}</h1>
                <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{market.description}</p>

                <OddsGauge yesOdds={market.yesOdds} size="lg" className="mb-6" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="border border-border rounded-lg p-4 text-center">
                    <TrendingUp className="h-5 w-5 text-foreground mx-auto mb-2" />
                    <div className="font-semibold text-foreground">{formatVolume(market.volume)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Volume</div>
                  </div>
                  <div className="border border-border rounded-lg p-4 text-center">
                    <Droplets className="h-5 w-5 text-foreground mx-auto mb-2" />
                    <div className="font-semibold text-foreground">{formatVolume(market.liquidity)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Liquidity</div>
                  </div>
                  <div className="border border-border rounded-lg p-4 text-center">
                    <div className="font-semibold text-success">{Math.round(market.yesOdds * 100)}¢</div>
                    <div className="text-xs text-muted-foreground mt-1">Yes Price</div>
                  </div>
                  <div className="border border-border rounded-lg p-4 text-center">
                    <div className="font-semibold text-destructive">{Math.round(market.noOdds * 100)}¢</div>
                    <div className="text-xs text-muted-foreground mt-1">No Price</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Price History</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="yesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="yes"
                        stroke="hsl(160 84% 39%)"
                        fill="url(#yesGradient)"
                        strokeWidth={2}
                        name="Yes %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Positions */}
            {position && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Your Position</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Side</div>
                      <Badge className={position.side === 'yes' ? 'bg-success' : 'bg-destructive'}>
                        {position.side.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Shares</div>
                      <div className="font-semibold">{position.shares}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Value</div>
                      <div className="font-semibold">${position.currentValue}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">P&L</div>
                      <div className={cn('font-semibold', position.pnl >= 0 ? 'text-success' : 'text-destructive')}>
                        {position.pnl >= 0 ? '+' : ''}{position.pnlPercentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trade Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <Tabs defaultValue="trade">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="trade">Trade</TabsTrigger>
                    <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="trade" className="space-y-4">
                    {/* Buy Yes/No Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={side === 'yes' ? 'default' : 'outline'}
                        onClick={() => setSide('yes')}
                        className={cn(side === 'yes' && 'bg-success text-white hover:opacity-90')}
                      >
                        Buy Yes
                      </Button>
                      <Button
                        variant={side === 'no' ? 'default' : 'outline'}
                        onClick={() => setSide('no')}
                        className={cn(side === 'no' && 'bg-destructive text-white hover:opacity-90')}
                      >
                        Buy No
                      </Button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Amount (MNT)</Label>
                        {balance && (
                          <span className="text-xs text-muted-foreground">
                            Balance: {parseFloat(balance.formatted).toFixed(4)} MNT
                          </span>
                        )}
                      </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    {/* Summary */}
                    <div className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price per share</span>
                        <span className="text-foreground">{Math.round(odds * 100)}¢</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shares received</span>
                        <span className="font-semibold text-foreground">{sharesReceived}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Potential payout</span>
                        <span className="font-semibold text-success">
                          {amount ? `${sharesReceived} MNT` : '-'}
                        </span>
                      </div>
                    </div>

                    <Button
                      className={cn('w-full', side === 'yes' ? 'bg-success' : 'bg-destructive', 'text-white hover:opacity-90')}
                      onClick={handleTrade}
                      disabled={!isConnected || isSubmitting || !amount}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : !isConnected ? (
                        'Connect Wallet'
                      ) : (
                        `Buy ${side.toUpperCase()}`
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="liquidity" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add Liquidity (MNT)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={lpAmount}
                        onChange={(e) => setLpAmount(e.target.value)}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Add liquidity to earn fees from trades. You'll receive LP tokens proportional to your share.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={handleAddLiquidity}
                        disabled={!isConnected || isSubmitting || !lpAmount}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!isConnected}
                      >
                        <Minus className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>

            {/* Market Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Market Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{market.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ends</span>
                    <span>{market.endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oracle</span>
                    <span>Chainlink</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract</span>
                    <a
                      href={`${EXPLORER_URL}/address/0x...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      0x1234...5678
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
