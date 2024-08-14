#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from "../lib/stack";
import {Environment} from "aws-cdk-lib";

const env: Environment = {
    account: process.env.ACCOUNT_ID,
    region: process.env.REGION ?? "me-south-1",
};

const app = new cdk.App();
const apiStack = new ApiStack(app, 'api-stack', {
    env
});

app.synth();