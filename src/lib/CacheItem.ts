import WebComponent from './WebComponent';
import Mixin from './Mixin';

class CacheItem {
	constructor(
		tag: string,
		template: HTMLTemplateElement,
		styles: HTMLTemplateElement,
		component: typeof WebComponent,
		converters: Map<string, (value: string) => any>,
		properties: Map<string, string>,
		observed: string[]
	) {
		this.tag = tag;
		this.template = template;
		this.styles = styles;
		this.component = component;
		this.converters = new Map<string, (value: string) => any>(converters);
		this.properties = new Map<string, string>(properties);
		this.observed = observed.slice(0);
	}
	public readonly template: HTMLTemplateElement;
	public readonly styles: HTMLTemplateElement;
	public readonly tag: string;
	public readonly component: typeof WebComponent;
	public readonly converters: Map<string, (value: string) => any>;
	public readonly observed: string[];
	public readonly properties: Map<string, string>;
	public readonly mixins = new Map<string, typeof Mixin>();
}

export default CacheItem;
