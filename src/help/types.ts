export type Copy = readonly [en: string, ar: string, arz: string];
export interface ComponentGuide {
  id: string;
  title: Copy;
  behavior: Copy;
  wiring: Copy;
  example: Copy;
  caution: Copy;
}

export interface Recipe {
  id: string;
  title: Copy;
  steps: readonly Copy[];
  expected: Copy;
}
