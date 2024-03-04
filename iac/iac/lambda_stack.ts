/* eslint-disable @typescript-eslint/no-explicit-any */
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Resource, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway'
import { Duration } from 'aws-cdk-lib'
import * as path from 'path'

export class LambdaStack extends Construct {
  functionsThatNeedDynamoPermissions: lambda.Function[] = []
  lambdaLayer: lambda.LayerVersion

  createWithdrawFunction: lambda.Function
  finishWithdrawFunction: lambda.Function
  getAllWithdrawsFunction: lambda.Function
  getWithdrawFunction: lambda.Function
  updateWithdrawStateFunction: lambda.Function

  createLambdaApiGatewayIntegration(moduleName: string, method: string, mssStudentApiResource: Resource, environmentVariables: Record<string, any>) {
    const modifiedModuleName = moduleName.toLowerCase().split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    
    const lambdaFunction = new NodejsFunction(this, modifiedModuleName, {
      functionName: `${modifiedModuleName}`,
      entry: path.join(__dirname, `../../src/modules/${moduleName}/app/${moduleName}_presenter.ts`),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      layers: [this.lambdaLayer],
      environment: environmentVariables,
      timeout: Duration.seconds(15),
      memorySize: 512
    })

    mssStudentApiResource.addResource(moduleName.toLowerCase().replace(/_/, '-')).addMethod(method, new LambdaIntegration(lambdaFunction))
    
    return lambdaFunction
  }

  constructor(scope: Construct, apiGatewayResource: Resource, environmentVariables: Record<string, any>) {
    super(scope, 'Template_Lambdas')

    this.lambdaLayer = new lambda.LayerVersion(this, 'Template_Layer', {
      code: lambda.Code.fromAsset('./shared'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
    })

    this.createWithdrawFunction = this.createLambdaApiGatewayIntegration('create_withdraw', 'POST', apiGatewayResource, environmentVariables)
    this.finishWithdrawFunction = this.createLambdaApiGatewayIntegration('finish_withdraw', 'GET', apiGatewayResource, environmentVariables)
    this.getAllWithdrawsFunction = this.createLambdaApiGatewayIntegration('create_user', 'POST', apiGatewayResource, environmentVariables)
    this.getWithdrawFunction = this.createLambdaApiGatewayIntegration('delete_user', 'POST', apiGatewayResource, environmentVariables)
    this.updateWithdrawStateFunction = this.createLambdaApiGatewayIntegration('update_user', 'POST', apiGatewayResource, environmentVariables)

    this.functionsThatNeedDynamoPermissions = [
      this.createWithdrawFunction, 
      this.finishWithdrawFunction, 
      this.getAllWithdrawsFunction, 
      this.getWithdrawFunction, 
      this.updateWithdrawStateFunction
    ]
  }
}