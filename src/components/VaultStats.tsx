import { Card, CardBody } from './ui/Card';

interface VaultStatsProps {
  data: {
    tvl: number;
    activeLoans: number;
    averageAPY: number;
    utilizationRate: number;
  };
}

export const VaultStats: React.FC<VaultStatsProps> = ({ data }) => {
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

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4">Vault Performance</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Value Locked</p>
            <p className="text-2xl font-bold">{formatKRW(data.tvl)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Loans</p>
              <p className="font-semibold">{data.activeLoans}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg APY</p>
              <p className="font-semibold text-success-600">{data.averageAPY}%</p>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Utilization Rate</span>
              <span className="font-medium">{data.utilizationRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  data.utilizationRate > 80 ? 'bg-warning-500' : 
                  data.utilizationRate > 60 ? 'bg-primary-500' : 
                  'bg-success-500'
                }`}
                style={{ width: `${data.utilizationRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optimal range: 60-80%
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};