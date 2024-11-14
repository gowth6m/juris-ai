import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

export interface FrontendStackProps extends cdk.StackProps {
  stage: string;
}

export class FrontendStack extends cdk.Stack {
  stage: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    this.stage = props.stage;

    const hostedZoneName = this.isProd() ? 'jurisai.uk' : `${this.stage}.jurisai.uk`;

    const fullDomainName = `app.${hostedZoneName}`;

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: hostedZoneName,
    });

    // Create an S3 bucket for the website
    const bucket = new s3.Bucket(this, 'FrontendAppBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: fullDomainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Create a CloudFront distribution for the S3 bucket
    const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      domainNames: [fullDomainName],
      certificate,
    });

    // Deploy the website content to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('../out')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    const recordName = `${fullDomainName}.`;

    // Create a new A record in Route 53 that points to the CloudFront distribution
    new route53.ARecord(this, 'ARecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
      recordName: recordName,
    });

    // Create a new A record in Route 53 that points to the CloudFront distribution
    new route53.AaaaRecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
      recordName: recordName,
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
  }

  isProd(): boolean {
    return this.stage == 'prod';
  }
}
