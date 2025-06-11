import { 
  EC2Client, 
  CreateVpcEndpointCommand,
  DescribeVpcEndpointsCommand,
  DeleteVpcEndpointsCommand
} from '@aws-sdk/client-ec2';

const VPC_ID = 'vpc-0d8e943a4fb6f17af';
const SUBNET_IDS = [
  'subnet-0c76659803ffe1f1b', // us-east-1a
  'subnet-011fc62b3a8b650a4'  // us-east-1b
];
const SECURITY_GROUP_IDS = [
  'sg-0486f6e607701375d' // autostat-lambda-sg
];

// Services we need access to
const REQUIRED_ENDPOINTS = [
  'com.amazonaws.us-east-1.ssm',
  'com.amazonaws.us-east-1.ssmmessages',
  'com.amazonaws.us-east-1.ec2messages',
  'com.amazonaws.us-east-1.rds'
];

async function createVpcEndpoints() {
  try {
    const ec2Client = new EC2Client({ region: 'us-east-1' });
    
    // Check existing endpoints
    console.log('Checking existing VPC endpoints...');
    const existingEndpoints = await ec2Client.send(new DescribeVpcEndpointsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [VPC_ID]
        }
      ]
    }));
    
    const existingServices = existingEndpoints.VpcEndpoints?.map(endpoint => endpoint.ServiceName) || [];
    console.log('Existing VPC endpoints:', existingServices);
    
    // Create missing endpoints
    for (const service of REQUIRED_ENDPOINTS) {
      if (!existingServices.includes(service)) {
        console.log(`Creating VPC endpoint for ${service}...`);
        await ec2Client.send(new CreateVpcEndpointCommand({
          VpcId: VPC_ID,
          ServiceName: service,
          VpcEndpointType: 'Interface',
          SubnetIds: SUBNET_IDS,
          SecurityGroupIds: SECURITY_GROUP_IDS,
          PrivateDnsEnabled: true
        }));
        console.log(`Created VPC endpoint for ${service}`);
      } else {
        console.log(`VPC endpoint for ${service} already exists`);
      }
    }
    
    console.log('VPC endpoints configured successfully');
  } catch (error) {
    console.error('Failed to create VPC endpoints:', error);
    process.exit(1);
  }
}

createVpcEndpoints(); 