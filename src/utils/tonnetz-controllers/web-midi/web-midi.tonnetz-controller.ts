import { Input } from "webmidi";
import { Components } from "../../../components";
import TinyTonnetz = Components.TinyTonnetz;
import { NoteKey, NoteState, SEMI_TONE_COUNT } from "../../models";

export class WebMidiTonnetzController {

  webMidiInput?: Input;

  sustainThreshold = 43; // from 0 to 127

  sustained = false;

  constructor(public tonnetz: TinyTonnetz) {}

  listen(webMidiInput: Input) {
    this.webMidiInput = webMidiInput;

    this.webMidiInput.addListener("noteon", e => {
      let notes: Array<NoteKey> = this.tonnetz.activeNotes?.[e.note.number % SEMI_TONE_COUNT];

      if (!notes) {
        notes = [];
        this.tonnetz.activeNotes[e.note.number % SEMI_TONE_COUNT] = notes;
      }

      notes.push({ state: NoteState.PRESSED });

      this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
    });

    this.webMidiInput.addListener("noteoff", e => {
      let notes: Array<NoteKey> = this.tonnetz.activeNotes?.[e.note.number % SEMI_TONE_COUNT];

      if (notes.length) {
        if (this.sustained) {
          const note = notes.find(note => note.state === NoteState.PRESSED);
          if (note) {
            note.state = NoteState.SUSTAINED;
          }
        } else {
          notes.shift();
        }

        this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
      }
    });

    this.webMidiInput.addListener("controlchange", e => {
      if (e.subtype === 'damperpedal') {
        this.sustained = e.rawValue > this.sustainThreshold;

        if (!this.sustained && this.tonnetz.activeNotes) {
          for (let notesKey in this.tonnetz.activeNotes) {
            let notes: Array<NoteKey> = this.tonnetz.activeNotes[notesKey];
            this.tonnetz.activeNotes[notesKey] = notes.filter(note => note.state !== NoteState.SUSTAINED);
          }

          this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
        }
      }
    });
  }
}
