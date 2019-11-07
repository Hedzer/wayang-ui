import CacheItem from './CacheItem';
import global from 'whenthough';

const ELEMENT_CACHE: Map<string, CacheItem> = new Map<string, CacheItem>();
const DEFAULT_SHADOWMODE: ShadowRootInit = { mode: 'open' };
const ELEMENTS = global.set(Symbol.for('@wayang/elements'), new Map<string, any>());
const PRESENTERS = global.set(Symbol.for('@wayang/presenters'), new Map<string, any>());
const PLUGINS = global.set(Symbol.for('@wayang/plugins'), new Map<string, any>());
const CONVERTERS = new Map<string, (v: string) => any>([
	[ 'string', (v: string) => { return v; } ],
	[ 'integer', (v: string) => { return parseInt(v); } ],
	[ 'float', (v: string) => { return parseFloat(v); } ],
	[ 'number', (v: string) => { return Number(v); } ],
	[ 'json', (v: string) => { return JSON.parse(v); } ],
	[ 'boolean', (v: string) => { v.toLowerCase() === 'true'; } ],
	[ 'date', (v: string) => { return new Date(v); } ],
	[ 'ticks', (v: string) => { return new Date(Number(v)); } ],
	[ 'exists', (v: string) => { return (v !== null); } ],
]);

export { ELEMENT_CACHE };
export { ELEMENTS };
export { PRESENTERS };
export { PLUGINS };
export { CONVERTERS };
export { DEFAULT_SHADOWMODE };