
## Wayang UI

### What is it?
`wayang-ui` is a small, simple scaffolding for building web components. It comes with three exports; the `WebComponent` class for building visual elements, the `Presenter` class used to attach behaviors, and the `Mixin` class for extending elements. It's built using TypeScript, with minimal dependencies, so minified + gzipped it's about 3kb.

### Installation
```
npm install --save wayang-ui
```

### Creating An Element
```javascript
import { WebComponent } from 'wayang-ui';

class WayButton extends WebComponent {

	// required properties
	static tag = 'way-button'; 
	static html = '<button></button>';
	static css = 'button { background: red; width:100px; height:100px; }';
	static observed = new Map([
		[ 'counter', 'number' ] // binds element attribute and converts type
	]);
	
	// user defined property, "counter"
	private counter: number = 0;
	public get counter(): number {
		return this.getAttribute('counter');
	}
	public set counter(count: number) {
		this.setAttribute('counter', count);
		console.log(`Counter was set to ${ count }`)
	}
}

// registers the html tag <way-button>
WayButton.register();

```
To use this element:
```html
<way-button counter="7"></way-button>
```
The above would produce a 100px X 100px red button and print **"Counter was set to 7"** in the console.

### Creating A Presenter
```javascript
import { Presenter } from 'wayang-ui';

class CounterPresenter extends Presenter {
	
	public static id = 'counter-presenter';

	connect(component: WebComponent) {
		component.listen('click', this.onClick);
	}
	disconnect(component: WebComponent) {
		component.unlisten('click', this.onClick);
	}
	onClick() {
		this.counter = this.counter || 0;
		this.counter += 1;
		console.log(`Clicked ${ this.counter } times`);
	}
}

// registers the presenter so it can be used with any component
CounterPresenter.register();

```

### Putting A WebComponent And Presenter Together
```html
<way-button presenter="counter-presenter"> </way-button>
```
The above html would result in the following:
1) The `WayButton` class is instantiated.
2) The `presenter` attribute triggers a request for the `counter-presenter` presenter.
3) An instance of `CounterPresenter` is created.
4) `CounterPresenter.connect()` is called with the instance of `WayButton` as it's parameter.


  If the button is clicked, `CounterPresenter.onClick()` will be called, incrementing the `counter` property on the `WayButton`. The change will trigger two console outputs, one from the element, and one from the presenter.

### Creating A Mixin
```javascript
import { Mixin, WebComponent } from 'wayang-ui';

class GreenButton extends Mixin {
	public static id = 'green-button-mixin';

	// these happen at runtime
	public static connect(component: WebComponent) {
		// connect to the element at runtime
	}
	public static disconnect(component: WebComponent) {
		// disconnect, undo runtime changes
	}

	// these happen once, on script execution
	public static html(html: HTMLTemplateElement): void {
		// add a new button
		html.innerHTML += `<button green-button></button>`;
	};
	public static css(css: HTMLTemplateElement): void {
		// make the button green
		css.innerHTML += `<style id="green-button-mixin-css">[green-button] { background: green; }</style>`;
	};
	public static properties(properties: Map<string, string>): void {
		// define conversion mapping for properties
		properties.set('green-button-text', 'string');
	};
	public static observed(observed: string[]): void {
		// let the component know to watch for change
		observed.push('green-button-text');
	};
	public static converters(converters: Map<string, (value: string) => any>): void {
		// no additional types are required
	};
}

```
### Attaching a Mixin to a Web Component
```javascript
class WayButton extends WebComponent {
	// other required properties
	public static mixins = [ GreenButton ]; // from the example above
}
```

### WebComponent Class Members
**note:** Members with an asterisk (*) must be defined by developer creating the component.

