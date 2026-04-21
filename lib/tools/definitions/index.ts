import { SessionToolDefinition } from '../tool-types';
import { backTool } from './back';
import { clickSelectorTool } from './click-selector';
import { clickTextTool } from './click-text';
import { extractTextTool } from './extract-text';
import { fillFieldTool } from './fill-field';
import { hoverTool } from './hover';
import { navigateTool } from './navigate';
import { pressKeyTool } from './press-key';
import { refreshTool } from './refresh';
import { screenshotTool } from './screenshot';
import { scrollTool } from './scroll';
import { selectOptionTool } from './select-option';
import { switchTabTool } from './switch-tab';
import { waitForElementTool } from './wait-for-element';
import { waitForTextTool } from './wait-for-text';

export const defaultTools: SessionToolDefinition[] = [
  navigateTool,
  clickTextTool,
  clickSelectorTool,
  fillFieldTool,
  pressKeyTool,
  selectOptionTool,
  hoverTool,
  scrollTool,
  waitForTextTool,
  waitForElementTool,
  extractTextTool,
  screenshotTool,
  switchTabTool,
  backTool,
  refreshTool,
];
