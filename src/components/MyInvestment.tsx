import { Card, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';

interface MyInvestmentProps {
  data: {
    depositedKRWS: number;
    spvKRWSBalance: number;
    currentValue: number;
    totalEarnings: number;
    apy: number;
  };
}

export const MyInvestment: React.FC<MyInvestmentProps> = ({ data }) => {
  const formatKRW = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const roi = ((data.totalEarnings / data.depositedKRWS) * 100).toFixed(2);

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">My Investment</h3>
          <Badge variant="success" size="sm">
            {data.apy}% APY
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Value</p>
            <p className="text-2xl font-bold">{formatKRW(data.currentValue)}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Deposited</p>
              <p className="font-semibold">{formatKRW(data.depositedKRWS)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
              <p className="font-semibold text-success-600">
                +{formatKRW(data.totalEarnings)}
              </p>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">spvKRWS Balance</span>
              <span className="font-mono font-medium">
                {formatNumber(data.spvKRWSBalance)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">ROI</span>
              <span className="font-medium text-success-600">+{roi}%</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};