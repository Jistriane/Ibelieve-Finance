// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @dev Implementação do contrato Pausable
 */
abstract contract IbelievePausable is Pausable {
    /**
     * @dev Inicializa o contrato em estado não pausado.
     */
    constructor() Pausable() {}
} 