
import global from 'whenthough';
import Wayang from './Wayang';
import { PRESENTERS } from './Constants';

const instanceKey = Symbol.for(`@wayang/presenter/instance`);

abstract class Presenter {
	public static id: string; // can't use name :/
	public readonly global = global;
	public abstract connect(element: Wayang);
	public abstract disconnect(element: Wayang);
	public static register() {
		const id = this.id;
		if (!id) { throw new Error('No id was defined for this presenter'); }

		if (PRESENTERS.has(id)) { throw new Error(`The presenter id ${ id } has already been registered`); }
		
		PRESENTERS.set(id, this);
		global.set(Symbol.for(`@wayang/presenters/${ id }`), this);
	}
	public static new() {
		return new (<any>this)();
	}
	public static addTo(element: Wayang, id: string) {
		global
			.request(Symbol.for(`@wayang/presenters/${ id }`))
			.then(presenter  => {
				if (element[instanceKey]) { return; }

				element[instanceKey] = presenter.new();
				element[instanceKey].connect(element);
			});
	}
	public static removeFrom(element: Wayang) {
		if (!element[instanceKey]) { return; }

		element[instanceKey].disconnect(element);
		element[instanceKey] = null;
	}
}

export default Presenter;
