import CacheItem from './CacheItem';
import Converters from './Converters';

const NO_ROOT = new ShadowRoot();
const NO_ELEMENT = new HTMLElement();
const NO_TEMPLATE = new HTMLTemplateElement();
const ELEMENT_CACHE: Map<string, CacheItem> = new Map<string, CacheItem>();
const CONVERTERS = new Converters();
const DEFAULT_SHADOWMODE: ShadowRootInit = { mode: 'closed' };

export { NO_ROOT };
export { NO_ELEMENT };
export { ELEMENT_CACHE };
export { CONVERTERS };
export { DEFAULT_SHADOWMODE };