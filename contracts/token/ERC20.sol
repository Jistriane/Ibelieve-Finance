// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @dev Implementação do token ERC20 com funcionalidades de pausa e propriedade
 */
abstract contract IbelieveERC20 is ERC20, Ownable, Pausable {
    /**
     * @dev Inicializa o contrato com nome, símbolo e proprietário inicial
     */
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable() Pausable() {
        _transferOwnership(initialOwner);
    }
} 