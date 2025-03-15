export enum NoteIntervals {
  MINOR_THIRD = 3,
  MAJOR_THIRD = 4,
  PERFECT_FIFTH = 7,
}

export type SemiToneCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const BLACK_KEY_NOTES: Array<SemiToneCode> = [1, 3, 6, 8, 10];

export type ActiveNotes = Partial<Record<SemiToneCode, Array<Note>>>;

export interface Note {
  status?: NoteStatus;
}

export enum NoteStatus {
  PRESSED = 'PRESSED',
  SUSTAINED = 'SUSTAINED',
}
