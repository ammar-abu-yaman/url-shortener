import {App, Duration, Fn, Stack, StackProps} from 'aws-cdk-lib'
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns'
import { AwsLogDriverMode, Cluster, Compatibility, ContainerDefinition, ContainerImage, LogDriver, NetworkMode, TaskDefinition } from 'aws-cdk-lib/aws-ecs'
import { IpAddresses, IpProtocol, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { AnyPrincipal, Role } from 'aws-cdk-lib/aws-iam'
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets'
import { ApplicationProtocol, Protocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {
    AllowedMethods,
    Distribution,
    OriginProtocolPolicy,
    OriginRequestHeaderBehavior,
    OriginRequestPolicy,
    OriginRequestQueryStringBehavior,
    PriceClass,
    ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { LoadBalancerV2Origin } from 'aws-cdk-lib/aws-cloudfront-origins'

export interface UiStackProps extends StackProps {}

export class UiStack extends Stack {
    private readonly vpc: Vpc

    private readonly service: ApplicationLoadBalancedFargateService

    private readonly distribution: Distribution

    constructor(
        app: App,
        id: string,
        private props: UiStackProps,
    ) {
        super(app, id, props)

        this.vpc = this.createVpc()
        this.service = this.createService()
        this.distribution = this.createDistribution()
    }

    private createVpc() {
        return new Vpc(this, 'ui-vpc', {
            vpcName: 'UiVpc',
            ipAddresses: IpAddresses.cidr('10.0.0.1/16'),
            ipProtocol: IpProtocol.IPV4_ONLY,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'application',
                    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 24,
                    name: 'egress',
                    subnetType: SubnetType.PUBLIC,
                },
            ],
            natGateways: 1,
        })
    }

    private createService() {
        const serviceRole = new Role(this, 'ui-service-role', {
            assumedBy: new AnyPrincipal(),
        })

        const taskDefinition = new TaskDefinition(this, 'ui-task-def', {
            networkMode: NetworkMode.AWS_VPC,
            taskRole: serviceRole,
            compatibility: Compatibility.EC2_AND_FARGATE,
            memoryMiB: '2048',
            cpu: '1024',
        })

        const serviceContainer = new ContainerDefinition(this, 'ui-task-container', {
            containerName: 'UiServiceContainer',
            image: ContainerImage.fromDockerImageAsset(new DockerImageAsset(this, 'ui-docker-asset', { directory: '../url-shortener-ui' })),
            portMappings: [{ containerPort: 80 }],
            taskDefinition,
            memoryLimitMiB: 2048,
            cpu: 1024,
            logging: LogDriver.awsLogs({ mode: AwsLogDriverMode.BLOCKING, streamPrefix: 'UiService' }),
            healthCheck: {
                command: ['CMD-SHELL', 'curl -f http://localhost/ || exit 1'],
                interval: Duration.seconds(30),
                startPeriod: Duration.minutes(5),
                retries: 3,
            },
            environment: {
                SHORTEN_URL_API_URL: Fn.importValue('link-api-url'),
            }
        })

        const cluster = new Cluster(this, 'ui-cluster', {
            vpc: this.vpc,
            clusterName: 'UrlShortenerUiCluster',
            enableFargateCapacityProviders: true,
        })

        const service = new ApplicationLoadBalancedFargateService(this, 'ui-service', {
            taskDefinition,
            serviceName: 'UrlShortenerUI',
            publicLoadBalancer: true,
            protocol: ApplicationProtocol.HTTP,
            cluster,
            desiredCount: 2,
            taskSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        })

        service.targetGroup.configureHealthCheck({
            path: '/',
            protocol: Protocol.HTTP,
            timeout: Duration.seconds(5),
            enabled: true,
            interval: Duration.minutes(1),
            unhealthyThresholdCount: 5,
        })

        return service
    }

    private createDistribution() {
        return new Distribution(this, 'ui-distribution', {
            defaultBehavior: {
                origin: new LoadBalancerV2Origin(this.service.loadBalancer, {
                    httpPort: 80,
                    protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                }),
                allowedMethods: AllowedMethods.ALLOW_ALL,
                cachedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                originRequestPolicy: new OriginRequestPolicy(this, 'default-request-policy', {
                    headerBehavior: OriginRequestHeaderBehavior.all(),
                    queryStringBehavior: OriginRequestQueryStringBehavior.all(),
                }),
            },
            enabled: true,
            priceClass: PriceClass.PRICE_CLASS_200,
        })
    }
}
