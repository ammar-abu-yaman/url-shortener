import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";

export interface UrlShortenerLambdaGroupProps {}

export class UrlShortenerLambdaGroup extends Construct {

    public static readonly LAMBDA_STACK_SIZE = 2048;

    public readonly urlResolverLambda: Function;

    public readonly urlShortenerLambda: Function;


    public constructor(scope: Construct, id: string, private props?: UrlShortenerLambdaGroupProps) {
        super(scope, id);

        this.urlShortenerLambda = new Function(this, 'url-shortener-lambda', {
            code: Code.fromInline(""),
            functionName: "UrlShortenerLambda",
            handler: "org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest",
            memorySize: UrlShortenerLambdaGroup.LAMBDA_STACK_SIZE,
            runtime: Runtime.JAVA_17,
            timeout: Duration.seconds(10),
            environment: {},
        });

        this.urlResolverLambda = new Function(this, 'url-resolver-lambda', {
            code: Code.fromInline(""),
            functionName: "UrlResolverLambda",
            handler: "org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest",
            memorySize: UrlShortenerLambdaGroup.LAMBDA_STACK_SIZE,
            runtime: Runtime.JAVA_17,
            timeout: Duration.seconds(10),
            environment: {},
        });
    }

}