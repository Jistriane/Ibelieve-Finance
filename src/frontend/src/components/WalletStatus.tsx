import React from 'react';
import { Box, HStack, Text, Badge, Icon } from '@chakra-ui/react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface WalletStatusProps {
  isConnected: boolean;
  address?: string;
}

const IconComponent = (icon: IconType) => {
  return function IconWrapper(props: any) {
    return <Icon as={icon} {...props} />;
  };
};

const CheckIcon = IconComponent(FaCheckCircle);
const ErrorIcon = IconComponent(FaExclamationCircle);

export const WalletStatus: React.FC<WalletStatusProps> = ({ isConnected, address }) => {
  const isInstalled = typeof window !== 'undefined' && !!window.ethereum;
  const isEnabled = isInstalled && !!window.ethereum?.isMetaMask;

  return (
    <Box
      p={4}
      borderRadius="xl"
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      boxShadow="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
    >
      <HStack spacing={6} justify="space-between">
        <Box>
          <Text mb={2} fontWeight="bold">
            Status da Carteira
          </Text>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
                MetaMask
              </Text>
              <Badge colorScheme={isInstalled ? 'green' : 'red'}>
                <HStack spacing={1}>
                  {isInstalled ? <CheckIcon /> : <ErrorIcon />}
                  <Text>Instalada</Text>
                </HStack>
              </Badge>
            </Box>

            <Box>
              <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
                Extensão
              </Text>
              <Badge colorScheme={isEnabled ? 'green' : 'red'}>
                <HStack spacing={1}>
                  {isEnabled ? <CheckIcon /> : <ErrorIcon />}
                  <Text>Habilitada</Text>
                </HStack>
              </Badge>
            </Box>

            <Box>
              <Text fontSize="sm" color="whiteAlpha.700" mb={1}>
                Conexão
              </Text>
              <Badge colorScheme={isConnected ? 'green' : 'red'}>
                <HStack spacing={1}>
                  {isConnected ? <CheckIcon /> : <ErrorIcon />}
                  <Text>Conectada</Text>
                </HStack>
              </Badge>
            </Box>
          </HStack>
        </Box>

        {address && (
          <Box>
            <Text fontSize="sm" color="whiteAlpha.700">
              Endereço
            </Text>
            <Text isTruncated maxW="200px">
              {address.slice(0, 6)}...{address.slice(-4)}
            </Text>
          </Box>
        )}
      </HStack>
    </Box>
  );
};
