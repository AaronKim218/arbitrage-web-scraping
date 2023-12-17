public class FormulaCode {

	public static void main(String[] args){
        
		
	
	}
    public double convertOddsToDecimal(int number)
    {
        return number > 1 ? ((double)(number/100) + 1) : ((double)(100/number) + 1);
    }
    public double calculateProbability(double number)
    {
        return 1/number;
    }
    public boolean isArbitragePossible(double prob1, double prob2)
    {
        return ((prob1+prob2)<1)
    }
    public double calculateBet(int totalBet, double probability)
    {
        return totalBet*probability;
    }
}