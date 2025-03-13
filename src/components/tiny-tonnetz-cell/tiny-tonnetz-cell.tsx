import { Component, h, Host, Prop } from '@stencil/core';
import { ActiveNotes, NoteIntervals, NoteStatus, SemiToneCode } from "../../utils/models";
import { isBlackKeyNote } from "../../utils/utils";

const NOTE_NAMES = [
  'C',
  '<span>C<sup>♯</sup></span> <span>C<sup>b</sup></span>',
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
  @Prop() primary = false;
  @Prop() semiToneCode: SemiToneCode = 0;

  isActive() {
    return this.activeNotes?.[this.semiToneCode]?.length > 0;
  }

  getPressedNoteCount() {
    return this.activeNotes?.[this.semiToneCode]?.filter(note => note.status === NoteStatus.PRESSED)?.length || 0;
  }

  isMinorThirdIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MINOR_THIRD) % 12]?.length > 0
  }

  isMajorThirdIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.MAJOR_THIRD) % 12]?.length > 0
  }

  isPerfectFifthIntervalActive() {
    return this.isActive() && this.activeNotes?.[(this.semiToneCode + NoteIntervals.PERFECT_FIFTH) % 12]?.length > 0
  }

  isPerfetFifthIntervalActiveOnly() {
    return this.isPerfectFifthIntervalActive && !this.isMajorThirdIntervalActive() && !this.isMinorThirdIntervalActive();
  }

  isMinorChordActive() {
    return this.isMinorThirdIntervalActive() && this.isPerfectFifthIntervalActive();
  }

  isMajorChordActive() {
    return this.isMajorThirdIntervalActive() && this.isPerfectFifthIntervalActive();
  }

  render() {
    return (
      <Host
        class={{
          cell: true,
          '-primary': this.primary,
          '-blackKey': isBlackKeyNote(this.semiToneCode),
          '-active': this.isActive(),
          '-pressed': this.getPressedNoteCount() > 0
        }}
      >
        <svg class="cell_background" width={this.width} height={this.height}>
          <defs>
            <linearGradient id="major-grad" x1="100%" y1="100%" x2="0%" y2="0%" >
              <stop offset="0%" stop-color="hsl(30deg 70% 50%)" stop-opacity=".8" />
              <stop offset="50%" stop-color="hsl(30deg 70% 50%)" stop-opacity="0.0" />
            </linearGradient>

            <linearGradient id="minor-grad" x1="0%" y1="0" x2="100%" y2="100%" >
              <stop offset="0%" stop-color="hsl(220, 50%, 40%)" stop-opacity="0.8" />
              <stop offset="50%" stop-color="hsl(220, 50%, 40%)" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <polygon points={`0,${this.height} ${this.width},0 ${this.width},${this.height}`} class={{ 'cell_majorChord': true, '-active': this.isMajorChordActive()}}/>
          <polygon points={`0,0 0,${this.height} ${this.width},0`} class={{ 'cell_minorChord': true, '-active': this.isMinorChordActive()}}/>

          <line x1={0} y1={this.height} x2={0} y2={0} class={{ '-active': this.isMinorThirdIntervalActive() }}/>
          <line x1={0} y1={this.height} x2={this.width} y2={this.height} class={{ '-active': this.isMajorThirdIntervalActive() }}/>
          <line x1={0} y1={this.height} x2={this.width} y2={0} class={{ perfectFifth: true, '-active': this.isPerfectFifthIntervalActive(), '-alone': this.isPerfetFifthIntervalActiveOnly() }}/>
        </svg>
        <div
          class="cell_node"
          style={{
            '--count': `${this.getPressedNoteCount() - 1}`
          }}
          innerHTML={ getNoteNameFromSemiToneCode(this.semiToneCode) }
        />
      </Host>
    );
  }

}
