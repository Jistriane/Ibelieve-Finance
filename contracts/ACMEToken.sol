// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./SubwalletRegistry.sol";

/**
 * @dev Implementação do token ACME com integração ao registro de subwallets
 */
contract ACMEToken is ERC20, Ownable, Pausable {
    // Eventos específicos
    event TokensBurned(address indexed from, uint256 amount);
    event TokensMinted(address indexed to, uint256 amount);

    // Referência ao registro de subwallets
    SubwalletRegistry public subwalletRegistry;
    address public zkProofRegistry;

    uint256 private constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 milhão de tokens

    /**
     * @dev Inicializa o token ACME
     * @param initialOwner Endereço do proprietário inicial
     * @param _subwalletRegistry Endereço do contrato de registro de subwallets
     */
    constructor(
        address initialOwner,
        address _subwalletRegistry
    ) ERC20("ACME Token", "ACME") Ownable() Pausable() {
        require(_subwalletRegistry != address(0), "Endereco do registro invalido");
        _transferOwnership(initialOwner);
        _mint(initialOwner, INITIAL_SUPPLY);
        subwalletRegistry = SubwalletRegistry(_subwalletRegistry);
    }

    /**
     * @dev Define o endereço do ZKProofRegistry
     */
    function setZKProofRegistry(address _zkProofRegistry) external onlyOwner {
        require(_zkProofRegistry != address(0), "Endereco invalido");
        zkProofRegistry = _zkProofRegistry;
    }

    /**
     * @dev Sobrescreve função de transferência para atualizar última atividade
     */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        if (subwalletRegistry.isValidSubwallet(msg.sender)) {
            subwalletRegistry.updateLastActivity(msg.sender);
        }
        return super.transfer(to, amount);
    }

    /**
     * @dev Função para queimar tokens
     */
    function burn(uint256 amount) public virtual {
        require(
            subwalletRegistry.isValidSubwallet(msg.sender) || 
            owner() == msg.sender || 
            msg.sender == zkProofRegistry,
            "Apenas subwallets, owner ou ZKProofRegistry"
        );
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Função para mintar novos tokens (apenas owner)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Permite que o proprietário pause todas as transferências
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Permite que o proprietário despause todas as transferências
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Hook que é chamado antes de qualquer transferência de tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 