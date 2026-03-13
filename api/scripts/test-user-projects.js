const mongoose = require('mongoose');
const config = require('../config');

async function testUserProjects() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB');

    const ProjectMember = require('../src/models/ProjectMember');
    const Project = require('../src/models/Project');
    const User = require('../src/models/User');

    const userId = '69afa4cb06a42a66820a96c1';
    
    console.log('\n=== Testing User Projects Endpoint ===');
    console.log('User ID:', userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log('✗ User not found');
      process.exit(1);
    }
    console.log('✓ User found:', user.username);

    // Get user's member projects
    console.log('\n--- Member Projects ---');
    const memberships = await ProjectMember.find({ userId })
      .populate('projectId', 'name description createdAt')
      .sort({ joinedAt: -1 });
    
    console.log('Member projects count:', memberships.length);
    memberships.forEach(m => {
      if (m.projectId) {
        console.log(`  - ${m.projectId.name} (role: ${m.role})`);
      } else {
        console.log(`  - Project not found (deleted?), membership ID: ${m._id}`);
      }
    });

    // Get user's owned projects
    console.log('\n--- Owned Projects ---');
    const ownedProjects = await Project.find({ createdBy: userId })
      .select('name description createdAt');
    
    console.log('Owned projects count:', ownedProjects.length);
    ownedProjects.forEach(p => {
      console.log(`  - ${p.name}`);
    });

    // Test the actual endpoint logic
    console.log('\n--- Testing Endpoint Logic ---');
    try {
      const result = {
        memberProjects: memberships.map(m => {
          if (!m.projectId) {
            console.log('Warning: projectId is null for membership:', m._id);
            return null;
          }
          return {
            ...m.projectId.toObject(),
            role: m.role,
            joinedAt: m.joinedAt
          };
        }).filter(p => p !== null),
        ownedProjects
      };
      
      console.log('✓ Endpoint logic successful');
      console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.log('✗ Endpoint logic failed:', error.message);
      console.error(error);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

testUserProjects();
