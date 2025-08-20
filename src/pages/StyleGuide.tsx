import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardBody, StatsCard } from '../components/ui/Card';
import { Input, TokenInput, PercentageInput } from '../components/ui/Input';
import { Badge, APYBadge, RiskBadge } from '../components/ui/Badge';

export const StyleGuide = () => {
  const [tokenAmount, setTokenAmount] = useState('');
  const [percentage, setPercentage] = useState(50);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">StayPay DeFi Components</h1>
        <p className="text-gray-600 mb-8">UI Component Style Guide</p>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Color Palette</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <div className="h-24 bg-primary-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-gray-500">#3B82F6</p>
            </div>
            <div>
              <div className="h-24 bg-success-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-gray-500">#10B981</p>
            </div>
            <div>
              <div className="h-24 bg-warning-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-gray-500">#F59E0B</p>
            </div>
            <div>
              <div className="h-24 bg-error-500 rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-gray-500">#EF4444</p>
            </div>
            <div>
              <div className="h-24 bg-defi-dark rounded-lg mb-2"></div>
              <p className="text-sm font-medium">Dark</p>
              <p className="text-xs text-gray-500">#0D111C</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <Card>
            <CardBody>
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Button variant="primary">Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                <div className="flex gap-4 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
                <div className="flex gap-4 items-center">
                  <Button isLoading>Loading...</Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth>Full Width Button</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cards</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card hover>
              <CardBody>
                <h3 className="font-semibold mb-2">Default Card</h3>
                <p className="text-gray-600">Hover me!</p>
              </CardBody>
            </Card>
            <Card variant="dark">
              <CardBody>
                <h3 className="font-semibold mb-2">Dark Card</h3>
                <p className="text-gray-400">For dark themes</p>
              </CardBody>
            </Card>
            <Card variant="gradient">
              <CardBody>
                <h3 className="font-semibold mb-2">Gradient Card</h3>
                <p className="text-white/90">Special highlights</p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Stats Cards</h2>
          <div className="grid grid-cols-4 gap-4">
            <StatsCard
              title="Total Value Locked"
              value="$1.2M"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard
              title="24h Volume"
              value="$450K"
              trend={{ value: 5.2, isPositive: false }}
            />
            <StatsCard
              title="APY"
              value="15.8%"
              subtitle="Variable rate"
            />
            <StatsCard
              title="Total Users"
              value="1,234"
            />
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Inputs</h2>
          <Card>
            <CardBody>
              <div className="space-y-6">
                <Input
                  label="Basic Input"
                  placeholder="Enter value..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                
                <Input
                  label="Input with Error"
                  placeholder="Enter value..."
                  error="This field is required"
                />
                
                <TokenInput
                  label="Token Amount"
                  value={tokenAmount}
                  onChange={setTokenAmount}
                  token={{ symbol: 'KAIA' }}
                  balance="100.00"
                  onMaxClick={() => setTokenAmount('100')}
                />
                
                <PercentageInput
                  label="Select Percentage"
                  value={percentage}
                  onChange={setPercentage}
                />
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Badges</h2>
          <Card>
            <CardBody>
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Badge>Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
                <div className="flex gap-2 items-center">
                  <APYBadge value={25.5} />
                  <APYBadge value={15.2} />
                  <APYBadge value={8.7} />
                </div>
                <div className="flex gap-2 items-center">
                  <RiskBadge level="low" />
                  <RiskBadge level="medium" />
                  <RiskBadge level="high" />
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Typography</h2>
          <Card>
            <CardBody>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <h2 className="text-3xl font-bold">Heading 2</h2>
                <h3 className="text-2xl font-bold">Heading 3</h3>
                <h4 className="text-xl font-semibold">Heading 4</h4>
                <p className="text-base">Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p className="text-sm text-gray-600">Small text - Supporting information</p>
                <p className="text-xs text-gray-500">Extra small text - Metadata</p>
                <p className="font-mono bg-gray-100 p-2 rounded">0x1234...5678 (Monospace)</p>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
};