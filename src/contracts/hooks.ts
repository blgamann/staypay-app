import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import type { Address } from 'viem';
import { CONTRACTS, ABIS, ERC20_ABI } from './config';
import { useEffect } from 'react';

// ============ Read Hooks ============

// Get vault data (TVL, loaned amount, utilization rate)
export function useVaultData() {
  const { data: totalAssets, refetch: refetchTotalAssets } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'totalAssets',
  });

  const { data: loanedPrincipal, refetch: refetchLoanedPrincipal } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'loanedPrincipal',
  });

  const tvl = totalAssets ? Number(formatUnits(totalAssets as bigint, 18)) : 0;
  const loaned = loanedPrincipal ? Number(formatUnits(loanedPrincipal as bigint, 18)) : 0;
  const available = tvl - loaned;
  const utilizationRate = tvl > 0 ? (loaned / tvl) * 100 : 0;

  const refetch = () => {
    refetchTotalAssets();
    refetchLoanedPrincipal();
  };

  return {
    tvl,
    availableLiquidity: available,
    activeLoans: loaned,
    utilizationRate: utilizationRate.toFixed(1),
    refetch,
  };
}

// Get user balances (KAIA native, KRWS, spvKRWS)
export function useUserBalances() {
  const { address } = useAccount();
  
  // KAIA native balance
  const { data: kaiaBalance, refetch: refetchKaia } = useBalance({
    address: address,
  });

  // Get KRWS token address from vault
  const { data: krwsAddress } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'asset',
  });

  // KRWS balance
  const { data: krwsBalance, refetch: refetchKrws } = useReadContract({
    address: krwsAddress as Address,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // spvKRWS balance
  const { data: spvKRWSBalance, refetch: refetchSpvKRWS } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Convert spvKRWS to KRWS value
  const { data: spvKRWSInAssets, refetch: refetchSpvKRWSInAssets } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'convertToAssets',
    args: spvKRWSBalance ? [spvKRWSBalance as bigint] : undefined,
  });

  const refetch = () => {
    refetchKaia();
    refetchKrws();
    refetchSpvKRWS();
    refetchSpvKRWSInAssets();
  };

  return {
    kaia: kaiaBalance ? Number(formatUnits(kaiaBalance.value, 18)) : 0,
    krws: krwsBalance ? Number(formatUnits(krwsBalance as bigint, 18)) : 0,
    spvKRWS: spvKRWSBalance ? Number(formatUnits(spvKRWSBalance as bigint, 18)) : 0,
    spvKRWSInKRWS: spvKRWSInAssets ? Number(formatUnits(spvKRWSInAssets as bigint, 18)) : 0,
    refetch,
  };
}

// Get exchange rate
export function useExchangeRate() {
  const oneShare = parseUnits('1', 18);
  
  const { data: assetsPerShare, refetch: refetchAssetsPerShare } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'convertToAssets',
    args: [oneShare],
  });

  const { data: sharesPerAsset, refetch: refetchSharesPerAsset } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'convertToShares',
    args: [oneShare],
  });

  const refetch = () => {
    refetchAssetsPerShare();
    refetchSharesPerAsset();
  };

  return {
    krwsPerSpvKRWS: assetsPerShare ? Number(formatUnits(assetsPerShare as bigint, 18)) : 1,
    spvKRWSPerKRWS: sharesPerAsset ? Number(formatUnits(sharesPerAsset as bigint, 18)) : 1,
    refetch,
  };
}

// ============ Write Hooks ============

// Approve KRWS spending
export function useApprove() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Get KRWS address
  const { data: krwsAddress, isLoading: isLoadingKrwsAddress, error: krwsAddressError } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'asset',
  });

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: krwsAddress as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && krwsAddress ? [address, CONTRACTS.VAULT_ADDRESS] : undefined,
  });

  const approve = async (amount: string) => {
    console.log('Approve called with amount:', amount);
    console.log('KRWS Address:', krwsAddress);
    console.log('User Address:', address);
    console.log('Vault Address:', CONTRACTS.VAULT_ADDRESS);
    
    if (!krwsAddress) {
      console.error('KRWS address not available');
      throw new Error('KRWS token address not available. Please try again.');
    }
    
    if (!address) {
      console.error('User address not available');
      throw new Error('Wallet not connected');
    }
    
    const amountInWei = parseUnits(amount, 18);
    console.log('Amount in Wei:', amountInWei.toString());
    
    try {
      writeContract({
        address: krwsAddress as Address,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.VAULT_ADDRESS, amountInWei],
      });
      console.log('WriteContract called successfully');
    } catch (err) {
      console.error('Error calling writeContract:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  useEffect(() => {
    if (krwsAddressError) {
      console.error('Error fetching KRWS address:', krwsAddressError);
    }
  }, [krwsAddressError]);

  return {
    approve,
    allowance: allowance ? Number(formatUnits(allowance as bigint, 18)) : 0,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    isLoadingKrwsAddress,
    krwsAddress,
    reset,
    refetchAllowance,
  };
}

