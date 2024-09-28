import { newSpecPage } from '@stencil/core/testing';
import { TinyTonnetzCell } from '../tiny-tonnetz-cell';

describe('tiny-tonnetz-cell', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TinyTonnetzCell],
      html: `<tiny-tonnetz-cell></tiny-tonnetz-cell>`,
    });
    expect(page.root).toEqualHtml(`
      <tiny-tonnetz-cell>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </tiny-tonnetz-cell>
    `);
  });
});
