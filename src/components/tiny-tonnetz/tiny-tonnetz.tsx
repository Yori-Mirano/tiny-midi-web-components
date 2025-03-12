import { Component, Host, h, Element, State, Prop } from '@stencil/core';

export enum NoteIntervals {
  MINOR_THIRD = 3,
  MAJOR_THIRD = 4,
  PERFECT_FIFTH = 7,
}

export type SemiToneCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type ActivatedNotes = Record<SemiToneCode, Array<Note>>;

export interface Note {
  sustained?: boolean;
}

@Component({
  tag: 'tiny-tonnetz',
  styleUrl: 'tiny-tonnetz.css',
  shadow: true,
})
export class TinyTonnetz {

  @Element() el: HTMLElement;

  @Prop() activatedNotes?: ActivatedNotes;
  @Prop({ mutable: true }) scale = 1;
  @Prop() marginUnitCellCount = 1;

  @State() dimensions: { width: number, height: number } = { width: 0, height: 0 };

  clusterHorizontalCount = 3;
  clusterVerticalCount = 4;
  minHorizontalCount: number;
  minVerticalCount: number;
  resizeObserver: ResizeObserver;

  componentWillLoad() {
    this.minHorizontalCount = this.clusterHorizontalCount + this.marginUnitCellCount * 2;
    this.minVerticalCount = this.clusterVerticalCount + this.marginUnitCellCount * 2;
  }

  connectedCallback() {
    this.initResizeObserver();
  }

  disconnectedCallback() {
    this.cleanupResizeObserver();
  }

  initResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.dimensions = { width, height };
      }
    });

    this.resizeObserver.observe(this.el);
  }

  cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  generateGrid() {
    const majorMinorThirdRatio = NoteIntervals.MAJOR_THIRD / NoteIntervals.MINOR_THIRD;

    const majorThirdLength = 120;
    const minorThirdLength = majorThirdLength / majorMinorThirdRatio;

    let numRows = this.minVerticalCount;
    let numCols = this.minHorizontalCount;

    const { width, height } = this.dimensions;
    let aspectRatio = width / height;
    const aspectRatioThreshold = (numCols * majorThirdLength) / (numRows * minorThirdLength);

    let scaleToFittingCentralCluster: number;

    if (aspectRatio > aspectRatioThreshold) {
      scaleToFittingCentralCluster = height / (this.minVerticalCount * minorThirdLength);
      numCols = Math.floor(numCols * aspectRatio);
    } else {
      scaleToFittingCentralCluster = width / (this.minHorizontalCount * majorThirdLength);
      numRows = Math.floor(numRows / aspectRatio * majorMinorThirdRatio);
    }

    numCols = Math.floor(numCols / this.scale + 2);
    numRows = Math.floor(numRows / this.scale + 2);

    const cells = this.generateCells(numCols, numRows, majorThirdLength, minorThirdLength);

    return (
      <div style={{transform: `scale(${this.scale * scaleToFittingCentralCluster})`}}>
        { cells }
      </div>
    );
  }

  private generateCells(numCols: number, numRows: number, horizontalUnit: number, verticalUnit: number) {
    const content = [];

    const isEvenNumCols = this.minHorizontalCount % 2 === 0
    const isEvenNumRows = this.minVerticalCount % 2 === 0

    const halfNumCols = Math.floor(numCols / 2);
    const halfNumRows = Math.floor(numRows / 2);

    for (let row = -halfNumRows; row < halfNumRows +(isEvenNumRows?0:1); row++) {
      for (let col = -halfNumCols; col < halfNumCols +(isEvenNumCols?0:1); col++) {
        const semiToneCode = this.getSemiToneCodeFromCoordinates(col, row);

        let x = col * horizontalUnit;
        let y = row * -verticalUnit;

        if (isEvenNumCols) {
          x += horizontalUnit / 2;
        }

        if (isEvenNumRows) {
          y -= verticalUnit / 2;
        }


        content.push(
          this.generateCell(
            this.activatedNotes,
            x, y,
            horizontalUnit, verticalUnit,
            semiToneCode,
            this.isCentralCluster(col, row)
          )
        );
      }
    }

    return content;
  }

  getSemiToneCodeFromCoordinates(col: number, row: number) {
    let semiTone = (col * NoteIntervals.MAJOR_THIRD + row * NoteIntervals.MINOR_THIRD) % 12;

    if (semiTone < 0) {
      semiTone = semiTone + 12;
    }

    return semiTone;
  }

  isCentralCluster(col: number, row: number) {
    return (
      row >= -this.clusterVerticalCount / 2
      && row < this.clusterVerticalCount / 2
      && col >= -this.clusterHorizontalCount / 2
      && col < this.clusterHorizontalCount / 2
    );
  }

  generateCell(activatedNotes:ActivatedNotes, x: number, y: number, width: number, height: number, semiToneCode: number, primary: boolean) {
    return (
      <tiny-tonnetz-cell
        activatedNotes={activatedNotes}
        width={width}
        height={height}
        semiToneCode={semiToneCode}
        primary={primary}
        style={{translate:`${x}px ${y}px`, position: 'absolute'}}
      />
    );
  }


  render() {
    if (!this.dimensions.width || !this.dimensions.height) {
      return <Host>...</Host>
    }

    return (
      <Host>
        <div class="tinyTonnetz_anchor">
          {this.generateGrid()}
        </div>

        <input
          class="tinyTonnetz_zoomSlider"
          type="range" min="0.5" max="1.5" step="any" list="markers"
          value={this.scale}
          onInput={event => this.scale = parseFloat((event.target as HTMLInputElement).value)}
        />

        <datalist id="markers">
          <option value="0.25" label='-'></option>
          <option value="1" label='1'></option>
          <option value="1.75" label='+'></option>
        </datalist>
      </Host>
    );
  }
}