| Member | Description |
| ------ | ------ |
| *tag | `public static tag: string`. The element name. Defining this field is required. Must follow web component naming conventions. i.e. must have a dashed name like `way-button`. |
| *html | `public static html: string`. The inner HTML of the web component. Defining this field is required. |
| *css | `public static css: string | string[]`. The styles associated with this web components. These become `<style>` elements inside the shadow root. Defining this field is required, does not require a value. |
| *observed | `public static observed: Map<string, string>`. The `observed` field is used to map attributes on the element to properties in the class. The key portion of the map is the property name, the string value is a key of the `Converters` class. The following is a list of possible converter keys:  `string`, `integer`, `float`, `number`, `json`, `boolean`, `date`, `ticks`, `exists`. If a property is not mapped through the `observed` field, it will not respond to change in the DOM. Additionally, when a property is changed, an event by the name of `${propertyName}Changed` is fired, which passes the current and previous values for that property.|
| converters | `public static converters: Map<string, (value: string) => any>;`. A list of conversion methods, the names of which, can be used as values in the `observed` map. These methods convert the string set in a component's attribute to another type before handing it to the class property. This member can be optionally overriden to add new conversion types for a specific element. Defaults are the converter keys mentioned in `observed`. |
| mode | `public static mode: ShadowRootInit`. The shadow mode for this web component's shadow root. This is an optional override. Defaults to `{ mode: 'open' }`. |
| mixins | `public static mixins = new Array<typeof Mixin>()`. A list of mixins to apply to this web component. |
| presenter | `public get/set presenter: string` is an element attribute & class property. When this is set to a presenter id, that presenter is attached to the element. If this value is changed, the presenter is disconnected. A presenter should be able to be swapped out at any moment. |
| listen | `public listen(eventName: string, listener: Function): this`. A method used for adding event listeners to this element. |
| unlisten | `public unlisten(eventName: string, listener: Function): this`. A method used for removing event listeners from the element. |
| dispatch | `public dispatch<T>(eventName: string, data: T): boolean`. Dispatches, or emits an event with provided data. |
| select | `public select(selector: string): Element[]`. Equivalent to `this.root.querySelectorAll(selector)`. This is a useful shorthand for selecting elements within the shadow root. |
| global | `public readonly global: WhenThough`. Shorthand access to the global instance of `whenthough` library, used for resolving modules at runtime. |
| root | `public get root: ShadowRoot`. The shadow root of this web component. |
| register | `public static register()`. Registers the element. This should be called after the definition of the element. This is a required side-effect, unfortunately. |
| destructor | `public destructor()`. Called when an element is removed from the DOM. This is a special cleanup method used for removing references that might cause memory leaks. |


### Presenter Class Members
**note:** Members with an asterisk (*) must be defined by developer creating the presenter.

| Member | Description |
| ------ | ------ |
| *id | `public static id: string`. The id of the presenter. When a WebComponent element has it's presenter attribute set, this is the id that will be used to match it for instantiation and connection. An id must be globally unique. |
| *connect | `public abstract connect(component: WebComponent)` Connects a presenter instance to a web component instance. This occurrs when the presenter attribute is set. |
| *disconnect | `public abstract disconnect(component: WebComponent)` Disconnects a presenter instance from a web component instance. Ideally, undoing what was done in the connect method. |
| global | `public readonly global: WhenThough`. Shorthand access to the global instance of `whenthough` library, used for resolving modules at runtime. |
| register | `public static register()` Registers the presenter. This should be called after the definition of the presenter class. This is a required side-effect. |

### Mixin Class Members
**note:** Members with an asterisk (*) must be defined by developer creating the mixin.

| Member | Description |
| ------ | ------ |
| *id | `public static id: string`. The id of the mixin. An id must be globally unique. |
| *connect | `public static connect(component: WebComponent)`. Connects the mixin to the web component. When the constructor of a `WebComponent` instance is called, any mixins added to that element will also call this method with the instance as it's parameter. |
| *disconnect | `public static disconnect(component: WebComponent)`. Cleans up changes applied to a `WebComponent` instance using the connect method. |
| *html | `public static html(html: HTMLTemplateElement): void`. Used to modify the existing template from which the attached web component clones it's DOM from. |
| *css | `public static css(css: HTMLTemplateElement): void`. Used to modify the template containing the stylesheets that the attached web component clones.  |
| *properties | `public static properties(properties: Map<string, string>): void`. Used to modify the mapping between properties and conversions. The key is the property name, the value is the name of a conversion function. |
| *observed | `public static observed(observed: string[]): void`. Used to modify which attributes are watched by the targeted web component. |
| *converters | `public static converters(converters: Map<string, (value: string) => any>): void`. The converters that can be used by the `properties` mapping. These convert the strings passed in from the element's attribute into a more appropriate type. |
| register | `public static register()`. Registers the mixin. This should be called after the definition of the mixin class. This is a required side-effect.  |
| stateOf | `public static stateOf(component: WebComponent)`. A method that attaches and gets a mixin specific state object from an element. This can be used to store state relating to the mixin, but specific to a web component instance on the instance itself. |
| attach | `public static attach(component: typeof WebComponent)`. Attaches a mixin to a web component prototype. This method does not need to be used, it is called during a web components regitration on all the mixins declared in the `WebComponent.mixins` property. |

### Cleaner Component Example
```javascript
import { WebComponent } from 'wayang-ui';
import html from './button.html'
import css from './button.css';
import observed from './button.json';

class WayButton extends WebComponent {
	static tag = 'way-button'; 
	static html = html;
	static css = css;
	static observed = new Map<string, string>(observed);

	// user defined members
}

WayButton.register();
```
This example works by using various scripts, declarations and build tools that enable static content to be imported like code. You can find the necessary code in `wayang-element-template` project on my github. The important parts are the `rollup.config.js` in the root, the declarations in `src/declarations` and the build / copy scripts in `package.json`.

