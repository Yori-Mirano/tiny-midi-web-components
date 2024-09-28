import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'tiny-tonnetz-cell',
  styleUrl: 'tiny-tonnetz-cell.css',
  shadow: false,
})
export class TinyTonnetzCell {

  @Prop({ mutable: true }) primary = false;
  @Prop({ mutable: true }) semiToneCode = 0;

  render() {
    return (
      <Host>
        <div class="cell_background"/>
        <div class={{'-primary': this.primary, cell_node: true}}>
          {this.semiToneCode}
        </div>
      </Host>
    );
  }
}
