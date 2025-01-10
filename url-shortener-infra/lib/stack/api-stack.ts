import { App, Stack, StackProps } from 'aws-cdk-lib'
import { ApiLambdaGroup } from '../lambda'
import { HttpApi, HttpMethod, PayloadFormatVersion } from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'

export interface ApiStackProps extends StackProps {}

export class ApiStack extends Stack {
    private readonly urlShortenerLambda: ApiLambdaGroup

    public readonly api: HttpApi

    constructor(
        app: App,
        id: string,
        private props?: ApiStackProps,
    ) {
        super(app, id, props)

        this.api = new HttpApi(this, 'url-shortener-api', {
            apiName: 'UrlShortenerServiceApi',
        })

        this.urlShortenerLambda = new ApiLambdaGroup(this, 'url-shortener-lambda')

        this.api.addRoutes({
            integration: new HttpLambdaIntegration('url-shortener-lambda-integration', this.urlShortenerLambda.urlResolverLambda, {
                payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
            }),
            methods: [HttpMethod.GET],
            path: '/{id}',
        })

        this.api.addRoutes({
            integration: new HttpLambdaIntegration('url-resolver-lambda-integration', this.urlShortenerLambda.urlShortenerLambda, {
                payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
            }),
            methods: [HttpMethod.POST],
            path: '/create',
        })

        this.exportValue(`${this.api.apiId}.execute-api.${this.region}.amazonaws.com`, { name: 'link-api-url' })
    }
}
