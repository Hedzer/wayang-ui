
import global from 'whenthough';
import Wayang from '../Wayang';
import CacheItem from '../CacheItem';
import { ELEMENT_CACHE } from '../Constants';

function register(element: typeof Wayang) {
	const tag = element['tag'];
	if (ELEMENT_CACHE.has(tag)) { return; }

	// template
	const template = document.createElement('template');
	template.innerHTML = element['html'];

	// styles
	const styles = document.createElement('template');
	let css = element['css'];
	if (typeof css === 'string') { css = [css]; }
	if (Array.isArray(css)) {
		styles.innerHTML = css
			.map(s => `<style type="text/css">\n${ s }\n</style>`)
			.join('\n');
	}

	// observed props
	const observed = element['observed'];
	
	// built-in props
	observed.set('presenter', 'string');

	const properties = [ ...observed.keys() ];
	
	const cache = new CacheItem(
		tag,
		template,
		styles,
		element,
		element['converters'],
		element['observed'],
		properties,
	);

	ELEMENT_CACHE.set(tag, cache);
	customElements.define(tag, element);

	global.set(Symbol.for(`@wayang/element/${ tag }`), element);
}

export default register;
