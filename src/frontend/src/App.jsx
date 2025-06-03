import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  useToast,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Progress,
  HStack,
  Icon,
  Badge,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import theme from './theme';
import { FaRobot, FaWallet, FaChartLine, FaLock, FaSignOutAlt, FaHistory } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import { connectWallet, disconnectWallet, isWalletConnected } from './services/wallet';
import { MotionBox } from './components/MotionBox';
import { WalletStatus } from './components/WalletStatus';

const API_URL = 'http://localhost:3001/api';

const MotionContainer = motion(Container);

function App() {
  const [assets, setAssets] = useState('');
  const [liabilities, setLiabilities] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [marketTrends, setMarketTrends] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const toast = useToast();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  useEffect(() => {
    checkWalletConnection();
    fetchMarketTrends();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchAnalysisHistory();
      fetchDashboardData();
    }
  }, [connected]);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/analysis/history/${account}`);
      setAnalysisHistory(response.data.history);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/data/${account}`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    }
  };

  const fetchMarketTrends = async () => {
    try {
      const response = await axios.get(`${API_URL}/market/trends`);
      setMarketTrends(response.data);
    } catch (error) {
      console.error('Erro ao buscar tendências de mercado:', error);
    }
  };

  const checkWalletConnection = async () => {
    try {
      const isConnected = await isWalletConnected();
      if (isConnected) {
        const initialAddress = await connectWallet((newAddress) => {
          handleAccountChange(newAddress);
        });
        handleAccountChange(initialAddress);
      }
    } catch (error) {
      console.error('Erro ao verificar conexão da carteira:', error);
      toast({
        title: 'Erro de Conexão',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAccountChange = (newAddress) => {
    if (newAddress) {
      setConnected(true);
      setAccount(newAddress);
      fetchAnalysisHistory();
      fetchDashboardData();
    } else {
      setConnected(false);
      setAccount('');
    }
  };

  const handleConnectWallet = async () => {
    try {
      const connectedAddress = await connectWallet((newAddress) => {
        handleAccountChange(newAddress);
      });

      handleAccountChange(connectedAddress);
      toast({
        title: 'Carteira Conectada',
        description: 'Conexão estabelecida com sucesso!',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      toast({
        title: 'Erro ao Conectar Carteira',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setConnected(false);
      setAccount('');
      toast({
        title: 'Carteira Desconectada',
        description: 'Desconexão realizada com sucesso!',
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error);
      toast({
        title: 'Erro ao Desconectar Carteira',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const generateProof = async () => {
    if (!assets || !liabilities) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Por favor, preencha os ativos e passivos',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Gerar prova ZKP
      const proofResult = await axios.post(`${API_URL}/solvency/generate`, {
        assets,
        liabilities,
      });

      if (proofResult.data.success) {
        // Registrar prova na blockchain
        const registerResult = await axios.post(`${API_URL}/solvency/register`, {
          proof: proofResult.data.proof,
          publicInputs: proofResult.data.publicInputs,
        });

        // Analisar risco e gerar sugestões de IA
        const [riskResult, aiResult] = await Promise.all([
          axios.post(`${API_URL}/risk/analyze`, {
            assets,
            liabilities,
            transactions: [],
            marketConditions: marketTrends,
          }),
          axios.post(`${API_URL}/ai/suggestions`, {
            assets,
            liabilities,
            marketTrends,
          }),
        ]);

        setRiskAnalysis(riskResult.data.analysis);
        setAiSuggestions(aiResult.data.suggestions);

        toast({
          title: 'Sucesso',
          description: 'Análise completa realizada com sucesso',
          status: 'success',
          duration: 3000,
        });

        onModalOpen(); // Abrir modal com resultados detalhados
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <MotionContainer
        maxW="container.xl"
        py={10}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" position="relative">
            <Heading
              mb={2}
              bgGradient="linear(to-r, brand.500, accent.500)"
              bgClip="text"
              fontSize="5xl"
            >
              IBelieve Finance
            </Heading>
            <Text fontSize="xl" color="whiteAlpha.900">
              Sistema Avançado de Provas de Solvência com IA
            </Text>
            <HStack spacing={4} justify="center" mt={4}>
              <Badge colorScheme="brand" p={2} borderRadius="lg">
                <Icon as={FaRobot} mr={2} />
                IA Integrada
              </Badge>
              <Badge colorScheme="accent" p={2} borderRadius="lg">
                <Icon as={FaLock} mr={2} />
                Zero-Knowledge Proof
              </Badge>
            </HStack>
          </Box>

          <WalletStatus isConnected={connected} address={account} />

          {!connected ? (
            <MotionBox
              p={8}
              borderRadius="2xl"
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(10px)"
              boxShadow="xl"
              border="1px solid"
              borderColor="whiteAlpha.200"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="gradient"
                size="lg"
                width="full"
                onClick={handleConnectWallet}
                leftIcon={<FaWallet />}
              >
                Conectar SubWallet
              </Button>
            </MotionBox>
          ) : (
            <Tabs variant="soft-rounded" colorScheme="brand">
              <TabList>
                <Tab>Dashboard</Tab>
                <Tab>Nova Análise</Tab>
                <Tab>Histórico</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Dashboard
                    data={dashboardData}
                    riskAnalysis={riskAnalysis}
                    marketTrends={marketTrends}
                  />
                </TabPanel>

                <TabPanel>
                  <MotionBox
                    p={8}
                    borderRadius="2xl"
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(10px)"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <HStack justify="space-between" width="full" mb={6}>
                      <Tooltip label={account}>
                        <Text isTruncated maxW="300px">
                          Carteira: {account.slice(0, 6)}...{account.slice(-4)}
                        </Text>
                      </Tooltip>
                      <Button
                        variant="glass"
                        onClick={handleDisconnectWallet}
                        leftIcon={<FaSignOutAlt />}
                      >
                        Desconectar
                      </Button>
                    </HStack>

                    <VStack spacing={4} width="full">
                      <Input
                        placeholder="Total de Ativos"
                        value={assets}
                        onChange={(e) => setAssets(e.target.value)}
                        type="number"
                        size="lg"
                      />
                      <Input
                        placeholder="Total de Passivos"
                        value={liabilities}
                        onChange={(e) => setLiabilities(e.target.value)}
                        type="number"
                        size="lg"
                      />
                      <Button
                        variant="gradient"
                        width="full"
                        size="lg"
                        onClick={generateProof}
                        isLoading={loading}
                        loadingText="Analisando Dados"
                        leftIcon={<FaChartLine />}
                      >
                        Gerar Análise Completa
                      </Button>
                    </VStack>
                  </MotionBox>
                </TabPanel>

                <TabPanel>
                  <MotionBox
                    p={8}
                    borderRadius="2xl"
                    bg="rgba(255, 255, 255, 0.1)"
                    backdropFilter="blur(10px)"
                    boxShadow="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <Heading size="md" mb={6}>
                      <Icon as={FaHistory} mr={2} />
                      Histórico de Análises
                    </Heading>
                    <VStack spacing={4} align="stretch">
                      {analysisHistory.map((analysis, index) => (
                        <Box
                          key={index}
                          p={4}
                          borderRadius="xl"
                          bg="whiteAlpha.100"
                          _hover={{
                            bg: 'whiteAlpha.200',
                            transform: 'translateY(-2px)',
                          }}
                          transition="all 0.3s"
                          cursor="pointer"
                          onClick={() => {
                            setRiskAnalysis(analysis.riskAnalysis);
                            setAiSuggestions(analysis.aiSuggestions);
                            onModalOpen();
                          }}
                        >
                          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                            <Stat>
                              <StatLabel>Data</StatLabel>
                              <StatNumber fontSize="md">
                                {new Date(analysis.date).toLocaleDateString('pt-BR')}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Ativos</StatLabel>
                              <StatNumber fontSize="md">R$ {analysis.assets}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Passivos</StatLabel>
                              <StatNumber fontSize="md">R$ {analysis.liabilities}</StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel>Score de Risco</StatLabel>
                              <StatNumber fontSize="md">
                                {analysis.riskAnalysis.riskScore}/100
                              </StatNumber>
                            </Stat>
                          </Grid>
                        </Box>
                      ))}
                    </VStack>
                  </MotionBox>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}

          <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent
              bg="rgba(26, 32, 44, 0.95)"
              backdropFilter="blur(10px)"
              borderRadius="2xl"
              border="1px solid"
              borderColor="whiteAlpha.200"
            >
              <ModalHeader>Análise Detalhada</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                {riskAnalysis && (
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Heading size="md" mb={4}>
                        Análise de Risco
                      </Heading>
                      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                        <Stat>
                          <StatLabel>Pontuação de Risco</StatLabel>
                          <StatNumber>{riskAnalysis.riskScore}/100</StatNumber>
                          <Progress
                            value={riskAnalysis.riskScore}
                            colorScheme={
                              riskAnalysis.riskScore > 70
                                ? 'red'
                                : riskAnalysis.riskScore > 30
                                  ? 'yellow'
                                  : 'green'
                            }
                            mt={2}
                            borderRadius="xl"
                          />
                        </Stat>
                        <Stat>
                          <StatLabel>Nível de Confiança</StatLabel>
                          <StatNumber>{riskAnalysis.confidenceLevel}%</StatNumber>
                          <StatHelpText>Precisão da IA</StatHelpText>
                        </Stat>
                      </Grid>
                    </Box>

                    <Divider />

                    <Box>
                      <Heading size="sm" mb={3}>
                        Fatores de Risco Principais
                      </Heading>
                      {riskAnalysis.riskFactors.map((factor, index) => (
                        <Text key={index} color="whiteAlpha.800" mb={2}>
                          • {factor}
                        </Text>
                      ))}
                    </Box>

                    {aiSuggestions && (
                      <>
                        <Divider />
                        <Box>
                          <Heading size="sm" mb={3}>
                            Sugestões da IA
                          </Heading>
                          {aiSuggestions.map((suggestion, index) => (
                            <Text key={index} color="whiteAlpha.800" mb={2}>
                              • {suggestion}
                            </Text>
                          ))}
                        </Box>
                      </>
                    )}
                  </VStack>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>

          <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
            <DrawerOverlay backdropFilter="blur(10px)" />
            <DrawerContent bg="rgba(26, 32, 44, 0.95)" backdropFilter="blur(10px)">
              <DrawerCloseButton />
              <DrawerHeader>Tendências de Mercado</DrawerHeader>
              <DrawerBody>
                {marketTrends && (
                  <VStack spacing={4} align="stretch">
                    {marketTrends.map((trend, index) => (
                      <Box key={index} p={4} borderRadius="xl" bg="whiteAlpha.100">
                        <Text fontWeight="bold">{trend.title}</Text>
                        <Text color="whiteAlpha.800">{trend.description}</Text>
                      </Box>
                    ))}
                  </VStack>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </VStack>
      </MotionContainer>
    </ChakraProvider>
  );
}

export default App;
