import { SSMClient, GetParametersByPathCommand } from '@aws-sdk/client-ssm';
import { config } from './index.js';

let ssmClient: SSMClient | null = null;

export async function loadConfigFromSSM(): Promise<void> {
  // Only attempt SSM parameter retrieval if not explicitly configured to use local mocks and running in cloud
  if (config.aws.useLocalCloudMocks || config.env !== 'production') {
    return;
  }

  try {
    if (!ssmClient) {
      ssmClient = new SSMClient({ region: config.aws.region });
    }

    const command = new GetParametersByPathCommand({
      Path: config.aws.ssmParameterPath,
      WithDecryption: true,
      Recursive: true,
    });

    const response = await ssmClient.send(command);
    if (!response.Parameters || response.Parameters.length === 0) {
      return;
    }

    for (const param of response.Parameters) {
      if (!param.Name || !param.Value) continue;
      const key = param.Name.replace(config.aws.ssmParameterPath, '').toLowerCase();

      switch (key) {
        case 'db_password':
        case 'db/password':
          config.db.password = param.Value;
          break;
        case 'db_user':
        case 'db/user':
          config.db.user = param.Value;
          break;
        case 'db_host':
        case 'db/host':
          config.db.host = param.Value;
          break;
        case 'jwt_secret':
        case 'jwt/secret':
          config.jwt.secret = param.Value;
          break;
      }
    }
  } catch (error) {
    // Log safe warning without leaking any credentials
    console.warn('[SSM Warning] Unable to fetch parameters from SSM Parameter Store; falling back to local environment variables:', (error as Error).message);
  }
}
