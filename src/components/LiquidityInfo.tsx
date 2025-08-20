import { Card, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';

interface LiquidityInfoProps {
  data: {
    availableLiquidity: number;
    loanedAmount: number;
    tvl: number;
  };
}

export const LiquidityInfo: React.FC<LiquidityInfoProps> = ({ data }) => {
  const formatKRW = (value: number) => {
    if (value >= 1000000000) {
      return `₩${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `₩${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `₩${(value / 1000).toFixed(0)}K`;
    }
    return `₩${value}`;
  };

  const availablePercent = ((data.availableLiquidity / data.tvl) * 100).toFixed(1);
  const loanedPercent = ((data.loanedAmount / data.tvl) * 100).toFixed(1);

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4">Liquidity Status</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">Available</p>
              <Badge variant="success" size="sm">
                {availablePercent}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-success-600">
              {formatKRW(data.availableLiquidity)}
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">Loaned Out</p>
              <Badge variant="info" size="sm">
                {loanedPercent}%
              </Badge>
            </div>
            <p className="text-xl font-semibold">
              {formatKRW(data.loanedAmount)}
            </p>
          </div>
          
          <div className="pt-3 border-t">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                <span className="text-sm">Available for withdrawal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm">Funding rent payments</span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Your funds are actively helping {Math.floor(data.loanedAmount / 1000000)} tenants pay rent on time
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};