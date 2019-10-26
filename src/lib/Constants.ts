import CacheItem from './CacheItem';
import Converters from './Converters';

const ELEMENT_CACHE: Map<string, CacheItem> = new Map<string, CacheItem>();
const CONVERTERS = new Converters();
const DEFAULT_SHADOWMODE: ShadowRootInit = { mode: 'open' };

export { ELEMENT_CACHE };
export { CONVERTERS };
export { DEFAULT_SHADOWMODE };