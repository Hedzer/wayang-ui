import Global from 'nexie';
import WebComponent from './WebComponent';
import { PRESENTERS } from './Constants';

const instanceKey = Symbol.for(`@wayang/presenter/instance`);

abstract class Presenter {
	public static id: string; // can't use name :/
	public readonly global = Global;
	public abstract connect(component: WebComponent): void;
	public abstract disconnect(component: WebComponent): void;
	public static register() {
		// basic validation
		if (!this.id) {
			throw new Error('No id was defined for this presenter');
		}
		if (PRESENTERS.has(this.id)) {
			throw new Error(
				`The presenter id ${this.id} has already been registered`
			);
		}

		// registration
		PRESENTERS.set(this.id, this);
		Global.set(Symbol.for(`@wayang/presenters/${this.id}`), this);
	}
	public static new() {
		return new (this as any)();
	}
	public static addTo(component: WebComponent, id: string): void {
		Global.request<typeof Presenter>(
			Symbol.for(`@wayang/presenters/${id}`)
		).then(presenter => {
			if (component[instanceKey]) {
				return;
			}

			component[instanceKey] = presenter.new();
			component[instanceKey].connect(component);
		});
	}
	public static removeFrom(component: WebComponent) {
		if (!component[instanceKey]) {
			return;
		}

		component[instanceKey].disconnect(component);
		component[instanceKey] = null;
	}
}

export default Presenter;
