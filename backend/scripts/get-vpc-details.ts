import { 
  EC2Client, 
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand
} from '@aws-sdk/client-ec2';

async function getVpcDetails() {
  try {
    const ec2Client = new EC2Client({ region: 'us-east-1' });
    
    // Get VPCs with tag Name containing 'autostat' or 'artemis'
    const vpcsResponse = await ec2Client.send(new DescribeVpcsCommand({
      Filters: [
        {
          Name: 'tag:Name',
          Values: ['*autostat*', '*artemis*']
        }
      ]
    }));
    
    if (!vpcsResponse.Vpcs?.length) {
      console.log('No matching VPCs found');
      return;
    }
    
    for (const vpc of vpcsResponse.Vpcs) {
      console.log('\nVPC Details:');
      console.log('VPC ID:', vpc.VpcId);
      console.log('CIDR:', vpc.CidrBlock);
      console.log('Tags:', vpc.Tags?.map(t => `${t.Key}=${t.Value}`).join(', '));
      
      // Get subnets for this VPC
      const subnetsResponse = await ec2Client.send(new DescribeSubnetsCommand({
        Filters: [
          {
            Name: 'vpc-id',
            Values: [vpc.VpcId!]
          }
        ]
      }));
      
      console.log('\nSubnets:');
      for (const subnet of subnetsResponse.Subnets || []) {
        console.log(`- ${subnet.SubnetId} (${subnet.CidrBlock})`);
        console.log('  Availability Zone:', subnet.AvailabilityZone);
        console.log('  Tags:', subnet.Tags?.map(t => `${t.Key}=${t.Value}`).join(', '));
      }
      
      // Get security groups for this VPC
      const sgResponse = await ec2Client.send(new DescribeSecurityGroupsCommand({
        Filters: [
          {
            Name: 'vpc-id',
            Values: [vpc.VpcId!]
          }
        ]
      }));
      
      console.log('\nSecurity Groups:');
      for (const sg of sgResponse.SecurityGroups || []) {
        console.log(`- ${sg.GroupId} (${sg.GroupName})`);
        console.log('  Description:', sg.Description);
        
        console.log('  Inbound Rules:');
        for (const rule of sg.IpPermissions || []) {
          const ports = rule.FromPort === rule.ToPort ? 
            `${rule.FromPort}` : 
            `${rule.FromPort}-${rule.ToPort}`;
          
          for (const range of rule.IpRanges || []) {
            console.log(`    ${rule.IpProtocol} ${ports} from ${range.CidrIp}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to get VPC details:', error);
    process.exit(1);
  }
}

getVpcDetails(); 