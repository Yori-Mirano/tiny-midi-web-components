import { ActiveNotes, TonnetzCellStates, NoteIntervals, NoteKey, NoteState, SEMI_TONE_COUNT, SemiToneCode } from "./models";


export function getComputedTonnetzCellStates(activeNotes: ActiveNotes): TonnetzCellStates {
  const cellStates: TonnetzCellStates = {};

  Object.entries(activeNotes).forEach(([semiToneCodeKey, activeNote]) => {
    const semiToneCode = Number(semiToneCodeKey) as SemiToneCode;

    cellStates[semiToneCode] = {
      isActive: isNoteActive(activeNote),
      wasPlayed: false,

      state: getNoteState(activeNote),
      count: getPressedNoteCount(activeNote),

      hasChordActive: hasChordActive(activeNotes, semiToneCode),
      isChordRoot: isChordRoot(activeNotes, semiToneCode),

      isMinorChordActive: isMinorChordActive(activeNotes, semiToneCode),
      isMajorChordActive: isMajorChordActive(activeNotes, semiToneCode),

      isPerfectFifthIntervalActive: isPerfectFifthIntervalActive(activeNotes, semiToneCode),
      isPerfectFifthIntervalPressed: isPerfectFifthIntervalPressed(activeNotes, semiToneCode),

      isMajorThirdIntervalActive: isMajorThirdIntervalActive(activeNotes, semiToneCode),
      isMajorThirdIntervalPressed: isMajorThirdIntervalPressed(activeNotes, semiToneCode),

      isMinorThirdIntervalActive: isMinorThirdIntervalActive(activeNotes, semiToneCode),
      isMinorThirdIntervalPressed: isMinorThirdIntervalPressed(activeNotes, semiToneCode),

      is7ofMinorMaj7Chord: is7ofMinorMaj7Chord(activeNotes, semiToneCode),
      is9ofMAjorFlat9Chord: is9ofMAjorFlat9Chord(activeNotes, semiToneCode),
    }
  });

  return cellStates;
}


function isNoteActive(noteKeys?: Array<NoteKey>) {
  return noteKeys?.length > 0;
}

function getNoteState(noteKeys: Array<NoteKey>): NoteState {
  return noteKeys.find(noteKey => noteKey.state === NoteState.PRESSED)?.state
    || noteKeys.find(noteKey => noteKey.state === NoteState.SUSTAINED)?.state
    || NoteState.RELEASED;
}

function isPressed(noteKeys: Array<NoteKey>) {
  return getPressedNoteCount(noteKeys) > 0;
}

function getPressedNoteCount(noteKeys?: Array<NoteKey>): number {
  return noteKeys?.filter(note => note.state === NoteState.PRESSED)?.length || 0;
}

function hasChordActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isMajorThirdIntervalActive(activeNotes, semiToneCode) || isMinorThirdIntervalActive(activeNotes, semiToneCode);
}

function isChordRoot(activeNotes: ActiveNotes, semiToneCode: SemiToneCode): boolean {
  return hasInterval(activeNotes, semiToneCode)
    && !activeNotes?.[(SEMI_TONE_COUNT + semiToneCode - NoteIntervals.MINOR_THIRD) % SEMI_TONE_COUNT]?.length
    && !activeNotes?.[(SEMI_TONE_COUNT + semiToneCode - NoteIntervals.MAJOR_THIRD) % SEMI_TONE_COUNT]?.length
    && !activeNotes?.[(SEMI_TONE_COUNT + semiToneCode - NoteIntervals.PERFECT_FIFTH) % SEMI_TONE_COUNT]?.length;
}

function isMinorChordActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isMinorThirdIntervalActive(activeNotes, semiToneCode) && isPerfectFifthIntervalActive(activeNotes, semiToneCode);
}

function isMajorChordActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isMajorThirdIntervalActive(activeNotes, semiToneCode) && isPerfectFifthIntervalActive(activeNotes, semiToneCode);
}

