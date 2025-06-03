import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Loan } from '../../types';
import { LoanService } from '../../services/LoanService';
import { NotificationService } from '../../services/NotificationService';

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'info',
} as const;

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  completed: 'Concluído',
} as const;

const LoanList: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      const data = await LoanService.getLoans();
      setLoans(data);
      setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loans.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Nenhum empréstimo encontrado
      </Alert>
    );
  }

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {loans.map(loan => (
        <Grid item xs={12} sm={6} md={4} key={loan.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(loan.amount)}
                </Typography>
                <Chip
                  label={statusLabels[loan.status]}
                  color={statusColors[loan.status]}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Prazo: {loan.term} dias
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Colateral: {loan.collateral}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Criado em:{' '}
                {new Date(loan.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default LoanList; 