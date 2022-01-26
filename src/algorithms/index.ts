import { dfs, bfs } from './search';

export const FRAMES_PER_SECOND = 13;
export const FRAME_MILLIS = (1 / FRAMES_PER_SECOND) * 1000;

export type ReportStatusCallback = (stepCount: number, queueSize: number, elapsedMillis: number) => void;
export type ReportGaStatusCallback = (generation: number, elapsedMillis: number, finished: boolean) => void;
export type ReportResultCallback<T> = (result: T, stepCount: number, elapsedMillis: number) => void;
export type ReportFindingCallback<T> = (result: T) => void;
export type ReportGaFindingCallback<T> = (result: T, generation: number) => void;

export { dfs, bfs };