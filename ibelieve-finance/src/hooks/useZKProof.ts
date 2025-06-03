import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zkProofRegistryService } from '../services/contracts/ZKProofRegistry';

interface ProofState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useZKProof = () => {
  const [proofState, setProofState] = useState<ProofState>({
    loading: false,
    error: null,
    success: false,
  });

  // Buscar estatísticas
  const { data: statistics, refetch: refetchStatistics } = useQuery({
    queryKey: ['zkproof-statistics'],
    queryFn: () => zkProofRegistryService.getStatistics(),
    enabled: false,
  });

  // Registrar prova
  const registerProofMutation = useMutation({
    mutationFn: (proofData: string) => zkProofRegistryService.registerProof(proofData),
    onSuccess: () => {
      setProofState({ loading: false, error: null, success: true });
      refetchStatistics();
    },
    onError: (error: Error) => {
      setProofState({
        loading: false,
        error: error.message,
        success: false,
      });
    },
  });

  // Verificar prova
  const verifyProofMutation = useMutation({
    mutationFn: (proofData: string) => zkProofRegistryService.verifyProof(proofData),
    onSuccess: (isValid) => {
      setProofState({
        loading: false,
        error: null,
        success: isValid,
      });
    },
    onError: (error: Error) => {
      setProofState({
        loading: false,
        error: error.message,
        success: false,
      });
    },
  });

  const registerProof = useCallback(async (proofData: string) => {
    setProofState({ loading: true, error: null, success: false });
    await registerProofMutation.mutateAsync(proofData);
  }, [registerProofMutation]);

  const verifyProof = useCallback(async (proofData: string) => {
    setProofState({ loading: true, error: null, success: false });
    await verifyProofMutation.mutateAsync(proofData);
  }, [verifyProofMutation]);

  return {
    statistics,
    proofState,
    registerProof,
    verifyProof,
    refetchStatistics,
  };
}; 