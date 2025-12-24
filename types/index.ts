export interface PageElement {
  id: string;
  tagName: string;
  selector: string;
  testId?: string;
  ariaLabel?: string;
  role?: string;
  text?: string;
  classes: string[];
  styles: Record<string, string>;
  attributes: Record<string, string>;
  children: PageElement[];
  xpath: string;
  isInteractive: boolean;
  elementType: ElementType;
  uniqueName: string;
  interactions?: Interaction[];
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ElementType = 
  | 'header' 
  | 'footer' 
  | 'navigation' 
  | 'button' 
  | 'input' 
  | 'link' 
  | 'image' 
  | 'modal' 
  | 'form'
  | 'dropdown'
  | 'tab'
  | 'accordion'
  | 'slider'
  | 'datepicker'
  | 'autocomplete'
  | 'container'
  | 'text'
  | 'list'
  | 'table'
  | 'card'
  | 'other';

export interface Interaction {
  type: InteractionType;
  element: string;
  value?: string;
  waitFor?: string;
  screenshot?: boolean;
  apiCalls?: string[];
  nextStep?: string;
}

export type InteractionType = 
  | 'click'
  | 'fill'
  | 'select'
  | 'hover'
  | 'drag'
  | 'upload'
  | 'navigate'
  | 'scroll'
  | 'wait'
  | 'check'
  | 'uncheck'
  | 'focus'
  | 'blur'
  | 'press';

export interface UserFlow {
  name: string;
  description: string;
  steps: FlowStep[];
  expectedAPICalls: APICall[];
  visualCheckpoints: VisualCheckpoint[];
}

export interface FlowStep {
  id: string;
  action: Interaction;
  assertion?: Assertion;
  screenshot?: boolean;
  visualRegression?: boolean;
}

export interface Assertion {
  type: 'visible' | 'hidden' | 'text' | 'value' | 'count' | 'url' | 'attribute';
  selector?: string;
  expected: string | number | boolean;
}

export interface APICall {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  requestBody?: any;
  responseBody?: any;
  status: number;
  mockResponse?: any;
}

export interface VisualCheckpoint {
  name: string;
  selector?: string;
  fullPage: boolean;
  mask?: string[];
  threshold?: number;
}

export interface PageAnalysis {
  url: string;
  title: string;
  elements: PageElement[];
  screenshot: string;
  sections: PageSection[];
  interactiveElements: PageElement[];
  userFlows: UserFlow[];
  apiRoutes: APICall[];
  metadata: {
    totalElements: number;
    testIds: number;
    interactiveElements: number;
    forms: number;
    modals: number;
    tables: number;
  };
}

export interface PageSection {
  name: string;
  type: ElementType;
  elements: PageElement[];
  selector: string;
}

export interface GeneratedCode {
  pomFile: string;
  testFile: string;
  fixturesFile: string;
  constantsFile: string;
  apiMocksFile?: string;
  visualRegressionFile?: string;
  componentTestFile?: string;
  e2eTestFile?: string;
  accessibilityTestFile?: string;
  performanceTestFile?: string;
}

export type TestTemplate = 
  | 'snapshot'
  | 'e2e'
  | 'component'
  | 'accessibility'
  | 'performance'
  | 'api'
  | 'visual-regression'
  | 'cross-browser'
  | 'mobile'
  | 'all';

export type ExportFormat = 
  | 'playwright-ts'
  | 'playwright-js'
  | 'cypress-ts'
  | 'cypress-js'
  | 'puppeteer-ts'
  | 'puppeteer-js'
  | 'selenium-ts'
  | 'selenium-js'
  | 'testcafe-ts'
  | 'testcafe-js';

export interface VisualRegressionConfig {
  provider: 'percy' | 'applitools' | 'chromatic' | 'playwright' | 'backstop';
  apiKey?: string;
  projectName: string;
  baselineFolder?: string;
  threshold?: number;
  enableOnCI?: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  templates: TestTemplate[];
  includeAPIMocks: boolean;
  includeVisualRegression: boolean;
  visualConfig?: VisualRegressionConfig;
  projectName: string;
}
