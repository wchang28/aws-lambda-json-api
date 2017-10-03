"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var emul = require("express-json-api-routing-emulation");
var aws_lambda_helper_1 = require("aws-lambda-helper");
var qs = require("qs");
function lambdaFactory(router, appParams) {
    return aws_lambda_helper_1.factory(function (event, context) {
        return new emul.ExpressJSONApiRoutingEmulation(router, appParams).route(event, context);
    });
}
exports.lambdaFactory = lambdaFactory;
var JSONApiRouteImpl = /** @class */ (function () {
    function JSONApiRouteImpl(rootApi, parentBaseUrl, mountPath) {
        this.rootApi = rootApi;
        this.parentBaseUrl = parentBaseUrl;
        this.mountPath = mountPath;
    }
    Object.defineProperty(JSONApiRouteImpl.prototype, "RootApi", {
        get: function () { return this.rootApi; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JSONApiRouteImpl.prototype, "BaseUrl", {
        get: function () {
            var s = this.parentBaseUrl + this.mountPath;
            if (s.length >= 1 && s.substr(s.length - 1, 1) === "/")
                s = s.substr(0, s.length - 1); // remove the last "/"
            return s;
        },
        enumerable: true,
        configurable: true
    });
    JSONApiRouteImpl.prototype.$J = function (method, pathname, data, headers) {
        return this.RootApi.$J(method, this.BaseUrl + pathname, data, headers);
    };
    JSONApiRouteImpl.prototype.mount = function (mountPath) { return new JSONApiRouteImpl(this.RootApi, this.BaseUrl, mountPath); };
    return JSONApiRouteImpl;
}());
var AWSLambdaJSONApi = /** @class */ (function () {
    function AWSLambdaJSONApi(FunctionName, ClientContext) {
        this.FunctionName = FunctionName;
        this.ClientContext = ClientContext;
        this.invoker = new aws_lambda_helper_1.AWSLambdaInvoker();
    }
    AWSLambdaJSONApi.prototype.call = function (options) {
        return this.invoker.invoke(this.FunctionName, options, this.ClientContext);
    };
    AWSLambdaJSONApi.prototype.$J = function (method, pathname, data, headers) {
        var path = pathname;
        var body;
        if (method === "GET") {
            var queryString = qs.stringify(data);
            if (queryString)
                path += "?" + queryString;
        }
        else
            body = data;
        return this.call({ method: method, path: path, headers: headers, body: body });
    };
    Object.defineProperty(AWSLambdaJSONApi.prototype, "RootApi", {
        get: function () { return this; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AWSLambdaJSONApi.prototype, "BaseUrl", {
        get: function () { return ""; },
        enumerable: true,
        configurable: true
    });
    AWSLambdaJSONApi.prototype.mount = function (mountPath) { return new JSONApiRouteImpl(this.RootApi, this.BaseUrl, mountPath); };
    return AWSLambdaJSONApi;
}());
exports.AWSLambdaJSONApi = AWSLambdaJSONApi;
//# sourceMappingURL=index.js.map