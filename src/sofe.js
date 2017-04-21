import { normalize, locate, fetch, isOverride, setMiddleWare } from './hooks.js';
import { getManifest as _getManifest, getAllManifests as _getAllManifests } from './manifest.js';

export function getAllManifests() {
	return _getAllManifests(System.sofe || {});
}

export function applyMiddleware(...middleware) {
	let chain = middleware.map(middleware => middleware());
	setMiddleWare(chain);
}

export { locate, fetch, isOverride };

export { getServiceName } from './utils.js';

export function getManifest(url) {
	if (typeof url !== 'string') {
		throw new Error(`sofe getManifest API must be called with a url string`);
	}

	return new Promise((resolve, reject) => {
		// Ensure that the manifest for this url has been retrieved
		_getManifest({manifestUrl: url})
		.then(() => {
			/* We don't want the merged combination of all of the chained manifests,
			 * which is what _getManifest returns. Instead, we want *just* the manifest
			 * exactly as it is found at the specified url.
			 */
			getAllManifests()
			.then(manifests => {
				resolve(manifests.all[url].manifest)
			})
			.catch(reject);
		})
		.catch(reject);
	});
}

if (typeof localStorage !== 'undefined' && !localStorage.getItem('disable-sofe-override-warning')) {
	let numOverrides = 0;
	for (let i=0; i<localStorage.length; i++) {
		const key = localStorage.key(i);
		const serviceName = key.slice('sofe:'.length);

		if (key.match(/sofe:(\S)+/g)) {
			console.info(`There is a local storage sofe override for the service '${serviceName}' to url '${localStorage.getItem(key)}'`);
			numOverrides++;
		}
	}
	if (numOverrides > 0) {
		console.info(`Run localStorage.setItem('disable-sofe-override-warning', true) to turn off sofe override warnings`);
	}
}

if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('disable-sofe-override-warning')) {
	let numOverrides = 0;
	for (let i=0; i<sessionStorage.length; i++) {
		const key = sessionStorage.key(i);
		const serviceName = key.slice('sofe:'.length);

		if (key.match(/sofe:(\S)+/g)) {
			console.info(`There is a session storage sofe override for the service '${serviceName}' to url '${sessionStorage.getItem(key)}'`);
			numOverrides++;
		}
	}
	if (numOverrides > 0) {
		console.info(`Run sessionStorage.setItem('disable-sofe-override-warning', true) to turn off sofe override warnings`);
	}
}
