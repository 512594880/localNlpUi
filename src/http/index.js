import Superagent from 'superagent';

let cookie = '';


const _Request = Superagent.Request;
class PromisedRequest extends _Request {
	constructor(method, url) {
		super(method, url);
	}
	end() {
		const self = this;
		return new Promise((resolve, reject) => {
			_Request.prototype.end.call(self, (err ,res) => {
				if (err) {
					err.response = res;
					reject(err);
				} else {
					const body = res.body;
					resolve(body);
				}
			});
		});
	}
	auth(token) {
		this.set('X-Authorization-Token', token);
		return this;
	}
	then(resolve) {
		return this.end().then(resolve);
	}
	static options(url) {
		return new PromisedRequest('OPTIONS', url);
	}
	static get(url, data) {
		let req = new PromisedRequest('GET', url);
		if (data) {
			req = req.send(data);
		}
        return req;
	}
	static post(url, data) {
		let req = new PromisedRequest('POST', url);
		if (data) {
			req = req.send(data);
		}
		return req;
	}
	static put(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('PUT', url);
		if (data) {
			req = req.send(data);
		}
		return req;
	}
	static patch(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		let req = new PromisedRequest('PATCH', url);
		if (data) {
			req = req.send(data);
		}
		return req;
	}
	static delete(url, data) {
		url = url.substr(0, 1) === '/' ? url : '/' + url;
		return new PromisedRequest('DELETE', url);
	}
}
Superagent.Request = PromisedRequest;

export default PromisedRequest;
