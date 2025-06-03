// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev Implementação do contrato Ownable
 */
abstract contract IbelieveOwnable is Ownable {
    /**
     * @dev Inicializa o contrato definindo o endereço fornecido como proprietário inicial.
     */
    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }
} 