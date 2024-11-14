import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';

import { Construct } from 'constructs';

import * as dotenv from 'dotenv';

// --------------------------------------------------------------

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

// --------------------------------------------------------------

const ENV_VARS = {
  ENVIRONMENT: getEnvVar('ENVIRONMENT'),
}

// --------------------------------------------------------------

export interface BackendProps extends cdk.StackProps {
  readonly stage: string;
  readonly zone?: route53.IHostedZone;
}

// --------------------------------------------------------------

export class BackendStack extends cdk.Stack {

  stage: string;

  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id, props);

    this.stage = props.stage

    const hostedZone = props.zone || route53.HostedZone.fromLookup(this, 'NewHostedZone', {
      domainName: `${this.stage}.jurisai.uk`
    });

    const backendLayer = new lambda.LayerVersion(this, 'BackendLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'dist', 'layer', 'layer.zip')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
      description: 'Lambda layer with dependencies for BackendLambda',
    });

    const backendLambda = new lambda.Function(this, 'BackendLambda', {
      runtime: lambda.Runtime.PYTHON_3_11,
      architecture: lambda.Architecture.X86_64,
      handler: 'main.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'dist', 'lambda', 'lambda.zip')),
      environment: ENV_VARS,
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      layers: [backendLayer],
    });

    backendLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        `arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:backend/base-*`
      ],
    }));

    const certificate = new acm.Certificate(this, 'ApiCertificate', {
      domainName: `api.${this.stage}.jurisai.uk`,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });

    const api = new apigateway.LambdaRestApi(this, 'BackendAPI', {
      handler: backendLambda,
      domainName: {
        domainName: `api.${this.stage}.jurisai.uk`,
        certificate: certificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
      proxy: true,
      integrationOptions: {
        contentHandling: apigateway.ContentHandling.CONVERT_TO_BINARY,
      },
      binaryMediaTypes: [
        'image/jpeg',
        'application/pdf',
        'application/octet-stream',
        'multipart/form-data',
      ],
    });

    new route53.ARecord(this, 'ApiAliasRecord', {
      zone: hostedZone,
      recordName: `api.${this.stage}.jurisai.uk`,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
    });
  }

  isProd(): boolean {
    return this.stage == "prod"
  }
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}
