import { App, Stack, StackProps } from 'aws-cdk-lib'

export interface CiStackProps extends StackProps {}

export class CiStack extends Stack {
    constructor(
        app: App,
        id: string,
        private props: CiStackProps,
    ) {
        super(app, id, props)
    }
}
