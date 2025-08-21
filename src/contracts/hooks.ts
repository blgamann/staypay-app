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
  
  const { data: assetsPerShare } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'convertToAssets',
    args: [oneShare],
  });

  const { data: sharesPerAsset } = useReadContract({
    address: CONTRACTS.VAULT_ADDRESS,
    abi: ABIS.VAULT,
    functionName: 'convertToShares',
    args: [oneShare],
  });

  return {
    krwsPerSpvKRWS: assetsPerShare ? Number(formatUnits(assetsPerShare as bigint, 18)) : 1,
    spvKRWSPerKRWS: sharesPerAsset ? Number(formatUnits(sharesPerAsset as bigint, 18)) : 1,
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
    
    // Check if amount exceeds max withdrawable
    if (maxWithdrawAmount && amountInWei > (maxWithdrawAmount as bigint)) {
      throw new Error('Amount exceeds maximum withdrawable');
    }
    
    writeContract({
      address: CONTRACTS.VAULT_ADDRESS,
      abi: ABIS.VAULT,
      functionName: 'withdraw',
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