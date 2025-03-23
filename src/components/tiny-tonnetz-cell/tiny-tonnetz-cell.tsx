import { Component, h, Host, Prop } from '@stencil/core';
import { NoteState, SemiToneCode } from "../../utils/models";
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

  @Prop() cellStates?: any;
  @Prop() width: number;
  @Prop() height: number;
  @Prop() semiToneCode: SemiToneCode = 0;

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
            class={{ 'cell_majorChord': true, '-active': this.cellStates[this.semiToneCode]?.isMajorChordActive}}
          />

          <polygon
            points={`0,0 0,${this.height} ${this.width},0`}
            class={{ 'cell_minorChord': true, '-active': this.cellStates[this.semiToneCode]?.isMinorChordActive}}
          />

          <line
            x1={0} y1={this.height}
            x2={0} y2={0}
            class={{
              '-active': this.cellStates[this.semiToneCode]?.isMinorThirdIntervalActive,
              '-pressed': this.cellStates[this.semiToneCode]?.isMinorThirdIntervalPressed
          }}
          />

          <line
            x1={0} y1={this.height}
            x2={this.width} y2={this.height}
            class={{
              '-active': this.cellStates[this.semiToneCode]?.isMajorThirdIntervalActive,
              '-pressed': this.cellStates[this.semiToneCode]?.isMajorThirdIntervalPressed
          }}/>

          <line
            x1={0} y1={this.height}
            x2={this.width} y2={0}
            class={{
              '-active': this.cellStates[this.semiToneCode]?.isPerfectFifthIntervalActive,
              '-pressed': this.cellStates[this.semiToneCode]?.isPerfectFifthIntervalPressed,
              '-chordActive': this.cellStates[this.semiToneCode]?.hasChordActive
          }}/>
        </svg>

        <div
          class={{
            cell_node: true,
            '-blackKey': isBlackKeyNote(this.semiToneCode),
            '-active': this.cellStates[this.semiToneCode]?.isActive,
            '-chordRoot': this.cellStates[this.semiToneCode]?.isChordRoot,
            '-minorThird': this.cellStates[this.semiToneCode]?.isMinorThirdIntervalActive,
            '-majorThird': this.cellStates[this.semiToneCode]?.isMajorThirdIntervalActive,
            '-minorChord': this.cellStates[this.semiToneCode]?.isMinorChordActive,
            '-majorChord': this.cellStates[this.semiToneCode]?.isMajorChordActive,
            '-pressed': this.cellStates[this.semiToneCode]?.state === NoteState.PRESSED,
            '-completelyPressed': this.cellStates[this.semiToneCode]?.count > 1
          }}
          style={{
            '--count': `${this.cellStates[this.semiToneCode]?.count - 1}`
          }}
          innerHTML={ getNoteNameFromSemiToneCode(this.semiToneCode) }
        />
      </Host>
    );
  }

}
