// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SubwalletRegistry
 * @dev Contrato responsável pelo gerenciamento de subwallets
 */
contract SubwalletRegistry is Ownable, Pausable {
    // Eventos
    event SubwalletRegistered(address indexed wallet, string name);
    event SubwalletRemoved(address indexed wallet);
    event SubwalletUpdated(address indexed wallet, string newName);
    event SubwalletStatusChanged(address indexed wallet, bool isActive);

    // Estrutura para subwallet
    struct Subwallet {
        string name;
        bool isRegistered;
        bool isActive;
        uint256 lastActivity;
        uint256 registrationDate;
        address owner;
    }

    // Mapeamentos
    mapping(address => Subwallet) public subwallets;
    mapping(address => address[]) private ownerToSubwallets;
    
    // Lista de subwallets para iteração
    address[] public subwalletList;

    // Constantes
    uint256 public constant MAX_SUBWALLETS_PER_OWNER = 10;
    uint256 public constant MAX_TOTAL_SUBWALLETS = 100;

    /**
     * @dev Construtor do contrato
     * @param initialOwner Endereço do proprietário inicial
     */
    constructor(address initialOwner) Ownable() Pausable() {
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Registra uma nova subwallet
     * @param wallet Endereço da subwallet
     * @param name Nome da subwallet
     */
    function registerSubwallet(address wallet, string memory name) external whenNotPaused {
        require(!subwallets[wallet].isRegistered, "Subwallet ja registrada");
        require(wallet != address(0), "Endereco invalido");
        require(bytes(name).length > 0 && bytes(name).length <= 32, "Nome invalido");
        require(subwalletList.length < MAX_TOTAL_SUBWALLETS, "Limite total de subwallets atingido");
        require(ownerToSubwallets[msg.sender].length < MAX_SUBWALLETS_PER_OWNER, "Limite de subwallets por owner atingido");

        subwallets[wallet] = Subwallet({
            name: name,
            isRegistered: true,
            isActive: true,
            lastActivity: block.timestamp,
            registrationDate: block.timestamp,
            owner: msg.sender
        });

        ownerToSubwallets[msg.sender].push(wallet);
        subwalletList.push(wallet);

        emit SubwalletRegistered(wallet, name);
    }

    /**
     * @dev Remove uma subwallet
     * @param wallet Endereço da subwallet
     */
    function removeSubwallet(address wallet) external whenNotPaused {
        require(subwallets[wallet].isRegistered, "Subwallet nao registrada");
        require(subwallets[wallet].owner == msg.sender || owner() == msg.sender, "Sem permissao");
        
        // Remove da lista de subwallets do owner
        address[] storage ownerWallets = ownerToSubwallets[subwallets[wallet].owner];
        for (uint i = 0; i < ownerWallets.length; i++) {
            if (ownerWallets[i] == wallet) {
                ownerWallets[i] = ownerWallets[ownerWallets.length - 1];
                ownerWallets.pop();
                break;
            }
        }

        // Remove da lista geral
        for (uint i = 0; i < subwalletList.length; i++) {
            if (subwalletList[i] == wallet) {
                subwalletList[i] = subwalletList[subwalletList.length - 1];
                subwalletList.pop();
                break;
            }
        }

        delete subwallets[wallet];
        emit SubwalletRemoved(wallet);
    }

    /**
     * @dev Atualiza o nome de uma subwallet
     * @param wallet Endereço da subwallet
     * @param newName Novo nome
     */
    function updateSubwalletName(address wallet, string memory newName) external whenNotPaused {
        require(subwallets[wallet].isRegistered, "Subwallet nao registrada");
        require(subwallets[wallet].owner == msg.sender || owner() == msg.sender, "Sem permissao");
        require(bytes(newName).length > 0 && bytes(newName).length <= 32, "Nome invalido");

        subwallets[wallet].name = newName;
        emit SubwalletUpdated(wallet, newName);
    }

    /**
     * @dev Atualiza o status de atividade de uma subwallet
     * @param wallet Endereço da subwallet
     * @param isActive Novo status
     */
    function setSubwalletStatus(address wallet, bool isActive) external whenNotPaused {
        require(subwallets[wallet].isRegistered, "Subwallet nao registrada");
        require(subwallets[wallet].owner == msg.sender || owner() == msg.sender, "Sem permissao");

        subwallets[wallet].isActive = isActive;
        emit SubwalletStatusChanged(wallet, isActive);
    }

    /**
     * @dev Atualiza a última atividade de uma subwallet
     * @param wallet Endereço da subwallet
     */
    function updateLastActivity(address wallet) external whenNotPaused {
        require(subwallets[wallet].isRegistered, "Subwallet nao registrada");
        subwallets[wallet].lastActivity = block.timestamp;
    }

    /**
     * @dev Verifica se um endereço é uma subwallet válida
     * @param wallet Endereço a ser verificado
     */
    function isValidSubwallet(address wallet) public view returns (bool) {
        return subwallets[wallet].isRegistered && subwallets[wallet].isActive;
    }

    /**
     * @dev Retorna todas as subwallets
     */
    function getAllSubwallets() external view returns (address[] memory) {
        return subwalletList;
    }

    /**
     * @dev Retorna as subwallets de um owner específico
     * @param owner Endereço do owner
     */
    function getOwnerSubwallets(address owner) external view returns (address[] memory) {
        return ownerToSubwallets[owner];
    }

    /**
     * @dev Retorna os detalhes de uma subwallet
     * @param wallet Endereço da subwallet
     */
    function getSubwalletDetails(address wallet) external view returns (
        string memory name,
        bool isRegistered,
        bool isActive,
        uint256 lastActivity,
        uint256 registrationDate,
        address owner
    ) {
        Subwallet memory sw = subwallets[wallet];
        return (
            sw.name,
            sw.isRegistered,
            sw.isActive,
            sw.lastActivity,
            sw.registrationDate,
            sw.owner
        );
    }

    /**
     * @dev Pausa o contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 