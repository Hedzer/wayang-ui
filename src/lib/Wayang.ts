
import router from 'pubsub-router-global';
import { CONVERTERS, ELEMENT_CACHE, DEFAULT_SHADOWMODE } from './Constants';
import CacheItem from './CacheItem';
import SenderHandle from 'pubsub-router/dist/lib/SenderHandle';
import Converters from './Converters';
import Presenter from './Presenter';
import Response from 'pubsub-router/dist/lib/Response';
import Request from 'pubsub-router/dist/lib/Request';
import EmitMethod from './EmitMethod';

abstract class Wayang extends HTMLElement {
	private _root: ShadowRoot;
	private _handles = new Map<string, SenderHandle>();
	private _presenter: typeof Presenter | Presenter | null = null;
	private _class: typeof Wayang;

	constructor() {
		super();
		this._class = (<any>this).constructor;
		const cache = ELEMENT_CACHE[this._class.tag];
		this._root = this.attachShadow(this._class.mode);
		this._root.appendChild(cache.template.content.cloneNode(true));
		this.receive(EmitMethod.POST, `@wayang/styles/${ this._class.tag }`, res => this.setStyle(res.data));
	}

	// static members 
	public static get tag(): string {
		throw new Error(
			'static tag: string, must be redefined.\n\
			String must be a valid custom element tag.'
		);
	}

	public static get html(): string {
		throw new Error(
			'static html: string, must be redefined.'
		);
	}

	public static get css(): string {
		throw new Error(
			'static css: string, must be redefined.'
		);
	}

	public static get mode(): ShadowRootInit {
		return DEFAULT_SHADOWMODE;
	}

	public static get observed(): Map<string, keyof Converters | typeof Converters> {
		throw new Error(
			'static observed: Map<string, keyof Converters>, must be redefined.'
		);
	}

	public static get converters(): Converters {
		return CONVERTERS;
	}

	// required shadow element members
	public static get observedAttributes(): string[] { 
		return ELEMENT_CACHE[this.tag].observedAttributes;
	}

	connectedCallback() {
		this.dispatch('connected', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/connected/${ this._class.tag }`, this);
	}

	adoptedCallback() {
		this.dispatch('adopted', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/disconnected/${ this._class.tag }`, this);
	}

	disconnectedCallback() {
		this.dispatch('disconnected', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/disconnected/${ this._class.tag }`, this);
		this.destructor();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) { return; }

		const converter = (CONVERTERS[this._class.observed[name]] || CONVERTERS.string);
		this[name] = converter(newValue);
	}

	// element instance properties
	public get disabled(): boolean {
		return this.hasAttribute('disabled');
	}
	public set disabled(v: boolean) {
		v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
	}

	public get hidden(): boolean {
		return this.hasAttribute('hidden');
	}
	public set hidden(v: boolean) {
		v ? this.setAttribute('hidden', '') : this.removeAttribute('hidden');
	}

	public get presenter(): string {
		return this.getAttribute('presenter') || '';
	}
	public set presenter(v: string) {
		v ? this.setAttribute('presenter', v) : this.removeAttribute('presenter');
		this.removeOldPresenter();
		this.setNewPresenter(v);
	}

	//element instance methods
	public broadcast(method: EmitMethod, eventName: string|string[], data: any) {
		if (Array.isArray(eventName)) {
			eventName.forEach((event)=> { this.broadcast(method, event, data); });
			return;
		}

		if (!this._handles.has(eventName)) {
			this._handles.set(eventName, router.send[method](eventName));
		}
		(<SenderHandle>this._handles.get(eventName)).request(data);
	}
	public receive(method: EmitMethod, eventName: string|string[], listener: (res: Response) => void | Request) {
		if (Array.isArray(eventName)) {
			eventName.forEach((event)=> { this.receive(method, event, listener); });
			return;
		}

		if (!this._handles.has(eventName)) {
			this._handles.set(eventName, router.send[method](eventName));
		}
		(<SenderHandle>this._handles.get(eventName)).receive(listener);
	}

	public dispatch<T>(eventName: string, data: T) {
		this.dispatchEvent(new CustomEvent<T>(eventName, new CustomEvent<T>(eventName, { detail: data })));
	}
	public listen(eventName: string, listener: EventListenerOrEventListenerObject) {
		this.addEventListener(eventName, listener);
	}

	public select(selector: string): Element | null {
		return this._root.querySelector(selector);
	}

	public setStyle(style: HTMLStyleElement) {
		const existing = this.select(`#${style.id}`);
		this._root.append(style);
		if (existing) { this._root.removeChild(existing); }
	}

	// private instance methods
	private removeOldPresenter() {
		if (!this._presenter) { return; }

		const presenter = this._presenter;
		const key = `@wayang/presenters/${ presenter.name }`;
		const handle = this._handles.get(key);
		if (handle) {
			handle.remove();
			this._handles.delete(key);
		}
	}
	private setNewPresenter(name: string) {
		const key = `@wayang/presenters/${ name }`;
		this.receive(EmitMethod.POST, key, (res) => {
			const Presenter = <{ new() : Presenter }>res.data;
			const presenter = new Presenter();
			this._presenter = presenter;
			presenter.connect(this);
		});
	}

	// special members
	destructor() {
		for (const name in this._handles.values()) {
			(<SenderHandle>this._handles.get(name)).remove();
		}

		if (this._presenter) { (<Presenter>this._presenter).disconnect(); }
	}

	public static register() {
		const tag = this.tag;
		if (ELEMENT_CACHE.has(tag)) { return; }

		// template
		const template = document.createElement('template');
		template.innerHTML = this.html;

		// styles
		const styles = document.createElement('style');
		styles.type = 'text/css';
		styles.appendChild(document.createTextNode(this.css));

		// observed props
		const properties = [ ...this.observed.keys() ];
		properties.push('disabled', 'hidden', 'presenter');
		
		const cache = new CacheItem(
			tag,
			template,
			styles,
			this,
			this.converters,
			properties,
			this.observed
		);

		ELEMENT_CACHE.set(tag, cache);
		customElements.define(tag, this);
		const handle = router
			.send
			.post(`@wayang/element/registered/${ this.tag }`, this);
		setTimeout(() => { handle.remove(); }, 1000);
	}
}

export default Wayang;
