import * as emul from "express-json-api-routing-emulation";
import {lambda as lambdaFactory, AWSLambdaFunction, AWSLambdaInvoker} from "aws-lambda-helper";
import * as express from "express";
import * as qs from "qs";
export {JSONApiRequestOptions, HTTPMethod, RESTReturn, HTTPHeaders} from "express-json-api-routing-emulation";
export {AWSLambdaFunction} from "aws-lambda-helper";

export type JSONApiLambdaFunction = AWSLambdaFunction<emul.JSONApiRequestOptions, any, emul.RESTReturn>;

export function lambda(router: express.Router, appParams?: {[key: string]: any;}) : JSONApiLambdaFunction {
    return lambdaFactory((event: emul.JSONApiRequestOptions, context: any) => {
        return new emul.ExpressJSONApiRoutingEmulation(router, appParams).route(event, context);
    });
}

export interface IJSONApiRoute {
    readonly RootApi: IJSONApiRoute;
    readonly BaseUrl: string;
    $J(method: emul.HTTPMethod, pathname: string, data: any, headers?: emul.HTTPHeaders) : Promise<emul.RESTReturn>;
    mount(mountPath: string): IJSONApiRoute;
} 

class JSONApiRouteImpl implements IJSONApiRoute {
    constructor(private rootApi: IJSONApiRoute, private parentBaseUrl: string,  private mountPath: string) {}
    get RootApi() : IJSONApiRoute {return this.rootApi;}
    get BaseUrl(): string {
        let s = this.parentBaseUrl + this.mountPath;
        if (s.length >= 1 && s.substr(s.length-1, 1) === "/") s = s.substr(0, s.length-1); // remove the last "/"
        return s;
    }
    $J(method: emul.HTTPMethod, pathname: string, data: any, headers?: emul.HTTPHeaders) : Promise<emul.RESTReturn> {
        return this.RootApi.$J(method, this.BaseUrl + pathname, data, headers);
    }
    mount(mountPath: string): IJSONApiRoute {return new JSONApiRouteImpl(this.RootApi, this.BaseUrl, mountPath);}
}

export class AWSLambdaJSONApi implements IJSONApiRoute {
    private invoker: AWSLambdaInvoker;
    constructor(private FunctionName: string, private ClientContext?: any) {
        this.invoker = new AWSLambdaInvoker();
    }
    call(options: emul.JSONApiRequestOptions) : Promise<emul.RESTReturn> {
        return this.invoker.invoke<emul.JSONApiRequestOptions, emul.RESTReturn>(this.FunctionName, options, this.ClientContext);
    }
    $J(method: emul.HTTPMethod, pathname: string, data: any, headers?: emul.HTTPHeaders) : Promise<emul.RESTReturn> {
        let path = pathname;
        let body;
        if (method === "GET") {
            let queryString = qs.stringify(data);
            if (queryString) path += "?" + queryString;
        } else
            body = data;
        return this.call({method, path, headers, body});
    }

    get RootApi() : IJSONApiRoute {return this;}
    get BaseUrl(): string {return "";}
    mount(mountPath: string): IJSONApiRoute {return new JSONApiRouteImpl(this.RootApi, this.BaseUrl, mountPath);}
}