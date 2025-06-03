import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress
} from '@mui/material';
import {
  History,
  CheckCircle,
  Error,
  Info,
  Receipt,
  AccountBalance,
  SwapHoriz,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

interface Transaction {
  hash: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'contract';
  status: 'success' | 'error' | 'pending';
  amount?: string;
  from?: string;
  to?: string;
  timestamp: number;
  method?: string;
  params?: any[];
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  isLoading
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const getTransactionConfig = (tx: Transaction) => {
    const configs = {
      deposit: {
        icon: <AccountBalance />,
        color: theme.palette.success.main,
        label: 'Depósito'
      },
      withdraw: {
        icon: <AccountBalance />,
        color: theme.palette.warning.main,
        label: 'Saque'
      },
      transfer: {
        icon: <SwapHoriz />,
        color: theme.palette.info.main,
        label: 'Transferência'
      },
      contract: {
        icon: <Receipt />,
        color: theme.palette.secondary.main,
        label: 'Contrato'
      }
    };

    return configs[tx.type];
  };

  const getStatusConfig = (status: Transaction['status']) => {
    const configs = {
      success: {
        icon: <CheckCircle />,
        color: theme.palette.success.main,
        label: 'Sucesso'
      },
      error: {
        icon: <Error />,
        color: theme.palette.error.main,
        label: 'Erro'
      },
      pending: {
        icon: <LinearProgress size={16} />,
        color: theme.palette.warning.main,
        label: 'Pendente'
      }
    };

    return configs[status];
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleExpand = (hash: string) => {
    setExpandedTx(expandedTx === hash ? null : hash);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.5)})`,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        >
          <History />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
            }}
          >
            Histórico de Transações
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            Visualize todas as transações realizadas
          </Typography>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>De/Para</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Detalhes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.text.secondary,
                      py: 4,
                    }}
                  >
                    Nenhuma transação encontrada
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((tx) => {
                  const txConfig = getTransactionConfig(tx);
                  const statusConfig = getStatusConfig(tx.status);
                  const isExpanded = expandedTx === tx.hash;

                  return (
                    <React.Fragment key={tx.hash}>
                      <TableRow
                        sx={{
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: alpha(txConfig.color, 0.1),
                                color: txConfig.color,
                              }}
                            >
                              {txConfig.icon}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: txConfig.color,
                                fontWeight: 500,
                              }}
                            >
                              {txConfig.label}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              background: alpha(statusConfig.color, 0.1),
                              color: statusConfig.color,
                              '& .MuiChip-icon': {
                                color: statusConfig.color,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {tx.amount && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 500,
                              }}
                            >
                              {tx.amount}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {tx.from && tx.to && (
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                }}
                              >
                                De: {formatAddress(tx.from)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  display: 'block',
                                }}
                              >
                                Para: {formatAddress(tx.to)}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                            }}
                          >
                            {formatDate(tx.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={isExpanded ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}>
                            <IconButton
                              size="small"
                              onClick={() => toggleExpand(tx.hash)}
                              sx={{
                                color: theme.palette.primary.main,
                              }}
                            >
                              {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                background: alpha(theme.palette.primary.main, 0.05),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      color: theme.palette.primary.main,
                                      mb: 1,
                                    }}
                                  >
                                    Detalhes da Transação
                                  </Typography>
                                  <Box
                                    sx={{
                                      p: 1,
                                      borderRadius: 1,
                                      background: alpha(theme.palette.background.paper, 0.5),
                                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    <Box>Hash: {tx.hash}</Box>
                                    {tx.method && <Box>Método: {tx.method}</Box>}
                                    {tx.params && (
                                      <Box>Parâmetros: {JSON.stringify(tx.params)}</Box>
                                    )}
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={transactions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Transações por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count}`
        }
      />
    </Paper>
  );
};

export default TransactionHistory; 