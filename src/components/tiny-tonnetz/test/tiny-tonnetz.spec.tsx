import { newSpecPage } from '@stencil/core/testing';
import { TinyTonnetz } from '../tiny-tonnetz';

describe('tiny-tonnetz', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TinyTonnetz],
      html: `<tiny-tonnetz></tiny-tonnetz>`,
    });
    expect(page.root).toEqualHtml(`
      <tiny-tonnetz>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </tiny-tonnetz>
    `);
  });
});
