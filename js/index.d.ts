/// <reference types="express" />
import * as emul from "express-json-api-routing-emulation";
import { AWSLambdaFunction } from "aws-lambda-helper";
import * as express from "express";
export { JSONApiRequestOptions, HTTPMethod, RESTReturn, HTTPHeaders } from "express-json-api-routing-emulation";
export { AWSLambdaFunction } from "aws-lambda-helper";
export declare type JSONApiLambdaFunction = AWSLambdaFunction<emul.JSONApiRequestOptions, any, emul.RESTReturn>;
export declare function lambdaFactory(router: express.Router, appParams?: {
    [key: string]: any;
}): JSONApiLambdaFunction;
export interface IJSONApiRoute {
    readonly RootApi: IJSONApiRoute;
    readonly BaseUrl: string;
    $J(method: emul.HTTPMethod, pathname: string, data: any, headers?: emul.HTTPHeaders): Promise<emul.RESTReturn>;
    mount(mountPath: string): IJSONApiRoute;
}
export declare class AWSLambdaJSONApi implements IJSONApiRoute {
    private FunctionName;
    private ClientContext;
    private invoker;
    constructor(FunctionName: string, ClientContext?: any);
    call(options: emul.JSONApiRequestOptions): Promise<emul.RESTReturn>;
    $J(method: emul.HTTPMethod, pathname: string, data: any, headers?: emul.HTTPHeaders): Promise<emul.RESTReturn>;
    readonly RootApi: IJSONApiRoute;
    readonly BaseUrl: string;
    mount(mountPath: string): IJSONApiRoute;
}
