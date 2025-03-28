import { ControlChangeMessageEvent, Input, NoteMessageEvent } from "webmidi";
import { Components } from "../../../components";
import TinyTonnetz = Components.TinyTonnetz;
import { NoteKey, NoteState, SEMI_TONE_COUNT } from "../../models";

export class WebMidiTonnetzController {

  sustainThreshold = 43; // from 0 to 127

  sustained = false;

  constructor(public tonnetz: TinyTonnetz) {}

  listen(webMidiInput: Input) {
    webMidiInput.addListener("noteon", this.onNoteOn);
    webMidiInput.addListener('noteoff', this.onNoteOff);
    webMidiInput.addListener('controlchange', this.onControlchange);
  }

  unlisten(webMidiInput: Input) {
    webMidiInput.removeListener("noteon", this.onNoteOn);
    webMidiInput.removeListener('noteoff', this.onNoteOff);
    webMidiInput.removeListener('controlchange', this.onControlchange);
  }

  onNoteOn = (event: NoteMessageEvent) => {
    let notes: Array<NoteKey> = this.tonnetz.activeNotes?.[event.note.number % SEMI_TONE_COUNT];

    if (!notes) {
      notes = [];
      this.tonnetz.activeNotes[event.note.number % SEMI_TONE_COUNT] = notes;
    }

    notes.push({ state: NoteState.PRESSED });

    this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
  }

  onNoteOff = (event: NoteMessageEvent) => {
    let notes: Array<NoteKey> = this.tonnetz.activeNotes?.[event.note.number % SEMI_TONE_COUNT];

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
  }

  onControlchange = (event: ControlChangeMessageEvent) => {
    if (event.subtype === 'damperpedal') {
      this.sustained = event.rawValue > this.sustainThreshold;

      if (!this.sustained && this.tonnetz.activeNotes) {
        for (let notesKey in this.tonnetz.activeNotes) {
          let notes: Array<NoteKey> = this.tonnetz.activeNotes[notesKey];
          this.tonnetz.activeNotes[notesKey] = notes.filter(note => note.state !== NoteState.SUSTAINED);
        }

        this.tonnetz.activeNotes = { ...this.tonnetz.activeNotes }
      }
    }
  }
}
