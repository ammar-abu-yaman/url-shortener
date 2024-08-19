#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ApiStack, DataStack, UiStack} from "../lib/stack";
import {Environment} from "aws-cdk-lib";

const env: Environment = {
    account: process.env.ACCOUNT_ID,
    region: process.env.REGION ?? "me-south-1",
};

const app = new cdk.App();

const dataStack = new DataStack(app, 'data-stack', { env });
const uiStack = new UiStack(app, 'ui-stack', { env });
uiStack.addDependency(dataStack);

const apiStack = new ApiStack(app, 'api-stack', { env, uiListener: uiStack.listener });
apiStack.addDependency(dataStack);

app.synth();