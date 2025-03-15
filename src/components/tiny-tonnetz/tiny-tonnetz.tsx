import { Component, Host, h, Element, State, Prop, Listen, Watch } from '@stencil/core';
import { ActiveNotes, NoteIntervals, SemiToneCode } from "../../utils/models";
import { Components } from "../../components";
import TinyTonnetzCell = Components.TinyTonnetzCell;

@Component({
  tag: 'tiny-tonnetz',
  styleUrl: 'tiny-tonnetz.css',
  shadow: true,
})
export class TinyTonnetz {

  static readonly CLUSTER_HORIZONTAL_COUNT = 3;
  static readonly CLUSTER_VERTICAL_COUNT = 12 / TinyTonnetz.CLUSTER_HORIZONTAL_COUNT;

  static readonly SCALE_MIN = 0.5;
  static readonly SCALE_MAX = 1.5;
  static readonly SCALE_WHEEL_STEP = 0.125;

  @Element() el: HTMLElement;

  @Prop() activeNotes: ActiveNotes = {};
  @Prop({ mutable: true }) scale = 1;
  @Prop() centralClusterMargin = 1;
  @Prop({ attribute: 'scale-slider' }) isScaleSliderVisible = true;
  @Prop({ attribute: 'scaling' }) isScalingEnabled = true;
  @Prop({ attribute: 'force-light-theme' }) isLightTheme = false;
  @Prop({ attribute: 'force-dark-theme' }) isDarkTheme = false;

  @State() private size: { width: number, height: number } = { width: 0, height: 0 };

  private minHorizontalCount: number;
  private minVerticalCount: number;
  private resizeObserver: ResizeObserver;

  @Watch('scale')
  private clampScale(newValue: number) {
    this.scale = Math.min(Math.max(newValue, TinyTonnetz.SCALE_MIN), TinyTonnetz.SCALE_MAX);
  }

  @Watch('centralClusterMargin')
  private updateCentralClusterMargin(newValue: number) {
    this.minHorizontalCount = TinyTonnetz.CLUSTER_HORIZONTAL_COUNT + newValue * 2;
    this.minVerticalCount = TinyTonnetz.CLUSTER_VERTICAL_COUNT + newValue * 2;
  }

  @Listen('wheel')
  handleScroll(e: WheelEvent) {
    if (this.isScalingEnabled) {
      let step: number;

      switch (e.deltaMode) {
        case WheelEvent.DOM_DELTA_PIXEL:
          step = e.deltaY / 100;
          break;

        case WheelEvent.DOM_DELTA_LINE:
          step = e.deltaY > 0 ? 1 : -1;
          break;

        case WheelEvent.DOM_DELTA_PAGE:
          step = e.deltaY > 0 ? 100 : -100;
          break;
      }

      this.scale -= step * TinyTonnetz.SCALE_WHEEL_STEP;
    }
  }

  componentWillLoad() {
    this.clampScale(this.scale);
    this.updateCentralClusterMargin(this.centralClusterMargin);
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
      scaleToFittingCentralCluster = this.size.height / (numRows * minorThirdLength);
      numCols = Math.floor(numCols * aspectRatio);
    } else {
      scaleToFittingCentralCluster = this.size.width / (numCols * majorThirdLength);
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
    let legend: HTMLElement;
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

        if (col === -1 && row === -2) {
          legend = (
            <div class="tinyTonnetz_legend" style={{ translate:`${x}px ${y}px` }}>
              <div class="tinyTonnetz_legend_minorThird">3 🡆</div>
              <div class="tinyTonnetz_legend_majorThird">4 🡆</div>
              <div class="tinyTonnetz_legend_perfectFifth">🡄 5</div>
            </div>
          );
        }
      }
    }

    return [cells, clusterGrid, legend];
  }

  private hasHorizontalClusterSeparator(row: number) {
    return (row - 1) % TinyTonnetz.CLUSTER_VERTICAL_COUNT === 0;
  }

  private hasVerticalClusterSeparator(col: number) {
    return (col + 1) % TinyTonnetz.CLUSTER_HORIZONTAL_COUNT === 0;
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
      offset -= Math.floor(TinyTonnetz.CLUSTER_VERTICAL_COUNT / 2 - 1) * unit;
    } else {
      offset -= Math.floor(TinyTonnetz.CLUSTER_HORIZONTAL_COUNT / 2) * unit;
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
          translate: `${x}px ${y}px`,
        }}
      />
    );
  }


  render() {
    if (!this.size.width || !this.size.height) {
      return <Host>...</Host>
    }

    return (
      <Host style={{ colorScheme: this.isLightTheme ? 'light' : (this.isDarkTheme ? 'dark': 'light dark')}}>
        <div class="tinyTonnetz_anchor">
          {this.generateGrid()}
        </div>

        { (this.isScaleSliderVisible && this.isScalingEnabled) ?
          <div>
            <input
              class="tinyTonnetz_scaleSlider"
              type="range" min={TinyTonnetz.SCALE_MIN} max={TinyTonnetz.SCALE_MAX} step="any" list="markers"
              value={this.scale}
              onInput={event => this.scale = parseFloat((event.target as HTMLInputElement).value)}
            />

            <datalist id="markers">
              <option value={TinyTonnetz.SCALE_MIN} label='-'></option>
              <option value="1" label='1'></option>
              <option value={TinyTonnetz.SCALE_MAX} label='+'></option>
            </datalist>
          </div>
        :
          null
        }
      </Host>
    );
  }
}
