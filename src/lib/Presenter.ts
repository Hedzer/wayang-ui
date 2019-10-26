import router from 'pubsub-router-global';
import Wayang from './Wayang';

abstract class Presenter {
	public abstract name: string;
	public get router() { return router; }
	public abstract connect(element: typeof Wayang | Wayang);
	public abstract disconnect();
}

export default Presenter;
