
import router from 'pubsub-router-global';
import { CONVERTERS, ELEMENT_CACHE, DEFAULT_SHADOWMODE } from './Constants';
import CacheItem from './CacheItem';
import SenderHandle from 'pubsub-router/dist/lib/SenderHandle';
import Converters from './Converters';
import Presenter from './Presenter';
import Response from 'pubsub-router/dist/lib/Response';
import Request from 'pubsub-router/dist/lib/Request';
import EmitMethod from './EmitMethod';
import { throws } from 'assert';

abstract class Wayang extends HTMLElement {
	private _root: ShadowRoot;
	private _handles = new Map<string, SenderHandle>();
	private _presenter: Presenter | null = null;
	private _presenter_id: string = '';
	private _class: typeof Wayang;

	constructor() {
		super();
		this._class = (<any>this).constructor;
		const cache = <CacheItem>ELEMENT_CACHE.get(this._class['tag']);
		this._root = this.attachShadow(this._class['mode']);
		this._root.appendChild(cache.template.content.cloneNode(true));
		this._root.appendChild(cache.styles.content.cloneNode(true));
	}

	// required shadow element members
	public static get observedAttributes(): string[] { 
		return (<CacheItem>ELEMENT_CACHE.get(this['tag'])).observedAttributes;
	}

	connectedCallback() {
		this.dispatch('connected', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/connected/${ this._class['tag'] }`, this);
	}

	adoptedCallback() {
		this.dispatch('adopted', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/disconnected/${ this._class['tag'] }`, this);
	}

	disconnectedCallback() {
		this.dispatch('disconnected', this);
		this.broadcast(EmitMethod.POST, `@wayang/element/disconnected/${ this._class['tag'] }`, this);
		this.destructor();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) { return; }

		const converter = (CONVERTERS[this._class['observed'][name]] || CONVERTERS.string);
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
			this._handles.set(eventName, router.send[method.toLocaleLowerCase()](eventName));
		}
		(<SenderHandle>this._handles.get(eventName)).request(data);
	}
	public receive(method: EmitMethod, eventName: string|string[], listener: (res: Response) => void | Request) {
		if (Array.isArray(eventName)) {
			eventName.forEach((event)=> { this.receive(method, event, listener); });
			return;
		}

		if (!this._handles.has(eventName)) {
			this._handles.set(eventName, router.send[method.toLocaleLowerCase()](eventName));
		}
		(<SenderHandle>this._handles.get(eventName)).receive(listener);
	}

	public dispatch<T>(eventName: string, data: T): boolean {
		return this.dispatchEvent(new CustomEvent<T>(eventName, new CustomEvent<T>(eventName, { detail: data })));
	}
	public listen(eventName: string, listener: EventListenerOrEventListenerObject): void {
		this.addEventListener(eventName, listener);
	}
	public unlisten(eventName: string, listener: EventListenerOrEventListenerObject): void {
		this.removeEventListener(eventName, listener);
	}

	public select(selector: string): NodeList | null {
		return this._root.querySelectorAll(selector);
	}
	public part(partName: string): Element | null {
		return this._root.querySelector(`[part='${partName}']`);
	} 

	// private instance methods
	private removeOldPresenter() {
		if (!this._presenter) { return; }

		const presenter = this._presenter;
		const key = `@wayang/presenters/${ this._presenter_id }`;
		const handle = this._handles.get(key);
		if (handle) {
			handle.remove();
			this._handles.delete(key);
		}
		presenter.disconnect();
		this._presenter = null;
	}
	private setNewPresenter(id: string) {
		const key = `@wayang/presenters/${ id }`;
		this.receive(EmitMethod.POST, key, (res) => {
			const Presenter = <{ new() : Presenter }>res.data;
			const presenter = new Presenter();
			this._presenter = presenter;
			this._presenter_id = id;
			presenter.connect(this);
		});
		this.broadcast(EmitMethod.POST, key, this);
	}

	// special members
	destructor() {
		for (const name in this._handles.values()) {
			(<SenderHandle>this._handles.get(name)).remove();
		}

		if (this._presenter) { (<Presenter>this._presenter).disconnect(); }
	}

	public static register() {

		// we have to do it this way, because TS can't overwrite static properties
		if (!this.hasOwnProperty('tag')) {
			throw new Error(
				'static tag: string, must be redefined.\n\
				String must be a valid custom element tag.'
			);
		}

		if (!this.hasOwnProperty('html')) {
			throw new Error(
				'static html: string, must be redefined.'
			);			
		}

		if (!this.hasOwnProperty('css')) {
			throw new Error(
				'static css: string, must be redefined.'
			);
		}

		if (!this.hasOwnProperty('mode')) {
			Object.defineProperty(this, 'mode', {
				value: DEFAULT_SHADOWMODE,
				writable: true
			});
		}

		if (!this.hasOwnProperty('observed')) {
			throw new Error(
				'static observed: Map<string, keyof Converters>, must be redefined.'
			);
		}

		if (!this.hasOwnProperty('converters')) {
			Object.defineProperty(this, 'converters', {
				value: CONVERTERS,
				writable: true
			});
		}

		const tag = this['tag'];
		if (ELEMENT_CACHE.has(tag)) { return; }

		// template
		const template = document.createElement('template');
		template.innerHTML = this['html'];

		// styles
		const styles = document.createElement('template');
		let css = this['css'];
		if (typeof css === 'string') { css = [css]; }
		if (Array.isArray(css)) {
			styles.innerHTML = css
				.map(s => `<style type="text/css">\n${ s }\n</style>`)
				.join('\n');
		}

		// observed props
		const properties = [ ...this['observed'].keys() ];
		properties.push('disabled', 'hidden', 'presenter');
		
		const cache = new CacheItem(
			tag,
			template,
			styles,
			this,
			this['converters'],
			properties,
			this['observed']
		);

		ELEMENT_CACHE.set(tag, cache);
		customElements.define(tag, this);
		const handle = router
			.send
			.post(`@wayang/element/registered/${ tag }`, this);
		setTimeout(() => { handle.remove(); }, 1000);
	}
}

export default Wayang;
