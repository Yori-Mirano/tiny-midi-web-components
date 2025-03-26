export enum NoteNamingConventions {
  ENGLISH = 'ENGLISH',
  LATIN = 'LATIN'
}

export enum NoteIntervals {
  MINOR_THIRD = 3,
  MAJOR_THIRD = 4,
  PERFECT_FIFTH = 7,
}

export type SemiToneCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const SEMI_TONE_COUNT = 12;

export const BLACK_KEY_NOTES: Array<SemiToneCode> = [1, 3, 6, 8, 10];

export type ActiveNotes = Partial<Record<SemiToneCode, Array<NoteKey>>>;

export interface NoteKey {
  state?: NoteState;
}

export enum NoteState {
  PRESSED = 'PRESSED',
  SUSTAINED = 'SUSTAINED',
  RELEASED = 'RELEASED',
}

export type TonnetzCellStates = Partial<Record<SemiToneCode, TonnetzCellState>>;

export interface TonnetzCellState {
  isActive: boolean;
  wasPlayed: boolean;
  state: NoteState;
  count: number;
  hasChordActive: boolean;
  isChordRoot: boolean;
  isMinorChordActive: boolean;
  isMajorChordActive: boolean;
  isPerfectFifthIntervalActive: boolean;
  isPerfectFifthIntervalPressed: boolean;
  isMajorThirdIntervalActive: boolean;
  isMajorThirdIntervalPressed: boolean;
  isMinorThirdIntervalActive: boolean;
  isMinorThirdIntervalPressed: boolean;
}
