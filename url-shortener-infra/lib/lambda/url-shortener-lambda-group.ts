import {Construct} from "constructs";
import {BundlingOutput, Duration} from "aws-cdk-lib";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";

export interface UrlShortenerLambdaGroupProps {}

export class UrlShortenerLambdaGroup extends Construct {

    public static readonly LAMBDA_STACK_SIZE = 2048;

    public static readonly CODE_VERSION = "0.0.1";

    public readonly urlResolverLambda: Function;

    public readonly urlShortenerLambda: Function;


    public constructor(scope: Construct, id: string, private props?: UrlShortenerLambdaGroupProps) {
        super(scope, id);

        const apiCode = Code.fromAsset("../url-shortener-service/", {
            bundling: {
                image: Runtime.JAVA_17.bundlingImage,
                command: [
                    "/bin/sh",
                    "-c",
                    "./gradlew shadowJar ",
                    `&& cp /asset-input/build/libs/url-shortener-service-${UrlShortenerLambdaGroup.CODE_VERSION}-aws.jar /asset-output/lambda.jar `,
                ],
                user: "root",
                outputType: BundlingOutput.ARCHIVED,
            }
        });
        this.urlShortenerLambda = new Function(this, 'url-shortener-lambda', {
            code: apiCode,
            functionName: "UrlShortenerLambda",
            handler: "org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest",
            memorySize: UrlShortenerLambdaGroup.LAMBDA_STACK_SIZE,
            runtime: Runtime.JAVA_17,
            timeout: Duration.seconds(10),
            environment: {
                FUNCTION_NAME: "UrlShortenerHandler",
                MAIN_CLASS: "com.ammarymn.urlshortenerservice.UrlShortenerServiceApplication",
            }
        });

        this.urlResolverLambda = new Function(this, 'url-resolver-lambda', {
            code: apiCode,
            functionName: "UrlResolverLambda",
            handler: "org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest",
            memorySize: UrlShortenerLambdaGroup.LAMBDA_STACK_SIZE,
            runtime: Runtime.JAVA_17,
            timeout: Duration.seconds(10),
            environment: {
                FUNCTION_NAME: "UrlResolverHandler",
                MAIN_CLASS: "com.ammarymn.urlshortenerservice.UrlShortenerServiceApplication",
            }
        });
    }

}