/** Public contracts at the incremental TypeScript / original simulator boundary. */
export interface Point {
  x: number;
  y: number;
}
export interface Port {
  id: number | string;
  name?: string;
  value: number;
  pos: { side: 0 | 1 | 2 | 3; pos: number };
  type: 'input' | 'output';
}
export interface Component {
  id: number | string;
  name?: string;
  pos: Point;
  input: Port[];
  output: Port[];
  update(): void;
}
export interface SavedBoard {
  name: string;
  fileName: string;
  fileSize: number;
  location: string;
}
export interface BoardFile {
  name: string;
  offset: Point;
  zoom: number;
  variables: Record<string, number | string>;
  variableReferences: Record<string, unknown[]>;
  data: string;
}
export interface FileStat {
  size: number;
}
export interface StorageAdapter {
  readdirSync(directory: string): string[];
  readFileSync(path: string, encoding?: string): string;
  writeFileSync(path: string, text: string, encoding?: string): void;
  writeFile(
    path: string,
    text: string,
    encoding: string,
    callback: (error: Error | null) => void,
  ): void;
  statSync(path: string): FileStat;
  unlink(path: string, callback: (error: Error | null) => void): void;
}
export type TouchTool = 'interact' | 'move' | 'pan' | 'select';
export interface DesktopBridge {
  quit(): void;
  openDevTools(): void;
  platform: string;
}
export interface ReleaseBridge {
  current(): import('./release').ReleaseNote;
  refresh(): Promise<import('./release').ReleaseNote>;
  sections(release: import('./release').ReleaseNote): import('./release').ReleaseSection[];
}
export interface REEOPlatform {
  readonly version: '2.1.0';
  readonly storage: StorageAdapter;
  exportBoard(): void;
  importBoard(): void;
  importFile(file: File): Promise<void>;
  quit(): void;
}
declare global {
  interface Window {
    reeo: REEOPlatform;
    reeoRelease: ReleaseBridge;
    reeoDesktop?: DesktopBridge;
    require: (
      module: string,
    ) =>
      | StorageAdapter
      | { remote: { getCurrentWindow(): { webContents: { openDevTools(): void } } } };
    __dirname: string;
    reeoDrawGhost: typeof import('./ghosts').drawGhost;
    reeoEvaluateLogicExpression: typeof import('./logic-expression').evaluateLogicExpression;
    reeoValidateLogicExpression: typeof import('./logic-expression').validateLogicExpression;
    reeoGhostState: typeof import('./ghosts').ghostState;
    reeoHelp: { open(component?: string): void };
    reeoDrawComponentBody: typeof import('./rendering').drawComponentBody;
    reeoCircuitSVG: typeof import('./icons').circuitSVG;
    reeoDrawComponentIcon: typeof import('./icons').drawComponentIcon;
    reeoI18n: { setLocale(locale: string): void; t(key: import('./i18n').MessageKey): string };
    reeoPositionPopup: typeof import('./geometry').positionPopup;
    reeoTick: typeof import('./simulation').runTick;
    reeoValidateCircuit: (data: unknown) => void;
    reeoExpression: (
      source: string,
      variables: Readonly<Record<string, number | string>>,
    ) => number;
  }
}
