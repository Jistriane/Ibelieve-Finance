pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template SolvencyProof() {
    // Inputs privados (não revelados)
    signal input netWorth; // Valor líquido (ativos - passivos)
    
    // Inputs públicos
    signal input requestedAmount; // Valor do financiamento solicitado
    signal input timestamp;
    
    // Outputs
    signal output isApproved;
    
    // Componentes
    component gtZero = GreaterThan(32);
    component gtThreeX = GreaterThan(32);
    
    // Restrições
    // 1. Garante que o valor líquido é positivo
    gtZero.in[0] <== netWorth;
    gtZero.in[1] <== 0;
    
    // 2. Verifica se o valor líquido é pelo menos 3x o solicitado
    gtThreeX.in[0] <== netWorth;
    gtThreeX.in[1] <== requestedAmount * 3;
    
    // 3. Só aprova se ambas as condições forem verdadeiras
    isApproved <== gtZero.out * gtThreeX.out;
}

component main = SolvencyProof();
