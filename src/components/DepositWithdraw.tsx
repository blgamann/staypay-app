import { useState } from 'react';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export const DepositWithdraw = () => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  // Mock data
  const mockBalance = {
    krws: 5000000,
    spvKrws: 1000000,
    availableWithdraw: 1025000,
  };

  const formatKRW = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const handleMax = () => {
    if (activeTab === 'deposit') {
      setAmount(mockBalance.krws.toString());
    } else {
      setAmount(mockBalance.availableWithdraw.toString());
    }
  };

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-bold mb-6">Manage Your Investment</h2>
        
        {/* Tab Switcher */}
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

        {/* Balance Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              {activeTab === 'deposit' ? 'KRWS Balance' : 'Available to Withdraw'}
            </span>
            <span className="font-mono font-semibold">
              ₩{formatKRW(activeTab === 'deposit' ? mockBalance.krws : mockBalance.availableWithdraw)}
            </span>
          </div>
          {activeTab === 'withdraw' && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">spvKRWS Balance</span>
              <span className="font-mono">{formatKRW(mockBalance.spvKrws)}</span>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (KRWS)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-4 pr-32 text-2xl font-semibold bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleMax}
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
              <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">You will receive</span>
                  <span className="font-semibold">
                    {amount ? formatKRW(Number(amount)) : '0'} spvKRWS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Current APY</span>
                  <Badge variant="success">15.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Monthly Est. Earnings</span>
                  <span className="font-semibold text-success-600">
                    ₩{amount ? formatKRW(Math.floor(Number(amount) * 0.152 / 12)) : '0'}
                  </span>
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg"
                disabled={!amount || Number(amount) <= 0}
                className="py-4 text-lg font-semibold"
              >
                Deposit KRWS
              </Button>

              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-800">
                  ✓ Your deposit helps provide liquidity for rent payments<br/>
                  ✓ Earn steady returns with low risk<br/>
                  ✓ Withdraw anytime (subject to available liquidity)
                </p>
              </div>
            </>
          )}

          {activeTab === 'withdraw' && (
            <>
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">You will receive</span>
                  <span className="font-semibold">
                    ₩{amount ? formatKRW(Number(amount)) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">spvKRWS to burn</span>
                  <span className="font-semibold">
                    {amount ? formatKRW(Number(amount)) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exchange Rate</span>
                  <span className="text-sm">1 spvKRWS = 1.025 KRWS</span>
                </div>
              </div>

              <Button 
                fullWidth 
                size="lg"
                variant="outline"
                disabled={!amount || Number(amount) <= 0 || Number(amount) > mockBalance.availableWithdraw}
                className="py-4 text-lg font-semibold"
              >
                Withdraw KRWS
              </Button>

              {Number(amount) > mockBalance.availableWithdraw && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Insufficient available liquidity. Maximum withdrawal: ₩{formatKRW(mockBalance.availableWithdraw)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};