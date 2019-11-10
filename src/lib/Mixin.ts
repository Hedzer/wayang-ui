
import WebComponent from './WebComponent';
import { MIXINS } from './Constants';

abstract class Mixin {
	public static id: string;

	public static connect(component: WebComponent) {
		throw new Error('static connect(component: WebComponent), must be redefined');
	}
	public static disconnect(component: WebComponent) {
		throw new Error('static disconnect(component: WebComponent), must be redefined');
	}

	// must re-define
	public static html(html: HTMLTemplateElement): void {
		throw new Error('static html(html: HTMLTemplateElement): void, must be redefined');
	};
	public static css(css: HTMLTemplateElement): void {
		throw new Error('static css(css: HTMLTemplateElement): void, must be redefined');
	};
	public static properties(properties: Map<string, string>): void {
		throw new Error('static properties(properties: Map<string, string>): void, must be redefined');
	};
	public static observed(observed: string[]): void {
		throw new Error('static observed(observed: string[]): void, must be redefined');
	};
	public static converters(converters: Map<string, (value: string) => any>): void {
		throw new Error('static converters(converters: Map<string, (value: string) => any>): void, must be redefined');
	};

	// special members
	public static register() {
		const id = this.id;
		if (!id) { throw new Error('No id was defined for this mixin'); }

		if (MIXINS.has(id)) { throw new Error(`The mixin id ${ id } has already been registered`); }
		
		MIXINS.set(id, this);
	}
	public static stateOf(component: WebComponent): Map<string, any> {
		const key = `@wayang/mixin/state/${ this.id }`;
		if (!component.hasOwnProperty(key)) { component[key] = new Map<string, any>(); }
		return component[key];
	}

	public static attach(component: typeof WebComponent) {
		const cache = component.cache;
		if (cache.mixins.has(this.id)) { return; }

		cache.mixins.set(this.id, this);
		if (!component.mixins.includes(this)) { component.mixins.push(this); }
		this.html(cache.template);
		this.css(cache.styles);
		this.properties(cache.properties);
		this.observed(cache.observed);
		this.converters(cache.converters);
	}
}

export default Mixin;
