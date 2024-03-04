import { Stack, StackProps } from 'aws-cdk-lib'
import { Cors, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs'
import { TemplateDynamoTable } from './template_dynamo_table'
import { LambdaStack } from './lambda_stack'
import envs from '../../index'

export class TemplateStack extends Stack {
  constructor(scope: Construct, constructId: string, props?: StackProps) {
    super(scope, constructId, props)

    const restApi = new RestApi(this, 'NoteMauaWithdrawRESTAPI', {
      restApiName: 'NoteMauaWithdrawRESTAPI',
      description: 'This is the REST API for the NoteMaua mss withdraw service.',
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowHeaders: ['*']
      }
    })

    const apigatewayResource = restApi.root.addResource('mss-withdraw', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowHeaders: Cors.DEFAULT_HEADERS
      }
    })

    console.log('envs', envs)

    if (envs.DYNAMO_TABLE_NAME === undefined && envs.DYNAMO_TABLE_NAME_HISTORY === undefined) {
      throw new Error('Dynamo table names are not defined')
    }

    const dynamoTable = new TemplateDynamoTable(this, 'WithdrawDynamoTable', 'NoteMauaMssWithdrawDynamoTable',envs.DYNAMO_TABLE_NAME)
    const dynamoTableHistory = new TemplateDynamoTable(this, 'WithdrawHistoryDynamoTable', 'NoteMauaMssWithdrawHistoryDynamoTable', envs.DYNAMO_TABLE_NAME_HISTORY)

    const ENVIRONMENT_VARIABLES = {
      'STAGE': envs.STAGE,
      'DYNAMO_TABLE_NAME': envs.DYNAMO_TABLE_NAME,
      'DYNAMO_PARTITION_KEY': 'PK',
      'DYNAMO_SORT_KEY': 'SK',
      'REGION': envs.REGION,
      'ENDPOINT_URL': envs.ENDPOINT_URL,
      'DYNAMO_TABLE_NAME_HISTORY': envs.DYNAMO_TABLE_NAME_HISTORY,
      'JWT_SECRET': envs.JWT_SECRET,
      'MAIL_USER': envs.MAIL_USER,
      'MAIL_PASSWORD': envs.MAIL_PASSWORD
    }

    const lambdaStack = new LambdaStack(this, apigatewayResource, ENVIRONMENT_VARIABLES)

    dynamoTable.table.grantReadWriteData(lambdaStack.createWithdrawFunction)
    dynamoTable.table.grantReadWriteData(lambdaStack.finishWithdrawFunction)
    dynamoTable.table.grantReadWriteData(lambdaStack.getAllWithdrawsFunction)
    dynamoTable.table.grantReadWriteData(lambdaStack.getWithdrawFunction)
    dynamoTable.table.grantReadWriteData(lambdaStack.updateWithdrawStateFunction)

    dynamoTableHistory.table.grantReadWriteData(lambdaStack.finishWithdrawFunction)
  }
}