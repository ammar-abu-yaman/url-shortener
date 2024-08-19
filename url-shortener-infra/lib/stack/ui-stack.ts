import {App, Duration, Stack, StackProps} from "aws-cdk-lib";
import {ApplicationLoadBalancedEc2Service} from "aws-cdk-lib/aws-ecs-patterns";
import {
    AwsLogDriverMode,
    Cluster,
    ContainerDefinition,
    ContainerImage,
    Ec2TaskDefinition,
    LogDriver,
    NetworkMode
} from "aws-cdk-lib/aws-ecs";
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    IpAddresses,
    IpProtocol,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc
} from "aws-cdk-lib/aws-ec2";
import {AnyPrincipal, Role} from "aws-cdk-lib/aws-iam";
import {DockerImageAsset} from "aws-cdk-lib/aws-ecr-assets";
import {ApplicationProtocol, Protocol} from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface UiStackProps extends StackProps {}

export class UiStack extends Stack {

    private readonly vpc: Vpc;

    private readonly service: ApplicationLoadBalancedEc2Service;

    constructor(app: App, id: string, private props: UiStackProps) {
        super(app, id, props);

        this.vpc = this.createVpc();
        this.service = this.createService();
    }

    private createVpc() {
        return new Vpc(this, 'ui-vpc', {
            vpcName: "UiVpc",
            ipAddresses: IpAddresses.cidr("10.0.0.1/16"),
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
        });
    }

    private createService() {
        const serviceRole = new Role(this, 'ui-service-role', {
            assumedBy: new AnyPrincipal(),
        });

        const taskDefinition = new Ec2TaskDefinition(this, 'ui-task-def', {
            networkMode: NetworkMode.AWS_VPC,
            taskRole: serviceRole,
        });

        const serviceContainer = new ContainerDefinition(this, 'ui-task-container', {
            containerName: "UiServiceContainer",
            image: ContainerImage.fromDockerImageAsset(new DockerImageAsset(this, 'ui-docker-asset', { directory: "../url-shortener-ui" })),
            portMappings: [{ containerPort: 80,
            }],
            taskDefinition,
            memoryLimitMiB: 512,
            logging: LogDriver.awsLogs({ mode: AwsLogDriverMode.BLOCKING, streamPrefix: "UiService"}),
            healthCheck: {
                command: ["CMD-SHELL", "curl -f http://localhost:80 || exit 1"],
                interval: Duration.seconds(10),
                startPeriod: Duration.seconds(30),
                retries: 3,
            },
        });

        const cluster = new Cluster(this, 'ui-cluster', {
            vpc: this.vpc,
            clusterName: 'UrlShortenerUiCluster',
        });

        const securityGroup = new SecurityGroup(this, 'ui-asg-security-group', {
            vpc: this.vpc,
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80));

        const autoScalingGroup = cluster.addCapacity('ui-capacity', {
            allowAllOutbound: true,
            desiredCapacity: 2,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.SMALL),
            minCapacity: 1,
            maxCapacity: 3,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        });
        autoScalingGroup.addSecurityGroup(securityGroup);

        const service =  new ApplicationLoadBalancedEc2Service(this, 'ui-service', {
            taskDefinition,
            serviceName: "UrlShortenerUI",
            publicLoadBalancer: false,
            protocol: ApplicationProtocol.HTTP,
        });

        service.targetGroup.configureHealthCheck({
            path: '/',
            protocol: Protocol.HTTP,
            timeout: Duration.seconds(5),
            enabled: true,
            interval: Duration.minutes(1),
            unhealthyThresholdCount: 5,
        });

        return service;
    }

    public get listener() {
        return this.service.listener;
    }

}