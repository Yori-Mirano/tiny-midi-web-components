import { Component, h, Host, Prop } from '@stencil/core';
import { ActiveNotes, NoteIntervals, NoteStatus, SemiToneCode } from "../../utils/models";
import { isBlackKeyNote } from "../../utils/utils";

const NOTE_NAMES = [
  'C',
  '<span>C<sup>♯</sup></span> <span>D<sup>b</sup></span>',
  'D',
  '<span>D<sup>♯</sup></span> <span>E<sup>b</sup></span>',
  'E',
  'F',
  '<span>F<sup>♯</sup></span> <span>G<sup>b</sup></span>',
  'G',
  '<span>G<sup>♯</sup></span> <span>A<sup>b</sup></span>',
  'A',
  '<span>A<sup>♯</sup></span> <span>B<sup>b</sup></span>',
  'B'
];

function getNoteNameFromSemiToneCode(semiToneCode: number): string {
  return NOTE_NAMES[semiToneCode];
}

@Component({
  tag: 'tiny-tonnetz-cell',
  styleUrl: 'tiny-tonnetz-cell.css',
  shadow: false,
})
export class TinyTonnetzCell {

  @Prop() activeNotes?: ActiveNotes;
  @Prop() width: number;
  @Prop() height: number;
  @Prop() semiToneCode: SemiToneCode = 0;

  isActive() {
    return this.activeNotes?.[this.semiToneCode]?.length > 0;
  }

  isPressed() {
    return this.getPressedNoteCount() > 0;
  }

  getPressedNoteCount() {
    return this.activeNotes?.[this.semiToneCode]?.filter(note => note.status === NoteStatus.PRESSED)?.length || 0;
  }

  isMinorThirdIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MINOR_THIRD) % 12]?.length > 0
  }

  isMinorThirdIntervalPressed() {
    return this.isPressed()
      && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MINOR_THIRD) % 12]?.filter(note => note.status === NoteStatus.PRESSED)?.length
  }

  isMajorThirdIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MAJOR_THIRD) % 12]?.length > 0
  }

  isMajorThirdIntervalPressed() {
    return this.isPressed()
      && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MAJOR_THIRD) % 12]?.filter(note => note.status === NoteStatus.PRESSED)?.length
  }

  isPerfectFifthIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.PERFECT_FIFTH) % 12]?.length > 0
  }

  isPerfectFifthIntervalPressed() {
    return this.isPressed()
      && this.activeNotes?.[(this.semiToneCode + NoteIntervals.PERFECT_FIFTH) % 12]?.filter(note => note.status === NoteStatus.PRESSED)?.length

  }

  hasChordActive() {
    return this.isMajorThirdIntervalActive() || this.isMinorThirdIntervalActive();
  }


  isMinorChordActive() {
    return this.isMinorThirdIntervalActive() && this.isPerfectFifthIntervalActive();
  }

  isMajorChordActive() {
    return this.isMajorThirdIntervalActive() && this.isPerfectFifthIntervalActive();
  }

  isChordRoot() {
    return this.hasInterval()
      && !this.activeNotes?.[(12 + this.semiToneCode - NoteIntervals.MINOR_THIRD) % 12]?.length
      && !this.activeNotes?.[(12 + this.semiToneCode - NoteIntervals.MAJOR_THIRD) % 12]?.length
      && !this.activeNotes?.[(12 + this.semiToneCode - NoteIntervals.PERFECT_FIFTH) % 12]?.length;
  }

  hasInterval() {
    return this.isMinorThirdIntervalActive() || this.isMajorThirdIntervalActive() || this.isPerfectFifthIntervalActive();
  }

  render() {
    return (
      <Host>
        <svg class="cell_background" width={this.width} height={this.height}>
          <defs>
            <linearGradient class="cell_majorGradient" id="major-grad" x1="100%" y1="100%" x2="0%" y2="0%" >
              <stop offset="0%"/>
              <stop offset="50%"/>
            </linearGradient>

            <linearGradient class="cell_minorGradient" id="minor-grad" x1="0%" y1="0" x2="100%" y2="100%" >
              <stop offset="0%"/>
              <stop offset="50%"/>
            </linearGradient>
          </defs>

          <polygon
            points={`0,${this.height} ${this.width},0 ${this.width},${this.height}`}
            class={{ 'cell_majorChord': true, '-active': this.isMajorChordActive()}}
          />

          <polygon
            points={`0,0 0,${this.height} ${this.width},0`}
            class={{ 'cell_minorChord': true, '-active': this.isMinorChordActive()}}
          />

          <line
            x1={0} y1={this.height}
            x2={0} y2={0}
            class={{
              '-active': this.isMinorThirdIntervalActive(),
              '-pressed': this.isMinorThirdIntervalPressed()
          }}
          />

          <line
            x1={0} y1={this.height}
            x2={this.width} y2={this.height}
            class={{
              '-active': this.isMajorThirdIntervalActive(),
              '-pressed': this.isMajorThirdIntervalPressed()
          }}/>

          <line
            x1={0} y1={this.height}
            x2={this.width} y2={0}
            class={{
              '-active': this.isPerfectFifthIntervalActive(),
              '-pressed': this.isPerfectFifthIntervalPressed(),
              '-chordActive': this.hasChordActive()
          }}/>
        </svg>

        <div
          class={{
            cell_node: true,
            '-blackKey': isBlackKeyNote(this.semiToneCode),
            '-active': this.isActive(),
            '-chordRoot': this.isChordRoot(),
            '-minorThird': this.isMinorThirdIntervalActive(),
            '-majorThird': this.isMajorThirdIntervalActive(),
            '-minorChord': this.isMinorChordActive(),
            '-majorChord': this.isMajorChordActive(),
            '-pressed': this.isPressed(),
            '-completelyPressed': this.getPressedNoteCount() > 1
          }}
          style={{
            '--count': `${this.getPressedNoteCount() - 1}`
          }}
          innerHTML={ getNoteNameFromSemiToneCode(this.semiToneCode) }
        />
      </Host>
    );
  }

}
