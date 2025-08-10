const fs = require('fs');
const path = require('path');
const { connectDB } = require('../src/config/database');
const { batchProcessPayloads } = require('../src/utils/payloadProcessor');
require('dotenv').config();

// Script to process sample webhook payloads
async function processWebhookFiles() {
  try {
    console.log('🚀 Starting webhook payload processing...');
    
    // Connect to database
    await connectDB();
    
    const payloadsDir = path.join(__dirname, '../sample-payloads');
    const messagePayloadsDir = path.join(payloadsDir, 'message-payloads');
    const statusPayloadsDir = path.join(payloadsDir, 'status-payloads');
    
    const allPayloads = [];
    
    // Read message payloads
    if (fs.existsSync(messagePayloadsDir)) {
      const messageFiles = fs.readdirSync(messagePayloadsDir)
        .filter(file => file.endsWith('.json'));
      
      console.log(`📨 Found ${messageFiles.length} message payload files`);
      
      for (const file of messageFiles) {
        try {
          const filePath = path.join(messagePayloadsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const payload = JSON.parse(fileContent);
          allPayloads.push(payload);
          console.log(`✅ Loaded: ${file}`);
        } catch (error) {
          console.error(`❌ Error loading ${file}:`, error.message);
        }
      }
    }
    
    // Read status payloads
    if (fs.existsSync(statusPayloadsDir)) {
      const statusFiles = fs.readdirSync(statusPayloadsDir)
        .filter(file => file.endsWith('.json'));
      
      console.log(`📊 Found ${statusFiles.length} status payload files`);
      
      for (const file of statusFiles) {
        try {
          const filePath = path.join(statusPayloadsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const payload = JSON.parse(fileContent);
          allPayloads.push(payload);
          console.log(`✅ Loaded: ${file}`);
        } catch (error) {
          console.error(`❌ Error loading ${file}:`, error.message);
        }
      }
    }
    
    if (allPayloads.length === 0) {
      console.log('⚠️ No payload files found. Make sure to place JSON files in:');
      console.log(`   - ${messagePayloadsDir}`);
      console.log(`   - ${statusPayloadsDir}`);
      
      // Create sample payload as an example
      await createSamplePayloads();
      return;
    }
    
    // Process all payloads
    console.log(`🔄 Processing ${allPayloads.length} payloads...`);
    const results = await batchProcessPayloads(allPayloads);
    
    console.log('\n📋 Processing Summary:');
    console.log(`Total payloads: ${results.total}`);
    console.log(`Successfully processed: ${results.processed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. Payload ${error.index}: ${error.error}`);
      });
    }
    
    console.log('\n✅ Processing completed!');
    
  } catch (error) {
    console.error('❌ Script execution error:', error);
  } finally {
    process.exit(0);
  }
}

// Create sample payloads for testing
async function createSamplePayloads() {
  try {
    console.log('📝 Creating sample payload files...');
    
    const payloadsDir = path.join(__dirname, '../sample-payloads');
    const messagePayloadsDir = path.join(payloadsDir, 'message-payloads');
    const statusPayloadsDir = path.join(payloadsDir, 'status-payloads');
    
    // Create directories if they don't exist
    fs.mkdirSync(messagePayloadsDir, { recursive: true });
    fs.mkdirSync(statusPayloadsDir, { recursive: true });
    
    // Sample message payload
    const sampleMessage = {
      entry: [{
        id: "sample_entry_1",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15550123456",
              phone_number_id: "123456789012345"
            },
            messages: [{
              id: "wamid.sample123456789",
              from: "919876543210",
              timestamp: "1699123456",
              type: "text",
              text: {
                body: "Hello! This is a sample message for testing the WhatsApp Web Clone."
              }
            }],
            contacts: [{
              wa_id: "919876543210",
              profile: {
                name: "John Doe"
              }
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    // Sample status payload
    const sampleStatus = {
      entry: [{
        id: "sample_entry_2",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15550123456",
              phone_number_id: "123456789012345"
            },
            statuses: [{
              id: "wamid.sample123456789",
              recipient_id: "919876543210",
              status: "read",
              timestamp: "1699123466"
            }]
          },
          field: "messages"
        }]
      }]
    };
    
    // Write sample files
    fs.writeFileSync(
      path.join(messagePayloadsDir, 'sample-message.json'),
      JSON.stringify(sampleMessage, null, 2)
    );
    
    fs.writeFileSync(
      path.join(statusPayloadsDir, 'sample-status.json'),
      JSON.stringify(sampleStatus, null, 2)
    );
    
    console.log('✅ Sample payload files created:');
    console.log(`   - ${path.join(messagePayloadsDir, 'sample-message.json')}`);
    console.log(`   - ${path.join(statusPayloadsDir, 'sample-status.json')}`);
    console.log('\n📝 You can now add your actual payload files to these directories and run the script again.');
    
  } catch (error) {
    console.error('❌ Error creating sample payloads:', error);
  }
}

// Command line argument handling
const args = process.argv.slice(2);
if (args.includes('--create-samples')) {
  createSamplePayloads();
} else {
  processWebhookFiles();
}

module.exports = {
  processWebhookFiles,
  createSamplePayloads
};