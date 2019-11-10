import CacheItem from './CacheItem';
import global from 'whenthough';
import WebComponent from './WebComponent';
import Presenter from './Presenter';
import Mixin from './Mixin';

const COMPONENT_CACHE: Map<string, CacheItem> = new Map<string, CacheItem>();
const DEFAULT_SHADOWMODE: ShadowRootInit = { mode: 'open' };
const COMPONENTS = global.set(Symbol.for('@wayang/web-components'), new Map<string, typeof WebComponent>());
const PRESENTERS = global.set(Symbol.for('@wayang/presenters'), new Map<string, typeof Presenter>());
const MIXINS = global.set(Symbol.for('@wayang/mixins'), new Map<string, typeof Mixin>());
const CONVERTERS = new Map<string, (value: string) => any>([
	[ 'string', (value: string) => { return value; } ],
	[ 'integer', (value: string) => { return parseInt(value); } ],
	[ 'float', (value: string) => { return parseFloat(value); } ],
	[ 'number', (value: string) => { return Number(value); } ],
	[ 'json', (value: string) => { return JSON.parse(value); } ],
	[ 'boolean', (value: string) => { value.toLowerCase() === 'true'; } ],
	[ 'date', (value: string) => { return new Date(value); } ],
	[ 'ticks', (value: string) => { return new Date(Number(value)); } ],
	[ 'exists', (value: string) => { return (value !== null); } ],
]);
const NO_TAG: string = '!no-tag';
const NO_HTML: string = '!no-html';
const NO_CSS: string = '!no-css';

export { COMPONENT_CACHE };
export { COMPONENTS };
export { PRESENTERS };
export { MIXINS };
export { CONVERTERS };
export { DEFAULT_SHADOWMODE };
export { NO_TAG };
export { NO_HTML };
export { NO_CSS };