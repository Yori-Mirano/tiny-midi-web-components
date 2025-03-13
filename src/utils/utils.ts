import { BLACK_KEY_NOTES, SemiToneCode } from "./models";

export function format(first?: string, middle?: string, last?: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export function isBlackKeyNote(semiToneCode: SemiToneCode): boolean {
  return BLACK_KEY_NOTES.includes(semiToneCode);
}
