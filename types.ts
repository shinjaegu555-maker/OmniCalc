
export interface Calculation {
  id: string;
  query: string;
  result: string;
  timestamp: number;
  isAiResponse: boolean;
}

export interface CalculatorState {
  input: string;
  history: Calculation[];
  isLoading: boolean;
  error: string | null;
}
