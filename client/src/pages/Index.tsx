import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import MarketCard from '@/components/MarketCard';
import { mockMarkets } from '@/data/mockMarkets';

const stats = [
  { label: 'Total Volume', value: '$1.2M+', icon: BarChart3 },
  { label: 'Active Markets', value: '24', icon: TrendingUp },
  { label: 'Low Fees', value: '0.1%', icon: Zap },
  { label: 'Secure', value: '100%', icon: Shield },
];

const Index = () => {
  const { isConnected } = useAccount();
  const featuredMarkets = mockMarkets.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-8 leading-tight text-foreground">
              OracleBet: Ultra-Low Fee Predictions on Mantle
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Bet on crypto prices, RWA yields & ecosystem events with the power of 
              decentralized oracles and Mantle's lightning-fast L2.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link to="/markets">
                  <Button size="lg" className="bg-foreground text-background hover:opacity-90">
                    Explore Markets
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button 
                      size="lg" 
                      onClick={openConnectModal}
                      className="bg-foreground text-background hover:opacity-90"
                    >
                      Connect Wallet
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </ConnectButton.Custom>
              )}
              <Link to="/markets">
                <Button size="lg" variant="outline">
                  View All Markets
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-24 max-w-4xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div 
                key={stat.label}
                className="text-center"
              >
                <stat.icon className="h-5 w-5 text-foreground mx-auto mb-4" />
                <div className="text-3xl font-semibold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-foreground">Featured Markets</h2>
              <p className="text-muted-foreground">Top prediction markets by volume</p>
            </div>
            <Link to="/markets">
              <Button variant="ghost" className="text-sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredMarkets.map((market, index) => (
              <MarketCard key={market.id} market={market} index={index} featured />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Simple, transparent, and decentralized prediction markets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Link your MetaMask or WalletConnect compatible wallet to get started.',
              },
              {
                step: '02',
                title: 'Choose a Market',
                description: 'Browse prediction markets on crypto, RWA, and Mantle ecosystem events.',
              },
              {
                step: '03',
                title: 'Trade & Win',
                description: 'Buy Yes or No shares. If your prediction is correct, redeem your winnings.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-border rounded-lg p-12 md:p-16 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">
              Ready to Start Predicting?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Join thousands of traders making predictions on the future of crypto, 
              real-world assets, and the Mantle ecosystem.
            </p>
            <Link to="/markets">
              <Button size="lg" className="bg-foreground text-background hover:opacity-90">
                Explore Markets
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
