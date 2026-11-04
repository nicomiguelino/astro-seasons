import { join } from 'path';
import { test, type Page } from '@playwright/test';
import { SUMMER_SEASON, type Season } from '../seasons';

type ColorScheme = 'light' | 'dark';

const COLOR_SCHEMES: ColorScheme[] = ['light', 'dark'];
const SCREENSHOTS_DIRECTORY: string = 'screenshots';

// Playwright's `animations: 'disabled'` only covers CSS animations. The summer heat shimmer is an SVG (SMIL)
// animation that runs on the document timeline, so freeze it at its first frame to keep captures identical.
async function freezeSvgAnimations(page: Page): Promise<void> {
  await page.evaluate((): void => {
    document.querySelectorAll<SVGSVGElement>('svg').forEach((svg: SVGSVGElement): void => {
      svg.setCurrentTime(0);
      svg.pauseAnimations();
    });
  });
}

export function defineScreenshotTests(pageName: string, path: string, seasons: Season[] = [SUMMER_SEASON]): void {
  for (const season of seasons) {
    for (const colorScheme of COLOR_SCHEMES) {
      test(`${pageName} page captures the ${season.name} ${colorScheme} screenshot`, async ({ page }) => {
        const outputPath: string = join(SCREENSHOTS_DIRECTORY, `${pageName}-${season.name}-${colorScheme}.png`);
        await page.clock.setFixedTime(new Date(season.date));
        await page.emulateMedia({ colorScheme });
        await page.goto(path);
        await freezeSvgAnimations(page);
        await page.screenshot({ path: outputPath, animations: 'disabled' });
      });
    }
  }
}