// Deposit KRWS to get spvKRWS
export function useDeposit() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const deposit = async (amount: string) => {
    if (!address) return;
    
    const amountInWei = parseUnits(amount, 18);
    
    writeContract({
      address: CONTRACTS.VAULT_ADDRESS,
      abi: ABIS.VAULT,
      functionName: 'deposit',
      args: [amountInWei, address],
    });
  };

  return {
    deposit,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
  };
}

// Withdraw KRWS by burning spvKRWS
export function useWithdraw() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Get max withdrawable amount
  const { data: maxWithdrawAmount, refetch: refetchMaxWithdraw } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'maxWithdraw',
    args: address ? [address] : undefined,
  });

  const withdraw = async (amount: string) => {
    if (!address) return;
    
    const amountInWei = parseUnits(amount, 18);
    
    // Use redeem instead of withdraw to burn spvKRWS shares
    writeContract({
      address: CONTRACTS.VAULT_ADDRESS,
      abi: ABIS.VAULT,
      functionName: 'redeem',
      args: [amountInWei, address, address],
    });
  };

  return {
    withdraw,
    maxWithdraw: maxWithdrawAmount ? Number(formatUnits(maxWithdrawAmount as bigint, 18)) : 0,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
    refetchMaxWithdraw,
  };
}

// Get user's debt information
export function useDebt() {
  const { address } = useAccount();
  
  const { data: debtData, refetch: refetchDebt } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'debtOf',
    args: address ? [address] : undefined,
  });

  if (!debtData || !Array.isArray(debtData) || debtData.length < 3) {
    return {
      totalDebt: 0,
      principal: 0,
      fee: 0,
      refetchDebt,
    };
  }

  const [total, principal, fee] = debtData as [bigint, bigint, bigint];

  return {
    totalDebt: Number(formatUnits(total, 18)),
    principal: Number(formatUnits(principal, 18)),
    fee: Number(formatUnits(fee, 18)),
    refetchDebt,
  };
}

// Lend KRWS (owner only)
export function useLend() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const lend = async (amount: string, borrower?: string, receiver?: string) => {
    if (!address) return;
    
    const amountInWei = parseUnits(amount, 18);
    const borrowerAddress = borrower || address;
    const receiverAddress = receiver || address;
    
    writeContract({
      address: CONTRACTS.VAULT_ADDRESS,
      abi: ABIS.VAULT,
      functionName: 'lend',
      args: [borrowerAddress as Address, receiverAddress as Address, amountInWei],
    });
  };

  return {
    lend,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
  };
}

// Repay debt
export function useRepay() {
  const { address } = useAccount();
  
  // Separate write contracts for approve and repay
  const { 
    writeContract: writeApprove, 
    data: approveHash, 
    isPending: isApprovePending, 
    isError: isApproveError, 
    error: approveError, 
    reset: resetApprove 
  } = useWriteContract();
  
  const { 
    writeContract: writeRepay, 
    data: repayHash, 
    isPending: isRepayPending, 
    isError: isRepayError, 
    error: repayError, 
    reset: resetRepay 
  } = useWriteContract();
  
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isRepayConfirming, isSuccess: isRepayConfirmed } = useWaitForTransactionReceipt({ hash: repayHash });

  // Get KRWS token address from vault
  const { data: krwsAddress } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'asset',
  });

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: krwsAddress as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && krwsAddress ? [address, CONTRACTS.VAULT_ADDRESS] : undefined,
  });

  const repay = async (borrower?: string) => {
    if (!address) return;
    
    const borrowerAddress = borrower || address;
    
    writeRepay({
      address: CONTRACTS.VAULT_ADDRESS,
      abi: ABIS.VAULT,
      functionName: 'repay',
      args: [borrowerAddress as Address],
    });
  };

  // Approve KRWS for repayment
  const approveRepay = async (amount: string) => {
    if (!krwsAddress) return;
    
    const amountInWei = parseUnits(amount, 18);
    
    writeApprove({
      address: krwsAddress as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.VAULT_ADDRESS, amountInWei],
    });
  };

  return {
    repay,
    approveRepay,
    // Approve states
    isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    isApproveError,
    approveError,
    resetApprove,
    // Repay states
    isRepayPending,
    isRepayConfirming,
    isRepayConfirmed,
    isRepayError,
    repayError,
    resetRepay,
    // Allowance
    allowance,
    refetchAllowance,
    krwsAddress,
  };
}

// ============ KRWS Mint Hook ============
export function useMintKRWS() {
  // Get KRWS token address from vault
  const { data: krwsAddress } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'asset',
  });

  // Write contract for minting
  const {
    writeContract: writeMint,
    isPending: isMintPending,
    isError: isMintError,
    error: mintError,
    data: mintHash,
    reset: resetMint,
  } = useWriteContract();

  // Wait for mint transaction
  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
  } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  // Mint function
  const mint = async (toAddress: string, amount: string = '1000000') => {
    if (!krwsAddress) {
      throw new Error('KRWS address not available');
    }

    const amountInWei = parseUnits(amount, 18);
    
    writeMint({
      address: krwsAddress as Address,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [toAddress as Address, amountInWei],
    });
  };

  return {
    mint,
    isPending: isMintPending,
    isConfirming: isMintConfirming,
    isConfirmed: isMintConfirmed,
    isError: isMintError,
    error: mintError,
    reset: resetMint,
    krwsAddress,
  };
}