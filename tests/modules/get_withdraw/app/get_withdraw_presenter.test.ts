import { expect, it, describe } from 'vitest'
import { handler } from '../../../../src/modules/get_withdraw/app/get_withdraw_presenter'
import envs from '../../../../'
import jwt from 'jsonwebtoken'

describe('Assert Get Withdraw presenter is correct at all', () => {
  const user = {
    role: 'EMPLOYEE',
  }
  const secret = envs.JWT_SECRET

  if (secret === undefined) throw Error('JWT_SECRET is not defined')

  const token = jwt.sign({ user: JSON.stringify(user) }, secret)

  it('Assert Get Withdraw presenter is correct when creating', async () => {
    const event = {
      version: '2.0',
      routeKey: '$default',
      rawPath: '/my/path',
      rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
      cookies: ['cookie1', 'cookie2'],
      headers: {
        header1: 'value1',
        header2: 'value1,value2',
        Authorization: `Bearer ${token}`,
      },
      queryStringParameters: {
        notebookSerialNumber: 'GHI789',
      },
      requestContext: {
        accountId: '123456789012',
        apiId: '<urlid>',
        authentication: null,
        authorizer: {
          iam: {
            accessKey: 'AKIA...',
            accountId: '111122223333',
            callerId: 'AIDA...',
            cognitoIdentity: null,
            principalOrgId: null,
            userArn: 'arn:aws:iam::111122223333:user/example-user',
            userId: 'AIDA...',
          },
        },
        domainName: '<url-id>.lambda-url.us-west-2.on.aws',
        domainPrefix: '<url-id>',
        external_interfaces: {
          method: 'POST',
          path: '/my/path',
          protocol: 'HTTP/1.1',
          sourceIp: '123.123.123.123',
          userAgent: 'agent',
        },
        requestId: 'id',
        routeKey: '$default',
        stage: '$default',
        time: '12/Mar/2020:19:03:58 +0000',
        timeEpoch: 1583348638390,
      },
      body: 'Hello from client!',
      pathParameters: null,
      isBase64Encoded: null,
      stageVariables: null,
    }

    const response = await handler(event, null)

    expect(response?.statusCode).toEqual(200)
    expect(response?.body).toEqual(
      JSON.stringify({
        notebookSerialNumber: 'GHI789',
        studentRA: '23.00555-7',
        name: 'Matue',
        initTime: 1704074148000,
        state: 'PENDING',
        message: 'Withdraw has been retrieved successfully',
      }),
    )
  })
})
