import dataSource from '../data-source';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
import * as fs from 'fs';
import * as path from 'path';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  // Initialize data source
  await dataSource.initialize();
  
  try {
    const userRepository = dataSource.getRepository(User);
    const murmurRepository = dataSource.getRepository(Murmur);
    
    // Get available images from uploads folder
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    let imageFiles: string[] = [];
    
    try {
      const files = fs.readdirSync(uploadsDir);
      imageFiles = files.filter(file => 
        file.endsWith('.jpg') || file.endsWith('.jpeg') || 
        file.endsWith('.png') || file.endsWith('.gif') || 
        file.endsWith('.webp')
      ).map(file => `http://localhost:3001/uploads/${file}`);
      
      console.log(`Found ${imageFiles.length} images for seeding`);
    } catch (error) {
      console.log('No upload images found, using placeholder URLs');
      imageFiles = [
        'http://localhost:3001/uploads/placeholder1.jpg',
        'http://localhost:3001/uploads/placeholder2.jpg',
        'http://localhost:3001/uploads/placeholder3.jpg'
      ];
    }
    
    // Create 1,000 users
    console.log('Creating 1,000 users...');
    const users: User[] = [];
    
    for (let i = 0; i < 1000; i++) {
      const user = new User();
      user.name = `User ${i + 1}`;
      user.email = `user${i + 1}@example.com`;
      user.username = `user${i + 1}`;
      user.passwordHash = `$2b$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`; // Placeholder hash
      user.avatar = imageFiles[Math.floor(Math.random() * imageFiles.length)] || null;
      user.bio = `This is the bio for user ${i + 1}. I love posting content on this platform!`;
      user.location = `City ${i + 1}, Country`;
      user.website = `https://user${i + 1}.example.com`;
      user.followersCount = Math.floor(Math.random() * 10000);
      user.followingCount = Math.floor(Math.random() * 1000);
      
      users.push(user);
    }
    
    // Save all users at once
    await userRepository.save(users);
    console.log('Successfully created 1,000 users');
    
    // Get all user IDs for assigning posts
    const allUsers = await userRepository.find({ select: ['id'] });
    const userIds = allUsers.map(user => user.id);
    
    // Create 1,000,000 posts in chunks
    console.log('Creating 1,000,000 posts...');
    const totalPosts = 1000000;
    const chunkSize = 10000; // Process 10,000 posts at a time
    
    for (let chunk = 0; chunk < totalPosts; chunk += chunkSize) {
      const postsToCreate = Math.min(chunkSize, totalPosts - chunk);
      const murmurs: Murmur[] = [];
      
      for (let i = 0; i < postsToCreate; i++) {
        const murmur = new Murmur();
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        
        murmur.content = `This is post #${chunk + i + 1} created during seeding. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. #seeding #test #post${chunk + i + 1}`;
        murmur.userId = userId;
        murmur.likeCount = Math.floor(Math.random() * 1000);
        murmur.replyCount = Math.floor(Math.random() * 100);
        murmur.repostCount = Math.floor(Math.random() * 50);
        
        // Randomly assign media URL (30% chance)
        if (Math.random() < 0.3) {
          murmur.mediaUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)] || null;
        } else {
          murmur.mediaUrl = null;
        }
        
        murmurs.push(murmur);
      }
      
      // Insert the chunk
      await murmurRepository.save(murmurs);
      console.log(`Inserted ${chunk + postsToCreate} posts...`);
    }
    
    console.log('Successfully created 1,000,000 posts');
    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    // Don't destroy the dataSource as it's a singleton
    // await dataSource.destroy();
  }
}

// Run the seeder
seedDatabase().catch(error => {
  console.error('Seeder error:', error);
  process.exit(1);
});