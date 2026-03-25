
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isMeaningful: boolean;
  date: string; // YYYY-MM-DD
}

export interface DayScore {
  date: string;
  score: number;
}

export interface AppState {
  todos: Todo[];
  totalScore: number;
}
