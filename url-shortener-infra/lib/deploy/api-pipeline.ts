import { Construct, IConstruct } from 'constructs'

export interface ApiPipelineProps {}

export class ApiPipeline extends Construct {
    constructor(
        scope: IConstruct,
        id: string,
        private props?: ApiPipelineProps,
    ) {
        super(scope, id)
    }
}
