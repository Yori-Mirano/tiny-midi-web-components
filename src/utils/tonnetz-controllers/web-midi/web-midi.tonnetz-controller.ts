import { Input } from "webmidi";
import { Components } from "../../../components";
import TinyTonnetz = Components.TinyTonnetz;
import { NoteStatus } from "../../models";

export class WebMidiTonnetzController {

  webMidiInput?: Input;

  sustainThreshold = 43; // from 0 to 127

  sustained = false;

  constructor(public tonnetz: TinyTonnetz) {}

  listen(webMidiInput: Input) {
    this.webMidiInput = webMidiInput;

    this.webMidiInput.addListener("noteon", e => {
      let notes = this.tonnetz.activeNotes?.[e.note.number % 12];

      if (!notes) {
        notes = [];
        this.tonnetz.activeNotes[e.note.number % 12] = notes;
      }

      notes.push({ status: NoteStatus.PRESSED });

      this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
    });

    this.webMidiInput.addListener("noteoff", e => {
      let notes = this.tonnetz.activeNotes?.[e.note.number % 12];

      if (notes.length) {
        if (this.sustained) {
          const note = notes.find(note => note.status === NoteStatus.PRESSED);
          if (note) {
            note.status = NoteStatus.SUSTAINED;
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
            let notes = this.tonnetz.activeNotes[notesKey];
            this.tonnetz.activeNotes[notesKey] = notes.filter(note => note.status !== NoteStatus.SUSTAINED);
          }

          this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
        }
      }
    });
  }
}
