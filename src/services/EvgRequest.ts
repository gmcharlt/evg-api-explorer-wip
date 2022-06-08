export class EvgRequest {
    service: string;
    method: string;
    params: any[];
    session?: any;
    static baseUrl = '';

    constructor(service: string, method: string, params: any[]) {
        this.service = service;
        this.method = method;
        this.params = params;
        this.session = new OpenSRF.ClientSession(service);
    }

    static setBaseUrl(url: string) {
        this.baseUrl = url;
    }

    send(): Promise<any> {
        OpenSRF.Session.transport = OSRF_TRANSPORT_TYPE_XHR;
        OSRF_HTTP_TRANSLATOR = EvgRequest.baseUrl + 'osrf-http-translator';

        const responses: any[] = [];
        return new Promise((resolve, reject) => {
            this.session.request({
                async: true,
                method: this.method,
                params: this.params,
                onresponse: (r: any) => {
                    // just slurping up any streamed responses
                    responses.push(r.recv().content());
                },
                oncomplete: () => {
                    return resolve(responses)
                },
                onerror: (err: any) => {
                    return reject(err);
                },
                onmethoderror: (err: any) => {
                    return reject(err);
                }
            }).send();
        });
    }
}
