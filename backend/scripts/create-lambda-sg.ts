import { 
  EC2Client, 
  CreateSecurityGroupCommand,
  AuthorizeSecurityGroupIngressCommand,
  AuthorizeSecurityGroupEgressCommand,
  DescribeSecurityGroupsCommand,
  DescribeVpcEndpointsCommand
} from '@aws-sdk/client-ec2';

const VPC_ID = 'vpc-0d8e943a4fb6f17af';
const GROUP_NAME = 'autostat-lambda-sg';
const DB_SECURITY_GROUP = 'sg-0771d55def15ec4ce';

async function createLambdaSecurityGroup() {
  try {
    const ec2Client = new EC2Client({ region: 'us-east-1' });
    
    // Get VPC endpoint security groups
    console.log('Getting VPC endpoint security groups...');
    const vpcEndpoints = await ec2Client.send(new DescribeVpcEndpointsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [VPC_ID]
        },
        {
          Name: 'service-name',
          Values: [
            'com.amazonaws.us-east-1.ssm',
            'com.amazonaws.us-east-1.ssmmessages',
            'com.amazonaws.us-east-1.ec2messages'
          ]
        }
      ]
    }));
    
    const endpointSecurityGroups = vpcEndpoints.VpcEndpoints?.flatMap(endpoint => 
      endpoint.Groups?.map(group => group.GroupId) || []
    ) || [];
    
    console.log('VPC endpoint security groups:', endpointSecurityGroups);
    
    // Check if security group already exists
    let groupId = '';
    try {
      const existingGroups = await ec2Client.send(new DescribeSecurityGroupsCommand({
        Filters: [
          {
            Name: 'group-name',
            Values: [GROUP_NAME]
          },
          {
            Name: 'vpc-id',
            Values: [VPC_ID]
          }
        ]
      }));
      
      if (existingGroups.SecurityGroups && existingGroups.SecurityGroups.length > 0) {
        const existingGroupId = existingGroups.SecurityGroups[0].GroupId;
        if (!existingGroupId) {
          throw new Error('Security group exists but ID is missing');
        }
        console.log('Security group already exists:', existingGroupId);
        groupId = existingGroupId;
      } else {
        // Create security group
        console.log('Creating security group...');
        const createResponse = await ec2Client.send(new CreateSecurityGroupCommand({
          GroupName: GROUP_NAME,
          Description: 'Security group for Lambda functions',
          VpcId: VPC_ID
        }));
        
        const newGroupId = createResponse.GroupId;
        if (!newGroupId) {
          throw new Error('Failed to get security group ID');
        }
        
        groupId = newGroupId;
        console.log('Security group created:', groupId);
      }
    } catch (error) {
      console.error('Failed to check/create security group:', error);
      throw error;
    }
    
    // Allow outbound HTTPS traffic
    console.log('Adding outbound rules...');
    try {
      await ec2Client.send(new AuthorizeSecurityGroupEgressCommand({
        GroupId: groupId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 443,
            ToPort: 443,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
          }
        ]
      }));
      console.log('Added outbound HTTPS rule');
    } catch (error: any) {
      if (error.name === 'InvalidPermission.Duplicate') {
        console.log('Outbound HTTPS rule already exists');
      } else {
        throw error;
      }
    }
    
    // Allow outbound PostgreSQL traffic to DB security group
    try {
      await ec2Client.send(new AuthorizeSecurityGroupEgressCommand({
        GroupId: groupId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 5432,
            ToPort: 5432,
            UserIdGroupPairs: [{ GroupId: DB_SECURITY_GROUP }]
          }
        ]
      }));
      console.log('Added outbound PostgreSQL rule');
    } catch (error: any) {
      if (error.name === 'InvalidPermission.Duplicate') {
        console.log('Outbound PostgreSQL rule already exists');
      } else {
        throw error;
      }
    }
    
    // Allow inbound traffic from the Lambda security group to VPC endpoints
    if (endpointSecurityGroups.length > 0) {
      console.log('Adding inbound rules to VPC endpoint security groups...');
      for (const endpointGroupId of endpointSecurityGroups) {
        try {
          await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
            GroupId: endpointGroupId,
            IpPermissions: [
              {
                IpProtocol: 'tcp',
                FromPort: 443,
                ToPort: 443,
                UserIdGroupPairs: [{ GroupId: groupId }]
              }
            ]
          }));
          console.log(`Added inbound rule to endpoint security group: ${endpointGroupId}`);
        } catch (error: any) {
          if (error.name === 'InvalidPermission.Duplicate') {
            console.log(`Inbound rule already exists for endpoint security group: ${endpointGroupId}`);
          } else {
            throw error;
          }
        }
      }
    }
    
    // Allow inbound PostgreSQL traffic to DB security group from Lambda
    console.log('Adding inbound rule to DB security group...');
    try {
      await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
        GroupId: DB_SECURITY_GROUP,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 5432,
            ToPort: 5432,
            UserIdGroupPairs: [{ GroupId: groupId }]
          }
        ]
      }));
      console.log('Added inbound rule to DB security group');
    } catch (error: any) {
      if (error.name === 'InvalidPermission.Duplicate') {
        console.log('Inbound rule already exists for DB security group');
      } else {
        throw error;
      }
    }
    
    console.log('Security group configured successfully');
    return groupId;
  } catch (error) {
    console.error('Failed to create security group:', error);
    process.exit(1);
  }
}

createLambdaSecurityGroup(); 