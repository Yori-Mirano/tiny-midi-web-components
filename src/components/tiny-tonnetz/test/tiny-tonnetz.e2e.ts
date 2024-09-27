import { newE2EPage } from '@stencil/core/testing';

describe('tiny-tonnetz', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<tiny-tonnetz></tiny-tonnetz>');

    const element = await page.find('tiny-tonnetz');
    expect(element).toHaveClass('hydrated');
  });
});
