import Wayang from './Wayang';
import Plugin from './Plugin';

class CacheItem {
	constructor(
		tag: string,
		template: HTMLTemplateElement,
		styles: HTMLTemplateElement,
		$class: typeof Wayang,
		converters: Map<string, (string) => any>,
		properties: Map<string, string>,
		observed: string[],
	) {
		this.tag = tag;
		this.template = template;
		this.styles = styles;
		this["class"] = $class;
		this.converters = converters;
		this.properties = properties;
		this.observed = observed;
	}
	public readonly template: HTMLTemplateElement;
	public readonly styles: HTMLTemplateElement;
	public readonly tag: string;
	public readonly class: typeof Wayang;
	public readonly converters: Map<string, (string) => any>;
	public readonly observed: string[];
	public readonly properties: Map<string, string>;
	public readonly plugins: Map<string, Plugin> = new Map<string, Plugin>();
}

export default CacheItem;
