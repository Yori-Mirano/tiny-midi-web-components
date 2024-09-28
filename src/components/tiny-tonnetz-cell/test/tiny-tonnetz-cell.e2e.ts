import { newE2EPage } from '@stencil/core/testing';

describe('tiny-tonnetz-cell', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<tiny-tonnetz-cell></tiny-tonnetz-cell>');

    const element = await page.find('tiny-tonnetz-cell');
    expect(element).toHaveClass('hydrated');
  });
});
