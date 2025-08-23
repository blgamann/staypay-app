import { useState, useEffect } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { InfoTooltip } from "../components/ui/Tooltip";
import {
  useVaultData,
  useUserBalances,
  useExchangeRate,
  useDeposit,
  useWithdraw,
  useApprove,
  useLend,
  useRepay,
  useDebt,
  useMintKRWS,
} from "../contracts/hooks";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import kaiaIcon from "../assets/kaia.png";
import krwcIcon from "../assets/krwc.png";
import { 
  getLoanActivities, 
  getTimeAgo, 
  addLoanActivity, 
  updateLoanToRepaid,
  type LoanActivity 
} from "../utils/loanStorage";

// Utility function to format numbers with commas
const formatNumber = (num: number, decimals: number = 2): string => {
  const [integerPart, decimalPart] = num.toFixed(decimals).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

interface VaultDashboardProps {
  address?: string;
  isCorrectNetwork?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

// KRWS Mint Dialog Component
const MintDialog = ({
  isOpen,
  onClose,
  onTransactionComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onTransactionComplete: () => void;
}) => {
  const { address: connectedAddress } = useAccount();
  const [mintAddress, setMintAddress] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const {
    mint,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
    krwsAddress,
  } = useMintKRWS();

  // Set default address when dialog opens
  useEffect(() => {
    if (isOpen && connectedAddress) {
      setMintAddress(connectedAddress);
    }
  }, [isOpen, connectedAddress]);

  // Handle successful mint
  useEffect(() => {
    if (isConfirmed) {
      onTransactionComplete();
      onClose();
      reset();
      setStatusMessage("");
      setMintAddress("");
    }
  }, [isConfirmed, onClose, onTransactionComplete, reset]);

  // Handle errors
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied")
      ) {
        setStatusMessage("");
        reset();
      } else {
        setStatusMessage("Mint failed. Please try again.");
      }
    }
  }, [isError, error, reset]);

  const handleMint = async () => {
    if (!mintAddress) {
      setStatusMessage("Please enter an address");
      return;
    }

    // Basic address validation
    if (!mintAddress.startsWith("0x") || mintAddress.length !== 42) {
      setStatusMessage("Invalid address format");
      return;
    }

    try {
      setStatusMessage("");
      await mint(mintAddress, "1000000"); // 1 million KRWS
    } catch (err: any) {
      console.error("Mint error:", err);
      setStatusMessage(err?.message || "Mint failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-defi-card rounded-2xl p-6 max-w-md w-full border border-defi-border">
        <h3 className="text-xl font-bold text-white mb-4">Mint Test KRWS</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-defi-light-text mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-defi-darker border border-defi-border rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-defi-medium-text font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-defi-darker rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-defi-medium-text">Amount to mint:</span>
              <span className="font-mono font-bold text-xl text-white">
                {formatNumber(1000000, 0)} KRWS
              </span>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                statusMessage.includes("success")
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-red-500/20 text-red-400 border border-red-500/50"
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              fullWidth
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMint}
              variant="primary"
              fullWidth
              disabled={
                !mintAddress || !krwsAddress || isPending || isConfirming
              }
            >
              {isPending || isConfirming ? "Minting..." : "Mint KRWS"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Balance Card Component
const BalanceCard = ({
  balances,
  isConnected = true,
  isCorrectNetwork = true,
  onTransactionComplete,
}: {
  balances: ReturnType<typeof useUserBalances>;
  isConnected?: boolean;
  isCorrectNetwork?: boolean;
  onTransactionComplete?: () => void;
}) => {
  const shouldShowData = isConnected && isCorrectNetwork;
  const [showMintDialog, setShowMintDialog] = useState(false);
  // Hardcoded KRWS address for Kairos testnet
  const KRWS_ADDRESS = "0xA60100f0A4dbcaD4814344BA04F8c53918A5f968";
  const VAULT_ADDRESS = "0xD967bB022e1185658A287efCC7e25f40BF77395a";

  const openExplorer = (address: string) => {
    window.open(`https://kairos.kaiascan.io/address/${address}`, "_blank");
  };

  return (
    <>
      <Card>
        <CardBody>
          <h3 className="text-lg font-semibold mb-4 text-white">My Balance</h3>
          {!shouldShowData && (
            <div className="mb-4 p-3 bg-defi-darker rounded-lg">
              <p className="text-sm text-defi-medium-text text-center">
                {!isConnected
                  ? "Connect your wallet to view balances"
                  : "Switch to Kairos network to view balances"}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={kaiaIcon}
                  alt="KAIA"
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium text-base">KAIA</span>
              </div>
              <span className="font-mono font-semibold text-lg text-white">
                {shouldShowData ? formatNumber(balances.kaia, 4) : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img
                  src={krwcIcon}
                  alt="KRWS"
                  className="w-8 h-8 rounded-full"
                />
                <button
                  onClick={() => openExplorer(KRWS_ADDRESS)}
                  className="font-medium text-base underline hover:text-primary-600 cursor-pointer transition-colors"
                >
                  KRWS
                </button>
              </div>
              <span className="font-mono font-semibold text-lg text-white">
                {shouldShowData ? formatNumber(balances.krws, 2) : "--"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 p-0.5 flex items-center justify-center">
                  <img
                    src={krwcIcon}
                    alt="spvKRWS"
                    className="w-full h-full rounded-full"
                    style={{ filter: "invert(1)" }}
                  />
                </div>
                <button
                  onClick={() => openExplorer(VAULT_ADDRESS)}
                  className="font-medium text-base underline hover:text-primary-600 cursor-pointer transition-colors"
                >
                  spvKRWS
                </button>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold text-lg text-white">
                  {shouldShowData ? formatNumber(balances.spvKRWS, 2) : "--"}
                </div>
                <div className="text-xs text-defi-medium-text">
                  {shouldShowData
                    ? `≈ ${formatNumber(balances.spvKRWSInKRWS, 2)} KRWS`
                    : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Faucet Links Section */}
          <div className="mt-4 pt-4 border-t border-defi-border">
            <div className="text-xs text-defi-medium-text mb-2">
              Need test tokens?
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open("https://faucet.kaia.io/", "_blank")}
                className="flex-1 px-3 py-2 bg-defi-darker rounded-lg hover:bg-defi-border transition-colors text-defi-light-text hover:text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>💧</span>
                  <span className="text-sm font-medium">Get KAIA</span>
                </div>
              </button>
              <button
                onClick={() => setShowMintDialog(true)}
                className="flex-1 px-3 py-2 bg-defi-darker rounded-lg hover:bg-defi-border transition-colors text-defi-light-text hover:text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>💧</span>
                  <span className="text-sm font-medium">Get KRWS</span>
                </div>
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Mint Dialog */}
      <MintDialog
        isOpen={showMintDialog}
        onClose={() => setShowMintDialog(false)}
        onTransactionComplete={() => {
          onTransactionComplete?.();
          balances.refetch();
        }}
      />
    </>
  );
};

// Vault Card Component (formerly TVL)
const VaultCard = ({
  vaultData,
}: {
  vaultData: ReturnType<typeof useVaultData>;
}) => {
  const VAULT_ADDRESS = "0xD967bB022e1185658A287efCC7e25f40BF77395a";

  const openExplorer = (address: string) => {
    window.open(`https://kairos.kaiascan.io/address/${address}`, "_blank");
  };

  return (
    <Card>
      <CardBody>
        <button
          onClick={() => openExplorer(VAULT_ADDRESS)}
          className="block text-lg font-semibold mb-4 underline hover:text-primary-600 cursor-pointer transition-colors text-left"
        >
          Vault
        </button>
        <div className="space-y-4">
          <div>
            <div className="text-4xl font-bold text-white">
              ₩{formatNumber(vaultData.tvl, 2)}
            </div>
            <div className="text-sm text-defi-medium-text mt-1">
              Total Value Locked
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-defi-medium-text">Available Liquidity</span>
              <span className="font-semibold text-white">
                ₩{formatNumber(vaultData.availableLiquidity, 2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-defi-medium-text">Active Loans</span>
              <span className="font-semibold text-white">
                ₩{formatNumber(vaultData.activeLoans, 2)}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-defi-medium-text text-sm">
                    Utilization Rate
                  </span>
                  <InfoTooltip
                    content={`Utilization = (Loaned Amount / Total TVL) × 100\n\n• Below 60%: Safe but lower yields\n• 60-80%: Optimal range (balanced returns)\n• Above 80%: Higher yields but limited withdrawals`}
                    position="top"
                  />
                </div>
                <span className="font-medium text-sm">
                  {vaultData.utilizationRate}%
                </span>
              </div>
              <div className="w-full bg-defi-border rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    parseFloat(vaultData.utilizationRate) > 80
                      ? "bg-warning-500"
                      : parseFloat(vaultData.utilizationRate) > 60
                      ? "bg-primary-500"
                      : "bg-success-500"
                  }`}
                  style={{ width: `${vaultData.utilizationRate}%` }}
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
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "all">(
    "week"
  );
  const [activities, setActivities] = useState<LoanActivity[]>([]);

  // Load activities from localStorage on mount and refresh
  useEffect(() => {
    const loadActivities = () => {
      const stored = getLoanActivities();
      // Combine stored activities with some dummy data for demo
      const dummyActivities = generateDummyActivities();
      const combined = [...stored, ...dummyActivities];
      setActivities(combined);
    };

    loadActivities();
    // Refresh every 2 seconds to catch new activities
    const interval = setInterval(loadActivities, 2000);
    return () => clearInterval(interval);
  }, []);

  // Generate some dummy activities for demo
  const generateDummyActivities = (): LoanActivity[] => {
    const now = Date.now();
    const activities: LoanActivity[] = [
      {
        id: 'dummy_1',
        type: "repaid",
        amount: 1200000,
        principal: 1200000,
        repaidAmount: 1224000,
        fee: 24000,
        duration: 28,
        timestamp: now - 5 * 60 * 60 * 1000,
        status: "repaid",
      },
      {
        id: 'dummy_2',
        type: "issued",
        amount: 1500000,
        timestamp: now - 12 * 60 * 60 * 1000,
        status: "active",
      },
    ];

    return activities;
  };

  // Filter activities based on selected time period
  const getFilteredActivities = () => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    switch (timeFilter) {
      case "week":
        return activities.filter((a) => a.timestamp >= weekAgo);
      case "month":
        return activities.filter((a) => a.timestamp >= monthAgo);
      case "all":
        return activities;
      default:
        return activities;
    }
  };

  const filteredActivities = getFilteredActivities();

  // Calculate stats
  const loanStats = {
    totalLoans: 0,
    repaid: 0,
    overdue: 0,
    active: 0,
  };

  filteredActivities.forEach((activity) => {
    if (activity.type === "issued") {
      loanStats.totalLoans++;
      const daysSince = Math.floor((Date.now() - activity.timestamp) / (1000 * 60 * 60 * 24));
      if (activity.status === "repaid") {
        loanStats.repaid++;
      } else if (daysSince > 30) {
        loanStats.overdue++;
      } else {
        loanStats.active++;
      }
    } else if (activity.type === "repaid") {
      loanStats.totalLoans++;
      loanStats.repaid++;
    }
  });

  const formatKRW = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "issued": return "📤";
      case "repaid": return "📥";
      case "overdue": return "⚠️";
      default: return "📄";
    }
  };


  return (
    <Card>
      <CardBody className="flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Loan Activity</h3>

          <div className="flex gap-1 bg-defi-darker rounded-lg p-0.5">
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === "week"
                  ? "bg-defi-card text-primary-400 shadow-sm"
                  : "text-defi-medium-text hover:text-defi-light-text"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === "month"
                  ? "bg-defi-card text-primary-400 shadow-sm"
                  : "text-defi-medium-text hover:text-defi-light-text"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                timeFilter === "all"
                  ? "bg-defi-card text-primary-400 shadow-sm"
                  : "text-defi-medium-text hover:text-defi-light-text"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 p-3 bg-defi-darker rounded-lg mb-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{loanStats.totalLoans}</div>
            <div className="text-xs text-defi-medium-text">Total Loans</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{loanStats.repaid}</div>
            <div className="text-xs text-defi-medium-text">Repaid</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{loanStats.overdue}</div>
            <div className="text-xs text-defi-medium-text">Overdue</div>
            <div className="text-xs text-defi-medium-text">(&gt;1 month)</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{loanStats.active}</div>
            <div className="text-xs text-defi-medium-text">Active</div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "542px" }}>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-defi-medium-text">
              No activities in the selected period
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const daysSince = Math.floor((Date.now() - activity.timestamp) / (1000 * 60 * 60 * 24));
              const isOverdue = activity.type === "issued" && activity.status !== "repaid" && daysSince > 30;
              
              return (
                <div key={activity.id} className="border-l-2 border-gray-200 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getActivityIcon(isOverdue ? "overdue" : activity.type)}
                        </span>
                        <span className="font-medium text-white">
                          {isOverdue && "Loan Overdue"}
                          {!isOverdue && activity.type === "issued" && "Loan Issued"}
                          {activity.type === "repaid" && "Loan Repaid"}
                        </span>
                        <span className="text-xs text-defi-medium-text">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      {activity.type === "issued" && (
                        <div className="ml-7">
                          <div className="font-mono font-semibold text-white">
                            ₩{formatKRW(activity.amount)}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                              isOverdue 
                                ? "text-red-600 bg-red-50"
                                : "text-green-600 bg-green-50"
                            }`}
                          >
                            {isOverdue ? `${daysSince - 30} days overdue` : 'Active'}
                          </span>
                        </div>
                      )}

                      {activity.type === "repaid" && activity.principal && (
                        <div className="ml-7">
                          <div className="font-mono">
                            <span className="font-semibold text-white">
                              ₩{formatKRW(activity.principal)}
                            </span>
                            <span className="text-defi-medium-text"> → </span>
                            <span className="font-semibold text-blue-600">
                              ₩{formatKRW(activity.repaidAmount || activity.principal)}
                            </span>
                            {activity.fee && (
                              <span className="text-sm text-green-600 ml-2">
                                (+₩{formatKRW(activity.fee)} fee)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Debug Section Component
const DebugSection = ({
  onTransactionComplete,
  vaultData,
  onRefetchExchangeRate,
  isCorrectNetwork = true,
  isConnected = true,
  onConnectWallet,
}: {
  onTransactionComplete: () => void;
  isCorrectNetwork?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
  vaultData: ReturnType<typeof useVaultData>;
  onRefetchExchangeRate: () => void;
}) => {
  const { address } = useAccount();
  const shouldEnableInputs = isConnected && isCorrectNetwork;
  const [lendAmount, setLendAmount] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [pendingRepay, setPendingRepay] = useState(false);

  const MAX_LOAN_AMOUNT = 2000000; // 2,000,000 KRWS max

  const { totalDebt, principal, fee, refetchDebt } = useDebt();
  const {
    lend,
    isPending: isLending,
    isConfirming: isLendConfirming,
    isConfirmed: isLendConfirmed,
    reset: resetLend,
  } = useLend();

  const {
    repay,
    approveRepay,
    // Approve states
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveError,
    resetApprove,
    // Repay states
    isRepayPending,
    isRepayConfirming,
    isRepayConfirmed,
    repayError,
    resetRepay,
    // Allowance
    refetchAllowance,
    krwsAddress,
  } = useRepay();

  // Handle lend success
  useEffect(() => {
    if (isLendConfirmed && lendAmount) {
      console.log("Lend confirmed!");
      
      // Add loan activity to localStorage
      const amount = parseFloat(lendAmount);
      addLoanActivity({
        type: "issued",
        amount: amount,
        principal: amount,  // Store as principal for matching when repaying
        status: "active",
        address: address,   // Store address for better matching
      });
      
      setDebugMessage("Loan issued successfully!");
      setLendAmount(""); // Clear input after successful lend
      onTransactionComplete();
      onRefetchExchangeRate(); // Refetch exchange rate
      refetchDebt();
      resetLend();
      setTimeout(() => setDebugMessage(""), 3000);
    }
  }, [
    isLendConfirmed,
    onTransactionComplete,
    onRefetchExchangeRate,
    refetchDebt,
    resetLend,
  ]);

  // Handle approve error or cancellation for repay
  useEffect(() => {
    if (approveError) {
      console.error("Repay approve error:", approveError);
      const errorMessage = approveError.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("rejected")
      ) {
        // User cancelled - just reset state, no error message
        setPendingRepay(false);
        resetApprove();
      } else {
        // Actual error occurred
        setDebugMessage("Failed to approve repayment. Please try again.");
        setPendingRepay(false);
      }
    }
  }, [approveError, resetApprove]);

  // Handle successful approve - automatically trigger repay
  useEffect(() => {
    const executeRepay = async () => {
      if (isApproveConfirmed && pendingRepay && !isRepayPending) {
        console.log("Repay approval confirmed! Now repaying...");

        // Immediately set pendingRepay to false to prevent duplicate execution
        setPendingRepay(false);

        // Wait a bit for allowance to be updated on chain
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Force refetch allowance
        const { data: newAllowance } = await refetchAllowance();
        console.log("New allowance after approval:", newAllowance);

        try {
          await repay(); // Repay for self
        } catch (error: any) {
          console.error("Error repaying after approval:", error);
          setDebugMessage(
            error?.message || "Repay failed after approval. Please try again."
          );
        }

        resetApprove(); // Reset approve state
      }
    };

    executeRepay();
  }, [isApproveConfirmed, pendingRepay, isRepayPending]); // Reduced dependencies

  // Handle repay error or cancellation
  useEffect(() => {
    if (repayError) {
      console.error("Repay error:", repayError);
      const errorMessage = repayError.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("rejected")
      ) {
        // User cancelled - just reset state, no error message
        setPendingRepay(false);
        resetRepay();
      } else {
        // Actual error occurred
        setDebugMessage("Repay failed. Please try again.");
        setPendingRepay(false);
      }
    }
  }, [repayError, resetRepay]);

  // Handle repay success
  useEffect(() => {
    if (isRepayConfirmed) {
      console.log("Repay confirmed!");
      
      // Update loan activity to repaid
      if (principal > 0 && fee >= 0) {
        updateLoanToRepaid(principal, fee, address);
      }
      
      setDebugMessage("Loan repaid successfully!");
      setPendingRepay(false);
      onTransactionComplete();
      onRefetchExchangeRate(); // Refetch exchange rate
      refetchDebt();
      resetRepay();
      setTimeout(() => setDebugMessage(""), 3000);
    }
  }, [
    isRepayConfirmed,
    onTransactionComplete,
    onRefetchExchangeRate,
    refetchDebt,
    resetRepay,
  ]);

  const handleLend = async () => {
    if (!lendAmount || parseFloat(lendAmount) <= 0) return;

    const amount = parseFloat(lendAmount);
    if (amount > MAX_LOAN_AMOUNT) {
      setDebugMessage(
        `Amount exceeds maximum limit (${MAX_LOAN_AMOUNT.toLocaleString()} KRWS)`
      );
      return;
    }

    try {
      setDebugMessage("");
      await lend(lendAmount); // Lend to self
    } catch (error: any) {
      console.error("Lend error:", error);
      setDebugMessage(error?.message || "Lend failed");
    }
  };

  const handleRepay = async () => {
    if (totalDebt <= 0) return;

    setDebugMessage("");

    try {
      // Force refetch allowance before checking
      const { data: currentAllowance } = await refetchAllowance();
      const actualAllowance = currentAllowance
        ? Number(formatUnits(currentAllowance as bigint, 18))
        : 0;

      console.log(
        "Current allowance for repay:",
        actualAllowance,
        "Total debt:",
        totalDebt
      );

      // Check if we need approval
      if (actualAllowance < totalDebt) {
        console.log(
          "Needs approval for repay. Current allowance:",
          actualAllowance,
          "Total debt:",
          totalDebt
        );
        setPendingRepay(true); // Set flag to trigger repay after approval
        approveRepay(totalDebt.toString()); // Don't await here, let useEffect handle the flow
      } else {
        console.log("Sufficient allowance. Repaying...");
        await repay(); // Repay for self
      }
    } catch (error: any) {
      console.error("Error in handleRepay:", error);
      setDebugMessage(
        error?.message || "Transaction failed. Please try again."
      );
      setPendingRepay(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Lend Section */}
      <div className="p-4 bg-defi-card border border-defi-border rounded-lg">
        <h4 className="font-medium mb-3">📤 Issue Loan</h4>
        <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md mb-3">
          💡 Fixed fee: 2% of loan amount
        </div>
        <div className="space-y-2 mb-2">
          <div className="relative">
            <input
              type="number"
              value={lendAmount}
              onChange={(e) => setLendAmount(e.target.value)}
              placeholder="0.0"
              disabled={!shouldEnableInputs}
              className="w-full px-3 py-2 pr-24 bg-defi-darker border border-defi-border rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-defi-medium-text"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-sm font-medium text-defi-medium-text">
                KRWS
              </span>
            </div>
          </div>
        </div>
        <Button
          fullWidth
          onClick={!isConnected ? onConnectWallet : handleLend}
          disabled={
            !isCorrectNetwork ||
            !lendAmount ||
            parseFloat(lendAmount) <= 0 ||
            parseFloat(lendAmount) > MAX_LOAN_AMOUNT ||
            isLending ||
            isLendConfirming
          }
          variant="primary"
          size="sm"
        >
          {!isConnected
            ? "Connect Wallet"
            : !isCorrectNetwork
            ? "Switch Network"
            : isLending || isLendConfirming
            ? "Lending..."
            : "Lend to Myself"}
        </Button>
        <div className="text-xs text-defi-medium-text mt-3 space-y-1">
          <div>
            Available: {vaultData.availableLiquidity.toLocaleString()} KRWS
          </div>
          <div>Max Loan: {MAX_LOAN_AMOUNT.toLocaleString()} KRWS</div>
        </div>
      </div>

      {/* Repay Section */}
      <div className="p-4 bg-defi-card border border-defi-border rounded-lg">
        <h4 className="font-medium mb-3">💰 Repay Loan</h4>
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-defi-medium-text">Principal:</span>
            <span className="font-medium text-white">
              {principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KRWS
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-defi-medium-text">Fee:</span>
            <span className="font-medium text-white">
              {fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KRWS
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-3 mt-2 border-t border-defi-border">
            <span>Total Debt:</span>
            <span>{totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KRWS</span>
          </div>
        </div>
        <Button
          fullWidth
          onClick={!isConnected ? onConnectWallet : handleRepay}
          disabled={
            !isCorrectNetwork ||
            totalDebt <= 0 ||
            isApprovePending ||
            isApproveConfirming ||
            isRepayPending ||
            isRepayConfirming ||
            pendingRepay ||
            !krwsAddress
          }
          variant="primary"
          size="sm"
        >
          {!isConnected
            ? "Connect Wallet"
            : !isCorrectNetwork
            ? "Switch Network"
            : !krwsAddress
            ? "Loading..."
            : isApprovePending || isApproveConfirming
            ? "Approving..."
            : pendingRepay
            ? "Waiting for approval..."
            : isRepayPending || isRepayConfirming
            ? "Repaying..."
            : totalDebt <= 0
            ? "No Debt"
            : "Repay All"}
        </Button>
      </div>

      {/* Status Message */}
      {debugMessage && (
        <div
          className={`p-3 rounded-lg text-sm ${
            debugMessage.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {debugMessage}
        </div>
      )}

    </div>
  );
};

// Deposit/Withdraw Card Component
const DepositWithdrawCard = ({
  balances,
  onTransactionComplete,
  vaultData,
  isCorrectNetwork = true,
  isConnected = true,
  onConnectWallet,
}: {
  balances: ReturnType<typeof useUserBalances>;
  onTransactionComplete: () => void;
  vaultData: ReturnType<typeof useVaultData>;
  isCorrectNetwork?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}) => {
  const shouldEnableInputs = isConnected && isCorrectNetwork;
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingDeposit, setPendingDeposit] = useState(false);

  const exchangeRate = useExchangeRate();
  const {
    approve,
    isPending: isApproving,
    isConfirming: isApproveConfirming,
    isConfirmed: isApproveConfirmed,
    isLoadingKrwsAddress,
    krwsAddress,
    error: approveError,
    reset: resetApprove,
    refetchAllowance,
  } = useApprove();
  const {
    deposit,
    isPending: isDepositing,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    error: depositError,
    reset: resetDeposit,
  } = useDeposit();
  const {
    withdraw,
    isPending: isWithdrawing,
    isConfirming: isWithdrawConfirming,
    isConfirmed: isWithdrawConfirmed,
    error: withdrawError,
    reset: resetWithdraw,
    refetchMaxWithdraw,
  } = useWithdraw();

  // Clear error message when switching tabs
  useEffect(() => {
    setErrorMessage("");
  }, [activeTab]);

  // Handle approve error or cancellation
  useEffect(() => {
    if (approveError) {
      console.error("Approve error:", approveError);
      // Check if user rejected the transaction
      const errorMessage = approveError.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("rejected")
      ) {
        // User cancelled - just reset state, no error message
        setPendingDeposit(false);
        resetApprove();
      } else {
        // Actual error occurred
        setErrorMessage("Failed to approve. Please try again.");
        setPendingDeposit(false);
      }
    }
  }, [approveError, resetApprove]);

  // Handle successful approve - automatically trigger deposit
  useEffect(() => {
    const executeDeposit = async () => {
      if (isApproveConfirmed && pendingDeposit && !isDepositing) {
        console.log("Approval confirmed! Now depositing...");

        // Immediately set pendingDeposit to false to prevent duplicate execution
        setPendingDeposit(false);

        // Wait a bit for allowance to be updated on chain
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Force refetch allowance
        const { data: newAllowance } = await refetchAllowance();
        console.log("New allowance after approval:", newAllowance);

        try {
          await deposit(amount);
        } catch (error: any) {
          console.error("Error depositing after approval:", error);
          setErrorMessage(
            error?.message || "Deposit failed after approval. Please try again."
          );
        }

        resetApprove(); // Reset approve state
      }
    };

    executeDeposit();
  }, [isApproveConfirmed, pendingDeposit, isDepositing]); // Reduced dependencies

  // Handle successful deposit
  useEffect(() => {
    if (isDepositConfirmed) {
      console.log("Deposit confirmed!");
      setAmount(""); // Clear input
      setErrorMessage("");
      setPendingDeposit(false);
      onTransactionComplete(); // Refetch balances and vault data
      exchangeRate.refetch(); // Refetch exchange rate
      refetchMaxWithdraw(); // Refetch max withdraw amount for withdraw section
      resetDeposit(); // Reset deposit state
    }
  }, [
    isDepositConfirmed,
    onTransactionComplete,
    resetDeposit,
    refetchMaxWithdraw,
  ]);

  // Handle deposit error or cancellation
  useEffect(() => {
    if (depositError) {
      console.error("Deposit error:", depositError);
      const errorMessage = depositError.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("rejected")
      ) {
        // User cancelled - just reset state, no error message
        setPendingDeposit(false);
        resetDeposit();
      } else {
        // Actual error occurred
        setErrorMessage("Deposit failed. Please try again.");
        setPendingDeposit(false);
      }
    }
  }, [depositError, resetDeposit]);

  // Handle successful withdraw
  useEffect(() => {
    if (isWithdrawConfirmed) {
      console.log("Withdraw confirmed!");
      setAmount(""); // Clear input
      setErrorMessage("");
      onTransactionComplete(); // Refetch balances and vault data
      exchangeRate.refetch(); // Refetch exchange rate
      refetchMaxWithdraw(); // Refetch max withdraw amount
      resetWithdraw(); // Reset withdraw state
    }
  }, [
    isWithdrawConfirmed,
    onTransactionComplete,
    refetchMaxWithdraw,
    resetWithdraw,
  ]);

  // Handle withdraw error or cancellation
  useEffect(() => {
    if (withdrawError) {
      console.error("Withdraw error:", withdrawError);
      const errorMessage = withdrawError.message || "";
      if (
        errorMessage.includes("User rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("rejected")
      ) {
        // User cancelled - just reset state, no error message
        resetWithdraw();
      } else {
        // Actual error occurred
        setErrorMessage("Withdraw failed. Please try again.");
      }
    }
  }, [withdrawError, resetWithdraw]);

  const handleMax = () => {
    if (activeTab === "deposit") {
      // Use full precision
      const maxValue = balances.krws;
      setAmount(maxValue.toString());
    } else {
      // For withdraw, use spvKRWS balance with full precision
      const maxValue = balances.spvKRWS;
      setAmount(maxValue.toString());
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setErrorMessage("");
    

    try {
      // Force refetch allowance before checking
      const { data: currentAllowance } = await refetchAllowance();
      const actualAllowance = currentAllowance
        ? Number(formatUnits(currentAllowance as bigint, 18))
        : 0;

      console.log(
        "Current allowance (refetched):",
        actualAllowance,
        "Amount:",
        amount
      );

      // Check if we need approval
      if (actualAllowance < parseFloat(amount)) {
        console.log(
          "Needs approval. Current allowance:",
          actualAllowance,
          "Amount:",
          amount
        );
        setPendingDeposit(true); // Set flag to trigger deposit after approval
        approve(amount); // Don't await here, let useEffect handle the flow
      } else {
        console.log("Sufficient allowance. Depositing...");
        await deposit(amount);
      }
    } catch (error: any) {
      console.error("Error in handleDeposit:", error);
      setErrorMessage(
        error?.message || "Transaction failed. Please try again."
      );
      setPendingDeposit(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setErrorMessage("");
    

    try {
      await withdraw(amount);
    } catch (error: any) {
      console.error("Error in handleWithdraw:", error);
      setErrorMessage(error?.message || "Withdrawal failed. Please try again.");
    }
  };

  // Calculate preview amounts
  const previewDepositShares = amount
    ? parseFloat(amount) * exchangeRate.spvKRWSPerKRWS
    : 0;
  const previewWithdrawAssets = amount 
    ? parseFloat(amount) * exchangeRate.krwsPerSpvKRWS 
    : 0;

  return (
    <Card>
      <CardBody>
        <div className="flex gap-0 mb-6 bg-defi-darker rounded-xl p-1">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "deposit"
                ? "bg-primary-500 text-white"
                : "text-defi-medium-text hover:text-defi-light-text"
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "withdraw"
                ? "bg-primary-500 text-white"
                : "text-defi-medium-text hover:text-defi-light-text"
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
                disabled={!shouldEnableInputs}
                className="w-full px-4 py-4 pr-32 text-2xl font-semibold bg-defi-darker rounded-xl border border-defi-border focus:border-primary-500 focus:outline-none transition-colors text-white placeholder-defi-medium-text"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={handleMax}
                  className="px-3 py-1.5 text-sm font-semibold text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  MAX
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-defi-card rounded-lg border border-defi-border">
                  <span className="font-semibold text-white">
                    {activeTab === "deposit" ? "KRWS" : "spvKRWS"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeTab === "deposit" && (
            <>
              <div className="space-y-3 p-4 bg-defi-darker rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-defi-medium-text">
                    You will receive
                  </span>
                  <span className="font-semibold text-white">
                    {formatNumber(previewDepositShares, 2)} spvKRWS
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-defi-medium-text">Exchange Rate</span>
                  <div className="text-right font-semibold text-white">
                    <div>1 KRWS</div>
                    <div>
                      = {exchangeRate.spvKRWSPerKRWS.toFixed(4)} spvKRWS
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-defi-medium-text">APY</span>
                  <Badge variant="success" size="sm">
                    0.00%
                  </Badge>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Debug Info */}
              {isLoadingKrwsAddress && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Loading KRWS token address...
                  </p>
                </div>
              )}

              {!isLoadingKrwsAddress && !krwsAddress && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Unable to fetch KRWS token address. Please refresh the page.
                  </p>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={!isConnected ? onConnectWallet : handleDeposit}
                disabled={
                  !isCorrectNetwork ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  isApproving ||
                  isApproveConfirming ||
                  isDepositing ||
                  isDepositConfirming ||
                  isLoadingKrwsAddress ||
                  !krwsAddress ||
                  pendingDeposit
                }
                className="py-4 text-lg font-semibold"
              >
                {!isConnected
                  ? "Connect Wallet"
                  : !isCorrectNetwork
                  ? "Switch Network"
                  : isLoadingKrwsAddress
                  ? "Loading..."
                  : !krwsAddress
                  ? "KRWS Address Not Available"
                  : isApproving || isApproveConfirming
                  ? "Approving..."
                  : pendingDeposit
                  ? "Waiting for approval..."
                  : isDepositing || isDepositConfirming
                  ? "Depositing..."
                  : "Deposit KRWS"}
              </Button>
            </>
          )}

          {activeTab === "withdraw" && (
            <>
              <div className="space-y-3 p-4 bg-defi-darker rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-defi-medium-text">
                    You will receive
                  </span>
                  <span className="font-semibold text-white">
                    {formatNumber(previewWithdrawAssets, 2)} KRWS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-defi-medium-text">
                    Available to withdraw
                  </span>
                  <span className="font-semibold text-white">
                    {formatNumber(balances.spvKRWS, 2)} spvKRWS
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-defi-medium-text">Exchange Rate</span>
                  <div className="text-right font-semibold text-white">
                    <div>1 spvKRWS</div>
                    <div>= {exchangeRate.krwsPerSpvKRWS.toFixed(4)} KRWS</div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                variant="outline"
                onClick={!isConnected ? onConnectWallet : handleWithdraw}
                disabled={
                  !isCorrectNetwork ||
                  !amount ||
                  parseFloat(amount) <= 0 ||
                  parseFloat(amount) > balances.spvKRWS ||
                  isWithdrawing ||
                  isWithdrawConfirming
                }
                className="py-4 text-lg font-semibold"
              >
                {!isConnected
                  ? "Connect Wallet"
                  : !isCorrectNetwork
                  ? "Switch Network"
                  : isWithdrawing || isWithdrawConfirming
                  ? "Withdrawing..."
                  : "Withdraw KRWS"}
              </Button>
            </>
          )}
        </div>

        {/* Test Console - For simulation */}
        <div className="mt-6">
          <div className="p-4 border-2 border-dashed border-defi-border bg-defi-darker rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold text-white">
                🧪 Test Console
              </span>
            </div>

            <DebugSection
              onTransactionComplete={onTransactionComplete}
              vaultData={vaultData}
              onRefetchExchangeRate={exchangeRate.refetch}
              isCorrectNetwork={isCorrectNetwork}
              isConnected={isConnected}
              onConnectWallet={onConnectWallet}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Dashboard Layout
export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  isCorrectNetwork = true,
  isConnected = true,
  onConnectWallet,
}) => {
  const balances = useUserBalances();
  const vaultData = useVaultData();

  // Refetch all data when transaction completes
  const handleTransactionComplete = () => {
    console.log("Refetching all data...");
    balances.refetch();
    vaultData.refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Stats */}
        <div className="xl:col-span-8 space-y-6">
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceCard
              balances={balances}
              isConnected={isConnected}
              isCorrectNetwork={isCorrectNetwork}
              onTransactionComplete={handleTransactionComplete}
            />
            <VaultCard vaultData={vaultData} />
          </div>

          {/* Loan Activity */}
          <LoanActivityCard />
        </div>

        {/* Right Column - Deposit/Withdraw */}
        <div className="xl:col-span-4">
          <DepositWithdrawCard
            balances={balances}
            onTransactionComplete={handleTransactionComplete}
            vaultData={vaultData}
            isCorrectNetwork={isCorrectNetwork}
            isConnected={isConnected}
            onConnectWallet={onConnectWallet}
          />
        </div>
      </div>
    </div>
  );
};
