
import { CONVERTERS, ELEMENT_CACHE, PLUGINS } from './Constants';
import global from 'whenthough';
import CacheItem from './CacheItem';
import Presenter from './Presenter';
import Plugin from './Plugin';
import validate from './Wayang/validate';
import register from './Wayang/register';

const defer = (fn: Function) => setTimeout(fn, 0);

abstract class Wayang extends HTMLElement {
	private _root: ShadowRoot;
	private _presenter: Presenter | null = null;
	private _class: typeof Wayang;

	constructor() {
		super();
		this._class = (<any>this).constructor;
		const cache = <CacheItem>ELEMENT_CACHE.get(this._class['tag']);
		this._root = this.attachShadow(this._class['mode']);
		this._root.appendChild(cache.template.content.cloneNode(true));
		this._root.appendChild(cache.styles.content.cloneNode(true));
		PLUGINS.forEach(plugin => plugin.connect(this));
	}

	// required shadow element members
	public static get observedAttributes(): string[] { 
		return (<CacheItem>ELEMENT_CACHE.get(this['tag'])).observed;
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

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) { return; }

		const converter = (CONVERTERS.get(this._class['observed'].get(name)) || (v => v));
		const _old = this[name];
		const _new = converter(newValue);
		this[name] = _new;
		this.dispatch(`${name}Changed`, { old: _old, new: _new });
	}

	// element instance properties
	public readonly global = global;
	public get root() { return this._root; }

	public get presenter(): string {
		return this.getAttribute('presenter') || '';
	}
	public set presenter(v: string) {
		v ? this.setAttribute('presenter', v) : this.removeAttribute('presenter');
		Presenter.removeFrom(this);
		Presenter.addTo(this, v);
	}

	public dispatch<T>(eventName: string, data: T): boolean {
		return this.dispatchEvent(new CustomEvent<T>(eventName, new CustomEvent<T>(eventName, { detail: data })));
	}
	public listen(eventName: string, listener: EventListenerOrEventListenerObject): this {
		this.addEventListener(eventName, listener);
		return this;
	}
	public unlisten(eventName: string, listener: EventListenerOrEventListenerObject): this {
		this.removeEventListener(eventName, listener);
		return this;
	}

	public select(selector: string): NodeList | null {
		return this._root.querySelectorAll(selector);
	}
	public part(partName: string): Element | null {
		return this._root.querySelector(`[part='${partName}']`);
	}

	// special members
	public static plugins: Map<string, Plugin> = new Map<string, Plugin>();
	public static register() {
		validate(this);
		register(this);
	}
	public destructor() {
		Presenter.removeFrom(this);
		PLUGINS.forEach(plugin => plugin.disconnect(this));
	}
}

export default Wayang;
