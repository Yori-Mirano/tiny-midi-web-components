import { NoteNamingConventions, SEMI_TONE_COUNT } from "./models";

export const NOTE_NAMES = {
  [NoteNamingConventions.ENGLISH]: ['C', '#', 'D', '#', 'E', 'F', '#', 'G', '#', 'A', '#', 'B'],
  [NoteNamingConventions.LATIN]: ['Do', '#', 'Ré', '#', 'Mi', 'Fa', '#', 'Sol', '#', 'La', '#', 'Si'],
}

export function getNoteNames(noteNames: string[]) {
  return noteNames.map((noteName, semiToneCode) => {
    if (noteName === '#') {
      const previousNoteName = noteNames[(SEMI_TONE_COUNT + semiToneCode - 1) % SEMI_TONE_COUNT];
      const nextNoteName = noteNames[(SEMI_TONE_COUNT + semiToneCode + 1) % SEMI_TONE_COUNT];
      return `${previousNoteName}♯ ${nextNoteName}b`;
    }

    return noteName;
  })
}
