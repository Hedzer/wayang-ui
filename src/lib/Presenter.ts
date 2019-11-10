
import global from 'whenthough';
import WebComponent from './WebComponent';
import { PRESENTERS } from './Constants';

const instanceKey = Symbol.for(`@wayang/presenter/instance`);

abstract class Presenter {
	public static id: string; // can't use name :/
	public readonly global = global;
	public abstract connect(component: WebComponent);
	public abstract disconnect(component: WebComponent);
	public static register() {

		// basic validation
		if (!this.id) { throw new Error('No id was defined for this presenter'); }
		if (PRESENTERS.has(this.id)) { throw new Error(`The presenter id ${ this.id } has already been registered`); }
		
		// registration
		PRESENTERS.set(this.id, this);
		global.set(Symbol.for(`@wayang/presenters/${ this.id }`), this);
	}
	public static new() {
		return new (<any>this)();
	}
	public static addTo(component: WebComponent, id: string) {
		global
			.request(Symbol.for(`@wayang/presenters/${ id }`))
			.then(presenter  => {
				if (component[instanceKey]) { return; }

				component[instanceKey] = presenter.new();
				component[instanceKey].connect(component);
			});
	}
	public static removeFrom(component: WebComponent) {
		if (!component[instanceKey]) { return; }

		component[instanceKey].disconnect(component);
		component[instanceKey] = null;
	}
}

export default Presenter;
