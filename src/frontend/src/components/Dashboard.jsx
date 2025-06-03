import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Icon,
  Flex,
} from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FaChartLine, FaChartPie, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';

const COLORS = ['#319795', '#FF0079', '#4FD1C5', '#FF5CA9'];

const Dashboard = ({ data, riskAnalysis, marketTrends }) => {
  const solvencyData = [
    { name: 'Jan', valor: 4000 },
    { name: 'Fev', valor: 3000 },
    { name: 'Mar', valor: 5000 },
    { name: 'Abr', valor: 4500 },
    { name: 'Mai', valor: 6000 },
    { name: 'Jun', valor: 5500 },
  ];

  const distribuicaoAtivos = [
    { name: 'Criptomoedas', value: 400 },
    { name: 'Ações', value: 300 },
    { name: 'Renda Fixa', value: 300 },
    { name: 'Outros', value: 200 },
  ];

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Índice de Solvência"
          value={data?.solvencyIndex || '85%'}
          status="increase"
          change="5.2%"
          icon={FaChartLine}
        />
        <StatCard
          label="Risco Total"
          value={riskAnalysis?.riskScore || '32'}
          status="decrease"
          change="2.1%"
          icon={FaShieldAlt}
        />
        <StatCard
          label="Total de Ativos"
          value={`R$ ${data?.totalAssets || '1.2M'}`}
          status="increase"
          change="12.5%"
          icon={FaMoneyBillWave}
        />
        <StatCard
          label="Score IA"
          value={riskAnalysis?.aiScore || '92'}
          status="increase"
          change="3.4%"
          icon={FaChartPie}
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <Box
          p={6}
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          boxShadow="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Heading size="md" mb={6}>
            Evolução da Solvência
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={solvencyData}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#319795" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#319795" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="white" />
              <YAxis stroke="white" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 32, 44, 0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#319795"
                fillOpacity={1}
                fill="url(#colorValor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box
          p={6}
          borderRadius="2xl"
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          boxShadow="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <Heading size="md" mb={6}>
            Distribuição de Ativos
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoAtivos}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {distribuicaoAtivos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(26, 32, 44, 0.95)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <SimpleGrid columns={2} spacing={4} mt={4}>
            {distribuicaoAtivos.map((item, index) => (
              <Flex key={index} align="center">
                <Box
                  w="12px"
                  h="12px"
                  borderRadius="sm"
                  bg={COLORS[index % COLORS.length]}
                  mr={2}
                />
                <Text fontSize="sm">{item.name}</Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>
      </Grid>
    </Box>
  );
};

const StatCard = ({ label, value, status, change, icon }) => (
  <Box
    p={6}
    borderRadius="2xl"
    bg="rgba(255, 255, 255, 0.1)"
    backdropFilter="blur(10px)"
    boxShadow="xl"
    border="1px solid"
    borderColor="whiteAlpha.200"
    transition="all 0.3s"
    _hover={{ transform: 'translateY(-2px)', boxShadow: '2xl' }}
  >
    <Flex justify="space-between" align="center" mb={4}>
      <Icon as={icon} boxSize={6} color="brand.200" />
      <StatArrow type={status} />
    </Flex>
    <Stat>
      <StatLabel fontSize="lg">{label}</StatLabel>
      <StatNumber fontSize="2xl" fontWeight="bold">
        {value}
      </StatNumber>
      <StatHelpText>
        <StatArrow type={status} />
        {change}
      </StatHelpText>
    </Stat>
  </Box>
);

export default Dashboard;
