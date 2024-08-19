import {Construct, IConstruct} from "constructs";
import {CodePipeline} from "aws-cdk-lib/pipelines";

export interface ApiPipelineProps {}

export class ApiPipeline extends Construct {
    constructor(scope: IConstruct, id: string, private props?: ApiPipelineProps) {
        super(scope, id);

    }
}