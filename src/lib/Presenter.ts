import router from 'pubsub-router-global';
import Wayang from './Wayang';

const cache = new Map<string, typeof Presenter>();

abstract class Presenter {
	public static id: string; // can't use name :/
	public get router() { return router; }
	public abstract connect(element: Wayang);
	public abstract disconnect();
	public static register() {
		const id = this.id;
		if (!id) { throw new Error('No id was defined for this presenter'); }

		if (cache.has(id)) { throw new Error(`The presenter id ${ id } has already been registered`); }
		
		router
			.receive
			.post(`@wayang/presenters/${ id }`)
			.respond(req => this)
			.broadcast(this);
	}
}

export default Presenter;
