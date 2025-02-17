import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export class Task2CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'OAI');

    const bucket = new s3.Bucket(this, 'MyBucket', {
      bucketName: 'nodejs-aws-shop-react-bucket',
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ["S3:GetObject"],
      resources: [bucket.arnForObjects("*")],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    const distribution = new cloudfront.Distribution(this, "MyDistribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ]
    });

    new s3deploy.BucketDeployment(this, "MyBucketDeployment", {
      sources: [s3deploy.Source.asset("../dist")],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ["/*"]
    })
  }
}
