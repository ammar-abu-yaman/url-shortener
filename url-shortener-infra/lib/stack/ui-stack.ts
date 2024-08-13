import {App, Stack, StackProps} from "aws-cdk-lib";
import {NetworkLoadBalancedEc2Service} from "aws-cdk-lib/aws-ecs-patterns";
import {DeploymentControllerType, Ec2TaskDefinition, NetworkMode, PlacementStrategy} from "aws-cdk-lib/aws-ecs";
import {IpAddresses, IpProtocol, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {AnyPrincipal, Policy, Role} from "aws-cdk-lib/aws-iam";

export interface UiStackProps extends StackProps {}

export class UiStack extends Stack {

    private readonly vpc: Vpc;

    private readonly service: NetworkLoadBalancedEc2Service;

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
            subnetConfiguration: [{
                cidrMask: 24,
                name: 'application',
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            }],
            natGateways: 1,
        });
    }

    private createService() {
        const serviceRole = new Role(this, 'ui-service-role', {
            assumedBy: new AnyPrincipal(),
        });
        return new NetworkLoadBalancedEc2Service(this,'ui-service', {
            taskDefinition: new Ec2TaskDefinition(this, 'ui-task-def', {
                networkMode: NetworkMode.AWS_VPC,
                taskRole: serviceRole,
            }),
            placementStrategies: [PlacementStrategy.spreadAcrossInstances()],
            publicLoadBalancer: false,
            desiredCount: 2,
            minHealthyPercent: 50,
            maxHealthyPercent: 150,
            deploymentController: { type: DeploymentControllerType.CODE_DEPLOY },
        });
    }
}