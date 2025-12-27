import { LLMFactory } from '../src/core/llm/factory';

async function main() {
    console.log('🚀 Testing Qwen Provider...');

    // Check for API Key
    if (!process.env.DASHSCOPE_API_KEY) {
        console.error('❌ Error: DASHSCOPE_API_KEY environment variable is not set.');
        process.exit(1);
    }

    try {
        const provider = LLMFactory.createProvider('qwen-max');
        await provider.initialize();

        console.log('✅ Provider Initialized');
        console.log('📤 Sending request: "Hello, who are you?"');

        // Test Non-streaming
        // const response = await provider.chat({
        //     messages: [{ role: 'user', content: 'Hello, who are you?' }]
        // });
        // console.log('📥 Response:', response);

        // Test Streaming
        console.log('🌊 Testing Streaming...');
        process.stdout.write('📥 Stream: ');
        await provider.streamChat({
            messages: [{ role: 'user', content: 'Hello, who are you? Answer in 1 sentence.' }]
        }, (chunk) => {
            process.stdout.write(chunk);
        });
        console.log('\n✅ Stream Complete');

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

main();
