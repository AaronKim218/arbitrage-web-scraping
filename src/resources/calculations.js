export function convertOddsToDecimal(number){
    return number > 0 ? ((number/100.0) + 1) : ((100.0/Math.abs(number)) + 1);
}

export function calculateProbability(number) {
    return (1.0/number).toPrecision(3);
}

export function isArbitragePossible(prob1, prob2) {
    return ((prob1+prob2)<1)
}

export function calculateBet(totalBet, probability) {
    return totalBet*probability;
}