function hasInterval(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isMinorThirdIntervalActive(activeNotes, semiToneCode) || isMajorThirdIntervalActive(activeNotes, semiToneCode) || isPerfectFifthIntervalActive(activeNotes, semiToneCode);
}

function isMinorThirdIntervalActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isNoteActive(activeNotes[semiToneCode]) && activeNotes?.[(semiToneCode + NoteIntervals.MINOR_THIRD) % SEMI_TONE_COUNT]?.length > 0
}

function isMinorThirdIntervalPressed(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isPressed(activeNotes[semiToneCode])
    && activeNotes?.[(semiToneCode + NoteIntervals.MINOR_THIRD) % SEMI_TONE_COUNT]?.filter((note:NoteKey) => note.state === NoteState.PRESSED)?.length
}

function isMajorThirdIntervalActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isNoteActive(activeNotes[semiToneCode]) && activeNotes?.[(semiToneCode + NoteIntervals.MAJOR_THIRD) % SEMI_TONE_COUNT]?.length > 0
}

function isMajorThirdIntervalPressed(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isPressed(activeNotes[semiToneCode])
    && activeNotes?.[(semiToneCode + NoteIntervals.MAJOR_THIRD) % SEMI_TONE_COUNT]?.filter((note:NoteKey) => note.state === NoteState.PRESSED)?.length
}

function isPerfectFifthIntervalActive(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isNoteActive(activeNotes[semiToneCode]) && activeNotes?.[(semiToneCode + NoteIntervals.PERFECT_FIFTH) % SEMI_TONE_COUNT]?.length > 0
}

function isPerfectFifthIntervalPressed(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isPressed(activeNotes[semiToneCode])
    && activeNotes?.[(semiToneCode + NoteIntervals.PERFECT_FIFTH) % SEMI_TONE_COUNT]?.filter((note:NoteKey) => note.state === NoteState.PRESSED)?.length
}

function is7ofMinorMaj7Chord(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isNoteActive(activeNotes[semiToneCode])
    && activeNotes?.[(semiToneCode + NoteIntervals.MAJOR_THIRD) % SEMI_TONE_COUNT]?.length > 0
    && activeNotes?.[(semiToneCode - NoteIntervals.MAJOR_THIRD + SEMI_TONE_COUNT) % SEMI_TONE_COUNT]?.length > 0
    && activeNotes?.[(semiToneCode + 1) % SEMI_TONE_COUNT]?.length > 0
    && !(activeNotes?.[(semiToneCode - NoteIntervals.MINOR_THIRD + SEMI_TONE_COUNT) % SEMI_TONE_COUNT]?.length > 0) // prevent some false positive
    && !(activeNotes?.[(semiToneCode + NoteIntervals.PERFECT_FIFTH) % SEMI_TONE_COUNT]?.length > 0) // prevent some false positive
}

function is9ofMAjorFlat9Chord(activeNotes: ActiveNotes, semiToneCode: SemiToneCode) {
  return isNoteActive(activeNotes[semiToneCode])
    && activeNotes?.[(semiToneCode + NoteIntervals.MINOR_THIRD) % SEMI_TONE_COUNT]?.length > 0
    && activeNotes?.[(semiToneCode + NoteIntervals.MINOR_THIRD * 2) % SEMI_TONE_COUNT]?.length > 0
    && activeNotes?.[(semiToneCode - NoteIntervals.MINOR_THIRD + SEMI_TONE_COUNT) % SEMI_TONE_COUNT]?.length > 0
    && activeNotes?.[(semiToneCode - 1 + SEMI_TONE_COUNT) % SEMI_TONE_COUNT]?.length > 0
    && !(activeNotes?.[(semiToneCode - NoteIntervals.MAJOR_THIRD + SEMI_TONE_COUNT) % SEMI_TONE_COUNT]?.length > 0) // prevent some false positive
    && !(activeNotes?.[(semiToneCode + NoteIntervals.PERFECT_FIFTH) % SEMI_TONE_COUNT]?.length > 0) // prevent some false positive
}
