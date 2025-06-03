import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import { RootState } from '../../store';

// Dados mockados para exemplo
const mockData = [
  {
    id: 1,
    date: '2024-03-20',
    amount: '1.5 ETH',
    status: 'Aprovado',
    type: 'Empréstimo',
  },
  {
    id: 2,
    date: '2024-03-15',
    amount: '0.5 ETH',
    status: 'Pendente',
    type: 'Empréstimo',
  },
  {
    id: 3,
    date: '2024-03-10',
    amount: '2.0 ETH',
    status: 'Concluído',
    type: 'Empréstimo',
  },
];

const Reports = () => {
  const { address } = useSelector((state: RootState) => state.wallet);

  if (!address) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Conecte sua carteira para ver os relatórios
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports; 