import { Construct } from 'constructs'
import { BundlingOutput, Duration } from 'aws-cdk-lib'
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda'
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb'
import { DataStack } from '../stack'

export interface ApiLambdaGroupProps {}

export class ApiLambdaGroup extends Construct {
    public static readonly LAMBDA_STACK_SIZE = 2048

    public static readonly CODE_VERSION = '0.0.1'

    public readonly urlResolverLambda: Function

    public readonly urlShortenerLambda: Function

    public constructor(
        scope: Construct,
        id: string,
        private props?: ApiLambdaGroupProps,
    ) {
        super(scope, id)

        const code = this.getApiCode()

        const shortenedUrlTable = TableV2.fromTableName(this, 'table', DataStack.SHORTENED_URL_TABLE_NAME)

        this.urlShortenerLambda = this.createFunction({
            id: 'url-shortener-lambda',
            code,
            name: 'UrlShortenerLambda',
            definition: 'urlShortenerHandler',
        })

        this.urlResolverLambda = this.createFunction({
            id: 'url-resolver-lambda',
            code,
            name: 'UrlResolverLambda',
            definition: 'urlResolverHandler',
        })

        shortenedUrlTable.grantReadData(this.urlResolverLambda)
        shortenedUrlTable.grantWriteData(this.urlShortenerLambda)
    }

    private getApiCode() {
        return Code.fromAsset('../url-shortener-service/', {
            bundling: {
                image: Runtime.JAVA_17.bundlingImage,
                command: [
                    '/bin/sh',
                    '-c',
                    `./gradlew shadowJar \
                    && cp /asset-input/build/libs/url-shortener-service-${ApiLambdaGroup.CODE_VERSION}-aws.jar /asset-output/lambda.jar`,
                ],
                user: 'root',
                outputType: BundlingOutput.ARCHIVED,
            },
        })
    }

    private createFunction({ id, code, name, definition }: { id: string; code: Code; name: string; definition: string }) {
        return new Function(this, id, {
            code,
            functionName: name,
            description: `${ApiLambdaGroup.CODE_VERSION}`,
            handler: 'org.springframework.cloud.function.adapter.aws.FunctionInvoker::handleRequest',
            memorySize: ApiLambdaGroup.LAMBDA_STACK_SIZE,
            runtime: Runtime.JAVA_17,
            timeout: Duration.seconds(10),
            environment: {
                spring_cloud_function_definition: definition,
                FUNCTION_NAME: definition,
                MAIN_CLASS: 'com.ammarymn.urlshortenerservice.UrlShortenerServiceApplication',
            },
        })
    }
}
