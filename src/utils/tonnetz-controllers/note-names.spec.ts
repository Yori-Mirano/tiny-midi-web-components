import { getNoteNames } from "../note-names";

describe('note-names', () => {
  it('should return the complete note name list with sharp and flat notes', () => {
    const noteNames = ['A', '#', 'B', 'C'];
    const expected = ['A', 'A♯ Bb', 'B', 'C']

    const result = getNoteNames(noteNames);

    expect(result).toEqual(expected);
  });
})
