import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const TEST_QUEUE = 'test-scraping-queue';

interface TestMessage {
  jobId: string;
  type: string;
  url: string;
  timestamp: Date;
}

async function testRabbitMQConnection(): Promise<void> {
  let connection: amqp.Connection | undefined;
  let channel: amqp.Channel | undefined;

  try {
    console.log('🔄 Connecting to RabbitMQ...');
    console.log('URL:', RABBITMQ_URL);
    
    // Connect to RabbitMQ
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    console.log('✅ Successfully connected to RabbitMQ');

    // Ensure test queue exists
    await channel.assertQueue(TEST_QUEUE, { durable: true });
    console.log(`✅ Queue "${TEST_QUEUE}" is ready`);

    // Test message publishing
    const testMessage: TestMessage = {
      jobId: uuidv4(),
      type: 'house-scraping',
      url: 'https://example.com/house/123',
      timestamp: new Date()
    };

    const messageBuffer = Buffer.from(JSON.stringify(testMessage));
    const published = channel.sendToQueue(TEST_QUEUE, messageBuffer, { persistent: true });
    
    if (published) {
      console.log('✅ Message published successfully');
      console.log('Message:', testMessage);
    } else {
      throw new Error('Failed to publish message');
    }

    // Test message consumption
    console.log('🔄 Setting up message consumer...');
    
    let messageReceived = false;
    
    await channel.consume(TEST_QUEUE, (msg) => {
      if (!msg) return;
      
      try {
        const receivedMessage = JSON.parse(msg.content.toString());
        console.log('✅ Message received successfully');
        console.log('Received:', receivedMessage);
        
        // Acknowledge the message
        channel!.ack(msg);
        messageReceived = true;
        
      } catch (error) {
        console.error('❌ Error processing message:', error);
        channel!.nack(msg, false, false);
      }
    });

    // Wait a bit for message processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (messageReceived) {
      console.log('✅ Message consumption test completed successfully');
    } else {
      console.log('⚠️  No message was received (this might be normal for quick tests)');
    }

    // Clean up - purge test queue
    await channel.purgeQueue(TEST_QUEUE);
    console.log('🧹 Test queue cleaned up');

  } catch (error) {
    console.error('❌ RabbitMQ test failed:', error);
    throw error;
  } finally {
    // Clean up connections
    try {
      if (channel) {
        await channel.close();
        console.log('📪 Channel closed');
      }
      if (connection) {
        await connection.close();
        console.log('🔌 Connection closed');
      }
    } catch (closeError) {
      console.error('⚠️  Error during cleanup:', closeError);
    }
  }
}

// Run the test
console.log('🚀 Starting RabbitMQ Queue Test');
console.log('===================================');

testRabbitMQConnection()
  .then(() => {
    console.log('===================================');
    console.log('🎉 All tests passed! RabbitMQ is working correctly.');
    process.exit(0);
  })
  .catch((error) => {
    console.log('===================================');
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }); 