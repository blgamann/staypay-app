import { useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TokenInput } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { InfoTooltip } from '../components/ui/Tooltip';

interface VaultDashboardProps {
  address?: string;
}

// Balance Card Component
const BalanceCard = () => {
  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4">My Balance</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500"></div>
              <span className="font-medium text-base">KAIA</span>
            </div>
            <span className="font-mono font-semibold text-lg">0.00</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500"></div>
              <span className="font-medium text-base">KRWS</span>
            </div>
            <span className="font-mono font-semibold text-lg">0.00</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500"></div>
              <span className="font-medium text-base">spvKRWS</span>
            </div>
            <div className="text-right">
              <div className="font-mono font-semibold text-lg">0.00</div>
              <div className="text-xs text-gray-500">≈ 0.00 KRWS</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Vault Card Component (formerly TVL)
const VaultCard = () => {
  // Mock data - would come from contract
  const availableLiquidity = 15000000; // 15M KRWS available
  const activeLoans = 10000000; // 10M KRWS loaned out
  const tvl = availableLiquidity + activeLoans; // 25M KRWS total
  const utilizationRate = tvl > 0 ? ((activeLoans / tvl) * 100).toFixed(1) : '0.0';

  return (
    <Card>
      <CardBody>
        <h3 className="text-lg font-semibold mb-4">Vault</h3>
        <div className="space-y-4">
          <div>
            <div className="text-4xl font-bold">₩{(tvl / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-500 mt-1">Total Value Locked</div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Available Liquidity</span>
              <span className="font-semibold">₩{(availableLiquidity / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Loans</span>
              <span className="font-semibold">₩{(activeLoans / 1000000).toFixed(1)}M</span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600 text-sm">Utilization Rate</span>
                  <InfoTooltip 
                    content={`Utilization = (Loaned Amount / Total TVL) × 100\n\n• Below 60%: Safe but lower yields\n• 60-80%: Optimal range (balanced returns)\n• Above 80%: Higher yields but limited withdrawals`}
                    position="top"
                  />
                </div>
                <span className="font-medium text-sm">{utilizationRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    parseFloat(utilizationRate) > 80 ? 'bg-warning-500' : 
                    parseFloat(utilizationRate) > 60 ? 'bg-primary-500' : 
                    'bg-success-500'
                  }`}
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Loan Activity Card Component (formerly Loan Status)
const LoanActivityCard = () => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
  
  // Generate more realistic loan data
  const generateLoanActivities = () => {
    const activities = [];
    const now = Date.now();
    
    // Recent activities (last 7 days) - 12 activities
    activities.push(
      { type: 'issued', amount: 850000, time: '2 hours ago', timestamp: now - 2 * 60 * 60 * 1000, status: 'active' },
      { type: 'repaid', principal: 1200000, repaidAmount: 1224000, fee: 24000, time: '5 hours ago', timestamp: now - 5 * 60 * 60 * 1000, duration: 28 },
      { type: 'issued', amount: 2500000, time: '12 hours ago', timestamp: now - 12 * 60 * 60 * 1000, status: 'active' },
      { type: 'repaid', principal: 1800000, repaidAmount: 1836000, fee: 36000, time: '1 day ago', timestamp: now - 24 * 60 * 60 * 1000, duration: 30 },
      { type: 'issued', amount: 950000, time: '2 days ago', timestamp: now - 2 * 24 * 60 * 60 * 1000, status: 'active' },
      { type: 'repaid', principal: 1000000, repaidAmount: 1020000, fee: 20000, time: '2 days ago', timestamp: now - 2.5 * 24 * 60 * 60 * 1000, duration: 30 },
      { type: 'issued', amount: 3200000, time: '3 days ago', timestamp: now - 3 * 24 * 60 * 60 * 1000, status: 'active' },
      { type: 'repaid', principal: 750000, repaidAmount: 765000, fee: 15000, time: '4 days ago', timestamp: now - 4 * 24 * 60 * 60 * 1000, duration: 25 },
      { type: 'repaid', principal: 2100000, repaidAmount: 2142000, fee: 42000, time: '5 days ago', timestamp: now - 5 * 24 * 60 * 60 * 1000, duration: 31 },
      { type: 'issued', amount: 1650000, time: '5 days ago', timestamp: now - 5.5 * 24 * 60 * 60 * 1000, status: 'active' },
      { type: 'repaid', principal: 900000, repaidAmount: 918000, fee: 18000, time: '6 days ago', timestamp: now - 6 * 24 * 60 * 60 * 1000, duration: 27 },
      { type: 'overdue', amount: 450000, time: '6 days ago', timestamp: now - 6.5 * 24 * 60 * 60 * 1000, daysOverdue: 1 }
    );
    
    // Activities from last month (8-30 days) - 18 activities
    activities.push(
      { type: 'issued', amount: 1500000, time: '8 days ago', timestamp: now - 8 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 1500000, repaidAmount: 1530000, fee: 30000, time: '10 days ago', timestamp: now - 10 * 24 * 60 * 60 * 1000, duration: 29 },
      { type: 'issued', amount: 2200000, time: '12 days ago', timestamp: now - 12 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 2200000, repaidAmount: 2244000, fee: 44000, time: '14 days ago', timestamp: now - 14 * 24 * 60 * 60 * 1000, duration: 28 },
      { type: 'repaid', principal: 2000000, repaidAmount: 2040000, fee: 40000, time: '15 days ago', timestamp: now - 15 * 24 * 60 * 60 * 1000, duration: 29 },
      { type: 'issued', amount: 1750000, time: '18 days ago', timestamp: now - 18 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 1750000, repaidAmount: 1785000, fee: 35000, time: '20 days ago', timestamp: now - 20 * 24 * 60 * 60 * 1000, duration: 30 },
      { type: 'issued', amount: 3000000, time: '22 days ago', timestamp: now - 22 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 3000000, repaidAmount: 3060000, fee: 60000, time: '24 days ago', timestamp: now - 24 * 24 * 60 * 60 * 1000, duration: 28 },
      { type: 'issued', amount: 800000, time: '25 days ago', timestamp: now - 25 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 800000, repaidAmount: 816000, fee: 16000, time: '27 days ago', timestamp: now - 27 * 24 * 60 * 60 * 1000, duration: 29 },
      { type: 'issued', amount: 1900000, time: '28 days ago', timestamp: now - 28 * 24 * 60 * 60 * 1000, status: 'repaid' },
      { type: 'repaid', principal: 1900000, repaidAmount: 1938000, fee: 38000, time: '29 days ago', timestamp: now - 29 * 24 * 60 * 60 * 1000, duration: 30 }
    );
    
    // Older activities (31+ days) - 12 activities
    activities.push(
      { type: 'overdue', amount: 500000, time: '35 days ago', timestamp: now - 35 * 24 * 60 * 60 * 1000, daysOverdue: 35 },
      { type: 'repaid', principal: 1300000, repaidAmount: 1326000, fee: 26000, time: '40 days ago', timestamp: now - 40 * 24 * 60 * 60 * 1000, duration: 31 },
      { type: 'repaid', principal: 2400000, repaidAmount: 2448000, fee: 48000, time: '45 days ago', timestamp: now - 45 * 24 * 60 * 60 * 1000, duration: 30 },
      { type: 'repaid', principal: 1100000, repaidAmount: 1122000, fee: 22000, time: '50 days ago', timestamp: now - 50 * 24 * 60 * 60 * 1000, duration: 28 },
      { type: 'repaid', principal: 1600000, repaidAmount: 1632000, fee: 32000, time: '60 days ago', timestamp: now - 60 * 24 * 60 * 60 * 1000, duration: 29 },
      { type: 'repaid', principal: 2800000, repaidAmount: 2856000, fee: 56000, time: '75 days ago', timestamp: now - 75 * 24 * 60 * 60 * 1000, duration: 30 },
      { type: 'repaid', principal: 950000, repaidAmount: 969000, fee: 19000, time: '90 days ago', timestamp: now - 90 * 24 * 60 * 60 * 1000, duration: 31 }
    );
    
    return activities;
  };

  const allActivities = generateLoanActivities();

  // Filter activities based on selected time period
  const getFilteredActivities = () => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    switch (timeFilter) {
      case 'week':
        return allActivities.filter(a => a.timestamp >= weekAgo);
      case 'month':
        return allActivities.filter(a => a.timestamp >= monthAgo);
      case 'all':
        return allActivities;
      default:
        return allActivities;
    }
  };

  const activities = getFilteredActivities();
  
  // Calculate dynamic stats based on filtered activities
  const calculateStats = () => {
    const filtered = activities;
    const stats = {
      totalLoans: 0,
      repaid: 0,
      overdue: 0,
      active: 0,
    };
    
    filtered.forEach(activity => {
      if (activity.type === 'issued') {
        stats.totalLoans++;
        if (activity.status === 'active') {
          stats.active++;
        } else if (activity.status === 'repaid') {
          // Count as repaid (for older issued loans that were repaid)
          stats.repaid++;
        }
      } else if (activity.type === 'repaid') {
        // These are completed loans
        stats.repaid++;
        stats.totalLoans++;
      } else if (activity.type === 'overdue') {
        stats.overdue++;
        stats.totalLoans++;
      }
    });
    
    return stats;
  };
  
  const loanStats = calculateStats();

  const formatKRW = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'issued':
        return '📤';
      case 'repaid':
        return '📥';
      case 'overdue':
        return '⚠️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (type: string, status?: string) => {
    if (type === 'repaid') return 'text-blue-600 bg-blue-50';
    if (type === 'overdue') return 'text-red-600 bg-red-50';
    if (status === 'active') return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Loan Activity</h3>
          
          {/* Time Filter Buttons */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === 'week' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === 'month' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === 'all' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-xl font-bold">{loanStats.totalLoans}</div>
            <div className="text-xs text-gray-600">Total Loans</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{loanStats.repaid}</div>
            <div className="text-xs text-gray-600">Repaid</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{loanStats.overdue}</div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{loanStats.active}</div>
            <div className="text-xs text-gray-600">Active</div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activities in the selected period
            </div>
          ) : (
            activities.map((activity, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <span className="font-medium">
                      {activity.type === 'issued' && 'Loan Issued'}
                      {activity.type === 'repaid' && 'Loan Repaid'}
                      {activity.type === 'overdue' && 'Loan Overdue'}
                    </span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  
                  {activity.type === 'issued' && (
                    <div className="ml-7">
                      <div className="font-mono font-semibold">₩{formatKRW(activity.amount)}</div>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getStatusColor(activity.type, activity.status)}`}>
                        Active
                      </span>
                    </div>
                  )}
                  
                  {activity.type === 'repaid' && (
                    <div className="ml-7">
                      <div className="font-mono">
                        <span className="font-semibold">₩{formatKRW(activity.principal)}</span>
                        <span className="text-gray-500"> → </span>
                        <span className="font-semibold text-blue-600">₩{formatKRW(activity.repaidAmount)}</span>
                        <span className="text-sm text-green-600 ml-2">(+₩{formatKRW(activity.fee)} fee)</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Duration: {activity.duration} days</div>
                    </div>
                  )}
                  
                  {activity.type === 'overdue' && (
                    <div className="ml-7">
                      <div className="font-mono font-semibold">₩{formatKRW(activity.amount)}</div>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${getStatusColor(activity.type)}`}>
                        {activity.daysOverdue} days overdue
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )))}
        </div>
      </CardBody>
    </Card>
  );
};

// Deposit/Withdraw Card Component
const DepositWithdrawCard = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  return (
    <Card className="h-full">
      <CardBody>
        <div className="flex gap-0 mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'deposit' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'withdraw' 
                ? 'bg-primary-500 text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Withdraw
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-4 py-4 pr-32 text-2xl font-semibold bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => setAmount('0')}
                  className="px-3 py-1.5 text-sm font-semibold text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  MAX
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200">
                  <span className="font-semibold">KRWS</span>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'deposit' && (
            <>
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">You will receive</span>
                  <span className="font-semibold">0.00 spvKRWS</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Exchange Rate</span>
                  <div className="text-right font-semibold">
                    <div>1 KRWS</div>
                    <div>= 1 spvKRWS</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">APY</span>
                  <Badge variant="success" size="sm">0.00%</Badge>
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg"
                disabled={!amount || parseFloat(amount) <= 0}
                className="py-4 text-lg font-semibold"
              >
                Deposit KRWS
              </Button>
            </>
          )}

          {activeTab === 'withdraw' && (
            <>
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">You will receive</span>
                  <span className="font-semibold">0.00 KRWS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available to withdraw</span>
                  <span className="font-semibold">0.00 spvKRWS</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Exchange Rate</span>
                  <div className="text-right font-semibold">
                    <div>1 spvKRWS</div>
                    <div>= 1 KRWS</div>
                  </div>
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg"
                variant="outline"
                disabled={!amount || parseFloat(amount) <= 0}
                className="py-4 text-lg font-semibold"
              >
                Withdraw KRWS
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Main Dashboard Layout
export const VaultDashboard: React.FC<VaultDashboardProps> = ({ address }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Stats */}
        <div className="xl:col-span-8 space-y-6">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceCard />
            <VaultCard />
          </div>
          
          {/* Loan Activity */}
          <LoanActivityCard />
        </div>

        {/* Right Column - Deposit/Withdraw */}
        <div className="xl:col-span-4">
          <DepositWithdrawCard />
        </div>
      </div>
    </div>
  );
};