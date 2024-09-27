import { Component, Host, h, Element, State, Prop } from '@stencil/core';

@Component({
  tag: 'tiny-tonnetz',
  styleUrl: 'tiny-tonnetz.css',
  shadow: true,
})
export class TinyTonnetz {

  @Element() el: HTMLElement;

  @Prop({ mutable: true }) scale = 1;
  @Prop({ mutable: true }) marginUnitCellCount = 2

  @State() dimensions: { width: number, height: number } = { width: 0, height: 0 };

  unitCellHorizontalCount = 4;
  unitCellVerticalCount = 5;
  minHorizontalCount = this.unitCellHorizontalCount + this.marginUnitCellCount * 2;
  minVerticalCount = this.unitCellVerticalCount + this.marginUnitCellCount * 2;
  noteSize = 1;
  majorMinorThirdRatio = 4/3;
  majorThirdLength = 3;
  minorThirdLength = this.majorThirdLength / this.majorMinorThirdRatio;
  resizeObserver: ResizeObserver;
  cellElements: Array<SVGElement> = [];

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
    const content = [];
    const {width, height } = this.dimensions;
    let aspectRatio = width / height;
    const isEvenNumCols = this.minHorizontalCount % 2 === 0
    const isEvenNumRows = this.minVerticalCount % 2 === 0
    let numRows: number;
    let numCols: number;
    let scaleFittingUnitCell: number;

    if (aspectRatio > 1) {
      scaleFittingUnitCell = 100 / (this.minVerticalCount * this.minorThirdLength);
      numCols = Math.ceil(this.minHorizontalCount * aspectRatio);
      numRows = this.minVerticalCount;
    } else {
      scaleFittingUnitCell = 100 / (this.minHorizontalCount * this.majorThirdLength);
      numCols = this.minHorizontalCount;
      numRows = Math.ceil(this.minVerticalCount / aspectRatio);
    }

    const scale = this.scale * scaleFittingUnitCell;

    const circleDiameter = this.noteSize * scale;
    const circleRadius = circleDiameter / 2;

    const horizontalUnit = this.majorThirdLength * scale;
    const verticalUnit = this.minorThirdLength * scale;

    numCols = Math.floor(numCols / this.scale + 2);
    numRows = Math.floor(numRows / this.scale + 2);

    const halfNumCols = numCols / 2;
    const halfNumRows = numRows / 2;

    for (let row = 0; row < halfNumRows; row++) {
      for (let col = 0; col < halfNumCols; col++) {
        const isFirstRow = row === 0;
        const isFirstCol = col === 0;

        let cx = col * horizontalUnit;
        let cy = row * verticalUnit;

        const key = `${row}-${col}`;

        let color = 'white';

        if (row < this.unitCellVerticalCount/2 && col < this.unitCellHorizontalCount/2) {
          color = 'red';
        }

        if (isEvenNumCols) {
          cx += horizontalUnit / 2;
        }

        if (isEvenNumRows) {
          cy += verticalUnit / 2;
        }

        content.push(this.generatePoint(cx, cy, circleRadius, key, color));

        if (!isFirstCol || isFirstCol && isEvenNumCols) {
          content.push(this.generatePoint(-cx, cy, circleRadius, key, color));
        }

        if (!isFirstRow || isFirstRow && isEvenNumRows) {
          content.push(this.generatePoint(cx, -cy, circleRadius, key, color));
        }

        if ((!isFirstCol || isFirstCol && isEvenNumCols) && (!isFirstRow || isFirstRow && isEvenNumRows)) {
          content.push(this.generatePoint(-cx, -cy, circleRadius, key, color));
        }
      }
    }

    return content;
  }

  generatePoint(cx: number, cy: number, circleRadius: number, key: string, color: string = 'white') {
    return <circle key={key} cx={cx} cy={cy} r={circleRadius} fill={color} ref={element => this.initCell(element)}/>;
  }

  initCell(element: SVGElement) {
    if (!this.cellElements.includes(element)) {
      this.cellElements.push(element);

      //element.addEventListener('mouseenter', () => element.classList.add('-highlight'));
      //element.addEventListener('mouseleave', () => element.classList.remove('-highlight'));
      //element.addEventListener('ended', () => console.log(element));
    }
  }

  render() {
    return (
      <Host>
        <svg width="100%" height="100%">
          <rect width="100%" height="100%"/>
          <svg width="100%" height="100%" viewBox="-50 -50 100 100">
            {this.generateGrid()}
          </svg>
        </svg>

        <input
          type="range"
          min="0.25"
          max="1.75"
          step="any"
          list="markers"
          value={this.scale}
          onInput={event => this.scale = parseFloat((event.target as HTMLInputElement).value)}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            zIndex: '1',
            writingMode: 'vertical-lr',
            direction: 'rtl'
          }}
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
