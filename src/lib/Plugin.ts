
import Wayang from './Wayang';
import { PLUGINS, ELEMENT_CACHE } from './Constants';
import CacheItem from './CacheItem';

abstract class Plugin {
	public static id: string;

	public static connect(element: Wayang) {
		throw new Error('static connect(element: Wayang), must be redefined');
	}
	public static disconnect(element: Wayang) {
		throw new Error('static disconnect(element: Wayang), must be redefined');
	}

	public static html(html: HTMLTemplateElement): void {
		throw new Error('static html(html: HTMLTemplateElement): void, must be redefined');
	};
	public static css(css: HTMLTemplateElement): void {
		throw new Error('static css(css: HTMLTemplateElement): void, must be redefined');
	};
	public static observed(observed: string[]): void {
		throw new Error('static observed(observed: string[]): void, must be redefined');
	};
	public static converters(converters: Map<string, (string) => any>): void {
		throw new Error('static converters(converters: Map<string, (string) => any>): void, must be redefined');
	};
	public static register() {
		const id = this.id;
		if (!id) { throw new Error('No id was defined for this plugin'); }

		if (PLUGINS.has(id)) { throw new Error(`The plugin id ${ id } has already been registered`); }
		
		PLUGINS.set(id, this);
	}
	public static apply(element: typeof Wayang) {
		const el: any = element;
		const tag = el.tag;
		const cache = (<CacheItem>ELEMENT_CACHE.get(tag));
		if (cache.plugins.has(this.id)) { return; }

		cache.plugins.set(this.id, this);
		this.html(cache.template);
		this.css(cache.styles);
		this.observed(cache.observed)
		this.converters(new Map<string, (string) => any>(el.converters));
	}
}

export default Plugin;
