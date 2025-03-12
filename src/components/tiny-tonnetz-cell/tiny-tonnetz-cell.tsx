import { Component, Host, h, Prop } from '@stencil/core';

const NOTE_NAMES = ['C', 'C# Db', 'D', 'D# Eb', 'E', 'F', 'F# Gb', 'G', 'G# Ab', 'A', 'A# Bb', 'B'];
const BLACK_KEY_NOTE = [1, 3, 6, 8, 10];

function getNoteNameFromSemiToneCode(semiToneCode: number): string {
  return NOTE_NAMES[semiToneCode];
}

function isBlackKeyNote(semiToneCode: number): boolean {
  return BLACK_KEY_NOTE.includes(semiToneCode);
}

@Component({
  tag: 'tiny-tonnetz-cell',
  styleUrl: 'tiny-tonnetz-cell.css',
  shadow: false,
})
export class TinyTonnetzCell {

  @Prop() width: number;
  @Prop() height: number;
  @Prop() primary = false;
  @Prop() semiToneCode = 0;

  render() {
    return (
      <Host class={{cell: true, '-primary': this.primary, '-blackKey': isBlackKeyNote(this.semiToneCode)}}>
        <svg class="cell_background" width={this.width} height={this.height}>
          <line x1={0} y1={this.height} x2={this.width} y2={this.height}/>
          <line x1={0} y1={this.height} x2={0} y2={0}/>
          <line x1={0} y1={this.height} x2={this.width} y2={0}/>
        </svg>
        <div class="cell_node">
          { getNoteNameFromSemiToneCode(this.semiToneCode) }
        </div>
      </Host>
    );
  }

}
