#!/usr/bin/env node
import 'source-map-support/register';
import { BackendStack } from '../lib/backend-stack';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as path from 'path';

// --------------------------------------------------------------

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// --------------------------------------------------------------

const defaultAccountID = '713881797274';
const defaultRegion = 'eu-west-2';
const defaultEnvironment = 'dev';

const accountID = process.env.AWS_ACCOUNT_ID || defaultAccountID;
const region = process.env.AWS_REGION || defaultRegion;
const stage = process.env.ENVIRONMENT || defaultEnvironment;

const stackName = `BackendStack-${stage}`;

// --------------------------------------------------------------

const app = new cdk.App();
new BackendStack(app, stackName, {
  env: {
    account: accountID,
    region: region,
  },
  stage: stage,
  stackName: stackName,
  description: `Backend stack for ${stage} stage`,
});