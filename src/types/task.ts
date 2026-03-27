export interface Task {
  id: string;
  text: string;
  completed: boolean;
  deadline: string; // ISO string
  createdAt: string;
  stopwatchSeconds: number;
  stopwatchRunning: boolean;
}
