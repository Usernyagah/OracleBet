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
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-success/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="gradient-text">OracleBet:</span>{' '}
              <span className="text-foreground">Ultra-Low Fee Predictions on Mantle</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Bet on crypto prices, RWA yields & ecosystem events with the power of 
              decentralized oracles and Mantle's lightning-fast L2.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isConnected ? (
                <Link to="/markets">
                  <Button size="lg" className="gradient-primary text-white glow group">
                    Explore Markets
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <Button 
                      size="lg" 
                      onClick={openConnectModal}
                      className="gradient-primary text-white glow group"
                    >
                      Connect Wallet
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <div 
                key={stat.label}
                className="glass rounded-xl p-4 text-center"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Markets</h2>
              <p className="text-muted-foreground">Top prediction markets by volume</p>
            </div>
            <Link to="/markets">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMarkets.map((market, index) => (
              <MarketCard key={market.id} market={market} index={index} featured />
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, transparent, and decentralized prediction markets
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
                <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto glow"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Predicting?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join thousands of traders making predictions on the future of crypto, 
              real-world assets, and the Mantle ecosystem.
            </p>
            <Link to="/markets">
              <Button size="lg" className="gradient-primary text-white glow">
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
