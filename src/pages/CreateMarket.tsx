import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Info, Loader2, CheckCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import OddsGauge from '@/components/OddsGauge';
import { getCategoryLabel, getCategoryColor } from '@/data/mockMarkets';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Category = 'crypto' | 'rwa' | 'mantle' | 'other';
type OracleType = 'chainlink' | 'uma' | 'custom';

const CreateMarket = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('crypto');
  const [endDate, setEndDate] = useState('');
  const [oracleType, setOracleType] = useState<OracleType>('chainlink');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidForm = title.length >= 10 && description.length >= 20 && endDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isValidForm) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast.success('Market created successfully!', {
      description: 'Your prediction market is now live.',
      action: {
        label: 'View Market',
        onClick: () => navigate('/market/1'),
      },
    });
    
    setIsSubmitting(false);
    navigate('/markets');
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Market</h1>
          <p className="text-muted-foreground mb-8">
            Launch a new prediction market for the community to trade
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title">Market Question</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Ask a clear yes/no question that can be objectively resolved
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Will BTC reach $100,000 by December 2025?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {title.length}/150 characters
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Resolution Criteria</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe exactly how this market will be resolved..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {description.length}/500 characters
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="rwa">Real World Assets (RWA)</SelectItem>
                      <SelectItem value="mantle">Mantle Ecosystem</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate">Resolution Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={minDate}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Oracle Type */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Oracle Type</Label>
                    <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                  </div>
                  <Select value={oracleType} onValueChange={(v) => setOracleType(v as OracleType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chainlink">Chainlink (Price Feeds)</SelectItem>
                      <SelectItem value="uma">UMA (Optimistic Oracle)</SelectItem>
                      <SelectItem value="custom">Custom Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gradient-primary text-white"
                  disabled={!isValidForm || isSubmitting || !isConnected}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Market...
                    </>
                  ) : !isConnected ? (
                    'Connect Wallet to Create'
                  ) : (
                    'Create Market'
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Live Preview
              </h3>
              <Card className="p-5 card-hover">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Badge className={cn('shrink-0', getCategoryColor(category))}>
                    {getCategoryLabel(category)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {endDate ? new Date(endDate).toLocaleDateString() : 'No date set'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg mb-3">
                  {title || 'Your market question will appear here...'}
                </h3>

                {/* Description preview */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {description || 'Resolution criteria will appear here...'}
                </p>

                {/* Odds (placeholder) */}
                <OddsGauge yesOdds={0.5} className="mb-4" />

                {/* Stats placeholder */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
                  <span>Volume: $0</span>
                  <span>Liquidity: $0</span>
                </div>
              </Card>

              {/* Tips */}
              <div className="mt-6 glass rounded-xl p-4">
                <h4 className="font-medium mb-3">Tips for a good market:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    Ask a clear yes/no question
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    Define objective resolution criteria
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    Set a realistic end date
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    Choose the right oracle type
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarket;
