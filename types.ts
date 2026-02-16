export interface Calculation {
  id: string;
  query: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  input: string;
  history: Calculation[];
  isLoading: boolean;
  error: string | null;
}