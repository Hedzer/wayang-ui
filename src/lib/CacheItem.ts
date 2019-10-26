import Wayang from './Wayang';
import Converters from './Converters';

class CacheItem {
	constructor(
		tag: string,
		template: HTMLTemplateElement,
		styles: HTMLTemplateElement,
		$class: typeof Wayang,
		converters: Converters | typeof Converters,
		observedAttributes: string[],
		properties: Map<string, keyof Converters | typeof Converters>
	) {
		this.tag = tag;
		this.template = template;
		this.styles = styles;
		this["class"] = $class;
		this.converters = converters;
		this.observedAttributes = observedAttributes;
		this.properties = properties;
	}
	public readonly template: HTMLTemplateElement;
	public readonly styles: HTMLTemplateElement;
	public readonly tag: string;
	public readonly class: typeof Wayang;
	public readonly converters: Converters | typeof Converters;
	public readonly observedAttributes: string[];
	public readonly properties: Map<string, keyof Converters | typeof Converters>;
}

export default CacheItem;
