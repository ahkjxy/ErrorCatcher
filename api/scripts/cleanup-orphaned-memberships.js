const mongoose = require('mongoose');
const config = require('../config');

async function cleanupOrphanedMemberships() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB');

    const ProjectMember = require('../src/models/ProjectMember');
    const Project = require('../src/models/Project');

    console.log('\n=== Cleaning Up Orphaned Project Memberships ===\n');

    // 获取所有项目成员关系
    const allMemberships = await ProjectMember.find({});
    console.log(`Total memberships: ${allMemberships.length}`);

    let orphanedCount = 0;
    const orphanedIds = [];

    // 检查每个成员关系的项目是否存在
    for (const membership of allMemberships) {
      const projectExists = await Project.findById(membership.projectId);
      
      if (!projectExists) {
        orphanedCount++;
        orphanedIds.push(membership._id);
        console.log(`✗ Orphaned membership found:`);
        console.log(`  - Membership ID: ${membership._id}`);
        console.log(`  - User ID: ${membership.userId}`);
        console.log(`  - Project ID (deleted): ${membership.projectId}`);
        console.log(`  - Role: ${membership.role}`);
        console.log(`  - Joined At: ${membership.joinedAt}`);
      }
    }

    if (orphanedCount === 0) {
      console.log('\n✓ No orphaned memberships found');
    } else {
      console.log(`\n✗ Found ${orphanedCount} orphaned memberships`);
      console.log('\nDeleting orphaned memberships...');
      
      const result = await ProjectMember.deleteMany({
        _id: { $in: orphanedIds }
      });
      
      console.log(`✓ Deleted ${result.deletedCount} orphaned memberships`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

cleanupOrphanedMemberships();
