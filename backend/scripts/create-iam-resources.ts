import { 
  IAMClient, 
  CreateRoleCommand,
  PutRolePolicyCommand,
  GetRoleCommand,
  DeleteRolePolicyCommand,
  UpdateAssumeRolePolicyCommand
} from '@aws-sdk/client-iam';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROLE_NAME = 'autostat-db-migrate-role';
const POLICY_NAME = 'autostat-db-migrate-policy';

async function createIamResources() {
  try {
    const iamClient = new IAMClient({ region: 'us-east-1' });
    
    // Read role and policy documents
    const roleDocument = JSON.parse(readFileSync(resolve(__dirname, '../aws/iam/db-migrate-role.json'), 'utf-8'));
    const policyDocument = JSON.parse(readFileSync(resolve(__dirname, '../aws/iam/db-migrate-policy.json'), 'utf-8'));
    
    let roleArn = '' as string;
    
    // Get or create role
    try {
      // Check if role exists
      const existingRole = await iamClient.send(new GetRoleCommand({ RoleName: ROLE_NAME }));
      roleArn = existingRole.Role?.Arn || '';
      console.log('Role exists, updating assume role policy...');
      
      // Update assume role policy
      await iamClient.send(new UpdateAssumeRolePolicyCommand({
        RoleName: ROLE_NAME,
        PolicyDocument: JSON.stringify(roleDocument)
      }));
      
      console.log('Assume role policy updated');
    } catch (error: any) {
      if (error.name === 'NoSuchEntity') {
        console.log('Creating new role...');
        const createRoleResponse = await iamClient.send(new CreateRoleCommand({
          RoleName: ROLE_NAME,
          AssumeRolePolicyDocument: JSON.stringify(roleDocument),
          Description: 'Role for database migration Lambda function'
        }));
        
        if (!createRoleResponse.Role?.Arn) {
          throw new Error('Role was not created successfully');
        }
        
        roleArn = createRoleResponse.Role.Arn;
        console.log('Role created successfully:', roleArn);
      } else {
        throw error;
      }
    }
    
    // Remove existing policy if it exists (to ensure clean update)
    try {
      console.log('Removing existing policy if present...');
      await iamClient.send(new DeleteRolePolicyCommand({
        RoleName: ROLE_NAME,
        PolicyName: POLICY_NAME
      }));
    } catch (error) {
      // Ignore errors here - policy might not exist
    }
    
    // Attach inline policy to role
    console.log('Updating role policy...');
    await iamClient.send(new PutRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyName: POLICY_NAME,
      PolicyDocument: JSON.stringify(policyDocument)
    }));
    
    console.log('Policy updated successfully');
    
    // Wait for role to propagate
    console.log('Waiting 10 seconds for role propagation...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('IAM resources updated successfully');
    console.log('Role ARN:', roleArn);
  } catch (error) {
    console.error('Failed to update IAM resources:', error);
    process.exit(1);
  }
}

createIamResources(); 