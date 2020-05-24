
import global from 'whenthough';
import { CONVERTERS, COMPONENT_CACHE, NO_TAG, NO_HTML, NO_CSS, DEFAULT_SHADOWMODE, COMPONENTS } from './Constants';
import CacheItem from './CacheItem';
import Presenter from './Presenter';
import Mixin from './Mixin';

const debounceKey = Symbol.for('@wayang/web-component/attributeChangedCallback/debounce')

abstract class WebComponent extends HTMLElement {
	
	public readonly root: ShadowRoot;
	public readonly class: typeof WebComponent;
	public readonly global = global;
	private debouncers: any = { };
	
	constructor() {
		super();
		this.class = <any>this.constructor;
		this.root = this.attachShadow(this.class.mode);
		this.root.appendChild(this.class.cache.template.content.cloneNode(true));
		this.root.appendChild(this.class.cache.styles.content.cloneNode(true));
		this.class.mixins.forEach(mixin => mixin.connect(this));
	}

	// must be re-defined
	public static tag: string = NO_TAG;
	public static html: string = NO_HTML;
	public static css: string | string[] = NO_CSS;
	public static observed = new Map<string, string>();

	// optionally re-defined
	public static converters = new Map<string, (value: string) => any>(CONVERTERS);
	public static mode = DEFAULT_SHADOWMODE;
	public static mixins = new Array<typeof Mixin>();

	// required shadow element members
	public static get observedAttributes(): string[] { 
		return this.cache.observed;
	}

	connectedCallback() {
		this.dispatch('connected', this);
	}

	adoptedCallback() {
		this.dispatch('adopted', this);
	}

	disconnectedCallback() {
		this.dispatch('disconnected', this);
		this.destructor();
	}

	attributeChangedCallback(name: string, previous: string, current: string) {
		if (previous === current) { return; }

		clearTimeout(this.debouncers[name]);
		this.debouncers[name] = setTimeout(() => {
			const properties = this.class.cache.properties;
			const converters = this.class.cache.converters;
			const converter = (converters.get(properties.get(name) || 'string') || (v => v));
			const _old = this[name];
			const _new = converter(current);
			this[name] = _new;
			this.dispatch(`${name}Changed`, { old: _old, new: _new });
		}, 0);
	}

	// element instance properties
	public get presenter(): string {
		return this.getAttribute('presenter') || '';
	}
	public set presenter(value: string) {
		value ? this.setAttribute('presenter', value) : this.removeAttribute('presenter');
		Presenter.removeFrom(this);
		Presenter.addTo(this, value);
	}

	// element instance methods
	public dispatch<T>(eventName: string, data: T): boolean {
		return this.dispatchEvent(new CustomEvent<T>(eventName, { detail: data, bubbles: true, cancelable: true }));
	}
	public listen(eventName: string, listener: EventListenerOrEventListenerObject): this {
		this.addEventListener(eventName, listener);
		return this;
	}
	public unlisten(eventName: string, listener: EventListenerOrEventListenerObject): this {
		this.removeEventListener(eventName, listener);
		return this;
	}
	public select(selector: string): Element[] {
		return Array.prototype.slice.call(this.root.querySelectorAll(selector));
	}

	// special members
	public static get cache(): CacheItem { return <CacheItem>COMPONENT_CACHE.get(this.tag); }
	public static register() {

		// basic validation
		if (this.tag == NO_TAG) { throw new Error('static tag: string, must be redefined.\nString must be a valid custom element tag.'); }
		if (this.html == NO_HTML) { throw new Error('static html: string, must be redefined.'); }
		if (this.css == NO_CSS) { throw new Error('static css: string, must be redefined.'); }

		// register
		if (this.cache) { return; }

		// template
		const template = document.createElement('template');
		template.innerHTML = this.html;
	
		// styles
		const styles = document.createElement('template');
		let css = this.css;
		if (typeof css === 'string') { css = [css]; }
		if (Array.isArray(css)) {
			styles.innerHTML = css
				.map(s => `<style type="text/css">\n${ s }\n</style>`)
				.join('\n');
		}
	
		// observed props
		const observed = this.observed;
		
		// built-in props
		observed.set('presenter', 'string');
	
		const properties = [ ...observed.keys() ];
		const cache = new CacheItem(
			this.tag,
			template,
			styles,
			this,
			this.converters,
			this.observed,
			properties,
		);
	
		COMPONENT_CACHE.set(this.tag, cache);
		COMPONENTS.set(this.tag, this);
		this.mixins.forEach(mixin => mixin.attach(this));
		customElements.define(this.tag, <any>this);
	
		global.set(Symbol.for(`@wayang/web-components/${ this.tag }`), this);
	}
	public destructor() {
		Presenter.removeFrom(this);
		this.class.cache.mixins.forEach(mixin => {
			mixin.disconnect(this);

			const mixinKey = Symbol.for(`@wayang/mixin/state/${ mixin.id }`);
			this[mixinKey] = null;
			delete this[mixinKey];
		});
	}
}

export default WebComponent;
