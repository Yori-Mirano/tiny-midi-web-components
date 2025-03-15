import { Component, Host, h, Element, State, Prop } from '@stencil/core';
import { ActiveNotes, NoteIntervals, SemiToneCode } from "../../utils/models";
import { Components } from "../../components";
import TinyTonnetzCell = Components.TinyTonnetzCell;

@Component({
  tag: 'tiny-tonnetz',
  styleUrl: 'tiny-tonnetz.css',
  shadow: true,
})
export class TinyTonnetz {

  @Element() el: HTMLElement;

  @Prop() activeNotes: ActiveNotes = {} as ActiveNotes;
  @Prop({ mutable: true }) scale = 1;
  @Prop() marginUnitCellCount = 1;

  @State() size: { width: number, height: number } = { width: 0, height: 0 };

  clusterHorizontalCount = 3;
  clusterVerticalCount: number;
  minHorizontalCount: number;
  minVerticalCount: number;
  resizeObserver: ResizeObserver;

  componentWillLoad() {
    this.clusterVerticalCount = 12 / this.clusterHorizontalCount
    this.minHorizontalCount = this.clusterHorizontalCount + this.marginUnitCellCount * 2;
    this.minVerticalCount = this.clusterVerticalCount + this.marginUnitCellCount * 2;
  }

  connectedCallback() {
    this.initResizeObserver();
  }

  disconnectedCallback() {
    this.cleanupResizeObserver();
  }

  private initResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        this.size = { width, height };
      }
    });

    this.resizeObserver.observe(this.el);
  }

  private cleanupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private generateGrid() {
    const majorMinorThirdRatio = NoteIntervals.MAJOR_THIRD / NoteIntervals.MINOR_THIRD;

    const majorThirdLength = 120;
    const minorThirdLength = majorThirdLength / majorMinorThirdRatio;

    let numRows = this.minVerticalCount;
    let numCols = this.minHorizontalCount;

    let aspectRatio = this.size.width / this.size.height;
    const aspectRatioThreshold = (numCols * majorThirdLength) / (numRows * minorThirdLength);

    let scaleToFittingCentralCluster: number;

    if (aspectRatio > aspectRatioThreshold) {
      scaleToFittingCentralCluster = this.size.height / (this.minVerticalCount * minorThirdLength);
      numCols = Math.floor(numCols * aspectRatio);
    } else {
      scaleToFittingCentralCluster = this.size.width / (this.minHorizontalCount * majorThirdLength);
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
    const cells: Array<TinyTonnetzCell> = [];
    const clusterGrid: Array<HTMLDivElement> = [];

    const isEvenNumCols = this.minHorizontalCount % 2 === 0
    const isEvenNumRows = this.minVerticalCount % 2 === 0

    const halfNumCols = Math.floor(numCols / 2);
    const halfNumRows = Math.floor(numRows / 2);

    const rowStart = -halfNumRows;
    const colStart = -halfNumCols;

    const rowEnd = halfNumRows + (isEvenNumRows ? 0 : 1);
    const colEnd = halfNumCols + (isEvenNumCols ? 0 : 1);

    for (let row = rowStart; row < rowEnd; row++) {
      for (let col = colStart; col < colEnd; col++) {
        const semiToneCode = this.getSemiToneCodeFromCoordinates(col, row);

        let x = col * horizontalUnit;
        let y = row * -verticalUnit;

        if (isEvenNumCols) {
          x += horizontalUnit / 2;
        }

        if (isEvenNumRows) {
          y -= verticalUnit / 2;
        }

        if (row === rowStart  &&  this.hasVerticalClusterSeparator(col)) {
          clusterGrid.push(
            this.createClusterSeparator(x, horizontalUnit)
          );
        }

        if (col === colStart && this.hasHorizontalClusterSeparator(row)) {
          clusterGrid.push(
            this.createClusterSeparator(y, verticalUnit, true)
          );
        }

        cells.push(
          this.createCell(this.activeNotes, x, y, horizontalUnit, verticalUnit, semiToneCode)
        );
      }
    }

    return [cells, clusterGrid];
  }

  private hasHorizontalClusterSeparator(row: number) {
    return (row - 1) % this.clusterVerticalCount === 0;
  }

  private hasVerticalClusterSeparator(col: number) {
    return (col + 1) % this.clusterHorizontalCount === 0;
  }

  private getSemiToneCodeFromCoordinates(col: number, row: number): SemiToneCode {
    let semiTone = (col * NoteIntervals.MAJOR_THIRD + row * NoteIntervals.MINOR_THIRD) % 12;

    if (semiTone < 0) {
      semiTone = semiTone + 12;
    }

    return semiTone as SemiToneCode;
  }

  private createClusterSeparator(position: number, unit: number, isHorizontal = false) {
    let offset = unit / 2;

    if (isHorizontal) {
      offset -= Math.floor(this.clusterVerticalCount / 2 - 1) * unit;
    } else {
      offset -= Math.floor(this.clusterHorizontalCount / 2) * unit;
    }

    return <div
      class={{ tinyTonnetz_clusterSeparator: true, '-horizontal': isHorizontal }}
      style={{ transform: `translate(${ position + offset }px, -50%)` }}
    />;
  }

  private createCell(activeNotes: ActiveNotes, x: number, y: number, width: number, height: number, semiToneCode: SemiToneCode) {
    return (
      <tiny-tonnetz-cell
        key={`${x}-${y}`}
        activeNotes={activeNotes}
        width={width}
        height={height}
        semiToneCode={semiToneCode}
        style={{
          position: 'absolute',
          translate:`${x}px ${y}px`
        }}
      />
    );
  }


  render() {
    if (!this.size.width || !this.size.height) {
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
