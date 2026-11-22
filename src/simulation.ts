export type UpdateTask = () => void;
export interface TickResult {
  readonly updates: number;
  readonly pending: number;
  readonly saturated: boolean;
}
/** Bounded work prevents a feedback circuit from blocking the editor indefinitely. */
export function runTick(queue: UpdateTask[], paused: boolean, budget = 10_000): TickResult {
  let updates = 0;
  if (!Number.isInteger(budget) || budget < 1)
    throw new Error('Tick budget must be a positive integer');
  while (queue.length > 0 && updates < budget && !paused) {
    const task = queue.shift();
    if (task) {
      task();
      updates++;
    }
  }
  return {
    updates,
    pending: queue.length,
    saturated: !paused && queue.length > 0 && updates === budget,
  };
}
