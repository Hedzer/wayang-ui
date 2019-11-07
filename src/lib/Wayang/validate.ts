
import Wayang from '../Wayang';
import { CONVERTERS, DEFAULT_SHADOWMODE } from '../Constants';

function validate(element: typeof Wayang) {
	if (!element.hasOwnProperty('tag')) {
		throw new Error(
			'static tag: string, must be redefined.\n\
			String must be a valid custom element tag.'
		);
	}

	if (!element.hasOwnProperty('html')) {
		throw new Error(
			'static html: string, must be redefined.'
		);
	}

	if (!element.hasOwnProperty('css')) {
		throw new Error(
			'static css: string, must be redefined.'
		);
	}

	if (!element.hasOwnProperty('mode')) {
		Object.defineProperty(element, 'mode', {
			value: DEFAULT_SHADOWMODE,
			writable: true
		});
	}

	if (!element.hasOwnProperty('observed')) {
		throw new Error(
			'static observed: Map<string, keyof Converters>, must be redefined.'
		);
	}

	if (!element.hasOwnProperty('converters')) {
		Object.defineProperty(element, 'converters', {
			value: new Map<string, (string) => any>(CONVERTERS),
			writable: true
		});
	}
}

export default validate;
