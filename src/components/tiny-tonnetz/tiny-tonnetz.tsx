import { Component, Element, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
import {
  ActiveNotes,
  NoteIntervals,
  NoteNamingConventions,
  SEMI_TONE_COUNT,
  SemiToneCode, TonnetzCellState,
  TonnetzCellStates
} from "../../utils/models";
import { Components } from "../../components";
import { LocalStorage } from "../../utils/decorators/local-storage.decorator";
import { getComputedTonnetzCellStates } from "../../utils/get-computed-cell-states.function";
import { NOTE_NAMES } from "../../utils/note-names";
import TinyTonnetzCell = Components.TinyTonnetzCell;

@Component({
  tag: 'tiny-tonnetz',
  styleUrl: 'tiny-tonnetz.css',
  shadow: true,
})
export class TinyTonnetz {

  static readonly HORIZONTAL_SEMI_TONE_UNIT = 4;
  static readonly VERTICAL_SEMI_TONE_UNIT = 3;

  static readonly CLUSTER_HORIZONTAL_COUNT = SEMI_TONE_COUNT / TinyTonnetz.HORIZONTAL_SEMI_TONE_UNIT;
  static readonly CLUSTER_VERTICAL_COUNT = SEMI_TONE_COUNT / TinyTonnetz.VERTICAL_SEMI_TONE_UNIT;

  static readonly SCALE_MIN = 0.5;
  static readonly SCALE_MAX = 1.5;
  static readonly SCALE_WHEEL_STEP = 0.125;

  @Element() el: HTMLElement;

  get id() { return this.el.id; }

  @Prop({ mutable: true }) activeNotes: ActiveNotes = {};
  @Prop() centralClusterMargin = 1;
  @Prop({ attribute: 'controls' }) iscontrolsVisible: boolean = true;
  @Prop({ attribute: 'scaling' }) isScalingEnabled: boolean = true;
  @LocalStorage('id') @Prop({ mutable: true }) scale = 1;
  @LocalStorage('id') @Prop({ mutable: true, attribute: 'force-light-theme' }) isLightTheme: boolean = false;
  @LocalStorage('id') @Prop({ mutable: true, attribute: 'force-dark-theme' }) isDarkTheme: boolean =  false;
  @LocalStorage('id') @Prop({ mutable: true, attribute: 'trace' }) isTracing: boolean = false;
  @LocalStorage('id') @Prop({ mutable: true, attribute: 'trace-played-notes' }) isTracingPlayedNote: boolean = false;
  @LocalStorage('id') @Prop({ mutable: true }) noteNamingConvention: NoteNamingConventions = NoteNamingConventions.ENGLISH;
  @Prop() noteNamingConventionOptions: Array<NoteNamingConventions> = [
    NoteNamingConventions.ENGLISH,
    NoteNamingConventions.LATIN,
  ];

  @State() private hasNoTransition: boolean = false;
  @State() private size: { width: number, height: number } = { width: 0, height: 0 };

  private minHorizontalCount: number;
  private minVerticalCount: number;
  private resizeObserver: ResizeObserver;
  private cellStates: TonnetzCellStates = {};

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

    const previousCellStates = this.cellStates;
    this.cellStates = getComputedTonnetzCellStates(this.activeNotes);

    if (this.isTracingPlayedNote) {
      Object.entries(previousCellStates).forEach(([semiToneCode, cellState]) => {
        if (this.cellStates[semiToneCode]?.isActive || cellState.isActive || cellState.wasPlayed) {
          if (!this.cellStates[semiToneCode]) {
            this.cellStates[semiToneCode] = {} as TonnetzCellState;
          }

          this.cellStates[semiToneCode].wasPlayed = true;
        }
      });
    }

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
          this.createCell(this.cellStates, semiToneCode, x, y, horizontalUnit, verticalUnit)
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

  private createCell(cellStates: any, semiToneCode: SemiToneCode, x: number, y: number, width: number, height: number) {
    return (
      <tiny-tonnetz-cell
        key={`${x}-${y}`}
        cellStates={cellStates}
        width={width}
        height={height}
        semiToneCode={semiToneCode}
        noteNamingConvention={this.noteNamingConvention}
        isTracing={this.isTracing}
        hasNoTransition={this.hasNoTransition}
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

        { this.iscontrolsVisible ? <div>
          <div class="tinyTonnetz_controls -right">
            <div class="tinyTonnetz_controls_switcher" title="Note naming convention">
              {this.noteNamingConventionOptions.map(namingConvention => {
                return (
                  <button
                    class={{'-active': this.noteNamingConvention === namingConvention}}
                    onClick={() => {
                      this.noteNamingConvention = namingConvention
                    }}
                  >
                    {NOTE_NAMES[namingConvention][0]}
                  </button>
                );
              })}
            </div>

            <div class="tinyTonnetz_controls_switcher -icons" title="Theme switcher">
              <button
                class={{'-active': this.isLightTheme && !this.isDarkTheme}}
                onClick={() => {
                  this.hasNoTransition = true;
                  this.isLightTheme = true;
                  this.isDarkTheme = false;
                  requestAnimationFrame(() => {
                    this.hasNoTransition = false;
                  });
                }}
              >
                ☀
              </button>

              <button
                class={{'-active': !this.isLightTheme && !this.isDarkTheme}}
                onClick={() => {
                  this.hasNoTransition = true;
                  this.isLightTheme = false;
                  this.isDarkTheme = false;
                  requestAnimationFrame(() => {
                    this.hasNoTransition = false;
                  });
                }}
              >
                ⇅
              </button>
              <button
                class={{'-active': !this.isLightTheme && this.isDarkTheme}}
                onClick={() => {
                  this.hasNoTransition = true;
                  this.isLightTheme = false;
                  this.isDarkTheme = true;
                  requestAnimationFrame(() => {
                    this.hasNoTransition = false;
                  });
                }}
              >
                ★
              </button>
            </div>

            {this.isScalingEnabled ?
              <div>
                <input
                  class="tinyTonnetz_controls_scaleSlider"
                  title="Scale"
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
              : null}

          </div>

          <div class="tinyTonnetz_controls">
            <div class="tinyTonnetz_controls_switcher" title="Afterglow">
              <button
                class={{'-active': this.isTracing}}
                onClick={() => {
                  this.isTracing = true
                }}
              >
                1s
              </button>
              <button
                class={{'-active': !this.isTracing}}
                onClick={() => {
                  this.isTracing = false
                }}
              >
                0s
              </button>
            </div>


            <div class="tinyTonnetz_controls_switcher -icons" title="Mark played notes">
              {this.isTracingPlayedNote ?
                <button
                  onClick={() => {
                    this.activeNotes = {};
                    this.cellStates = {};
                  }}
                  disabled={Object.keys(this.cellStates).length === 0}
                >
                  ↺
                </button>
                :

                <button
                  class={{'-active': this.isTracingPlayedNote}}
                  onClick={() => {
                    this.isTracingPlayedNote = true
                  }}
                >
                  on
                </button>
              }
              <button
                class={{'-active': !this.isTracingPlayedNote}}
                onClick={() => {
                  this.isTracingPlayedNote = false;
                  this.activeNotes = {};
                  this.cellStates = {};
                }}
              >
                off
              </button>
            </div>

          </div>
        </div> : null }
      </Host>
    );
  }
}
