import { Construct, IConstruct } from 'constructs'

export interface UiPipelineProps {}

export class UiPipeline extends Construct {
    constructor(
        scope: IConstruct,
        id: string,
        private props?: UiPipelineProps,
    ) {
        super(scope, id)
    }
}
