// Test script to validate Jupiter API fixes
const axios = require('axios');

const JUPITER_BASE_URL = 'https://lite-api.jup.ag';

// Test tokens
const TEST_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  MEME: '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY',
  PUMP_TOKEN_1: 'JD8FzFN2Z5AMaqxrB2q5aGKknVu5s1VSKU4VkCYQpump',
  PUMP_TOKEN_2: '51aXwxgrWKRXJGwWVVgE3Jrs2tWKhuNadfsEt6j2pump'
};

// Test Price API v3
async function testPriceAPI() {
  console.log('\n🔍 Testing Price API v3...\n');
  
  for (const [name, mint] of Object.entries(TEST_TOKENS)) {
    try {
      const response = await axios.get(`${JUPITER_BASE_URL}/price/v3?ids=${mint}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      const tokenData = response.data?.[mint];
      if (tokenData?.usdPrice) {
        console.log(`✅ ${name}: $${tokenData.usdPrice} (Block: ${tokenData.blockId})`);
      } else {
        console.log(`❌ ${name}: No price data available`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.response?.status || error.message}`);
    }
  }
}

// Test Token API v2 Search
async function testTokenAPI() {
  console.log('\n🔍 Testing Token API v2 Search...\n');
  
  for (const [name, mint] of Object.entries(TEST_TOKENS)) {
    try {
      const response = await axios.get(`${JUPITER_BASE_URL}/tokens/v2/search?query=${mint}`, {
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const token = response.data[0];
        console.log(`✅ ${name}: ${token.name} (${token.symbol}) - Organic Score: ${token.organicScore?.toFixed(2) || 'N/A'}`);
      } else {
        console.log(`❌ ${name}: Token not found in search`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.response?.status || error.message}`);
    }
  }
}

// Test Quote API
async function testQuoteAPI() {
  console.log('\n🔍 Testing Quote API...\n');
  
  const testPairs = [
    { from: 'SOL', to: 'USDC', amount: '100000000' }, // 0.1 SOL
    { from: 'USDC', to: 'SOL', amount: '10000000' }, // 10 USDC
    { from: 'SOL', to: 'BONK', amount: '50000000' }, // 0.05 SOL
    { from: 'SOL', to: 'MEME', amount: '50000000' }, // 0.05 SOL to MEME
    { from: 'SOL', to: 'PUMP_TOKEN_1', amount: '50000000' }, // 0.05 SOL to pump token
    { from: 'SOL', to: 'PUMP_TOKEN_2', amount: '50000000' }, // 0.05 SOL to pump token
  ];
  
  for (const pair of testPairs) {
    const inputMint = TEST_TOKENS[pair.from];
    const outputMint = TEST_TOKENS[pair.to];
    
    try {
      const params = {
        inputMint,
        outputMint,
        amount: pair.amount,
        slippageBps: 50, // 0.5%
        onlyDirectRoutes: false,
        maxAccounts: 64,
        swapMode: 'ExactIn',
        restrictIntermediateTokens: true,
      };
      
      const response = await axios.get(`${JUPITER_BASE_URL}/swap/v1/quote`, {
        params,
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      const quote = response.data;
      console.log(`✅ ${pair.from} → ${pair.to}: ${quote.outAmount} (${quote.routePlan?.length || 0} routes)`);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      console.log(`❌ ${pair.from} → ${pair.to}: ${errorMsg}`);
    }
  }
}

// Test Recent Tokens
async function testRecentTokens() {
  console.log('\n🔍 Testing Recent Tokens...\n');
  
  try {
    const response = await axios.get(`${JUPITER_BASE_URL}/tokens/v2/recent?limit=10`, {
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log(`Found ${response.data.length} recent tokens:`);
      response.data.slice(0, 5).forEach((token, i) => {
        console.log(`${i + 1}. ${token.name} (${token.symbol}) - ${token.id}`);
        console.log(`   Organic Score: ${token.organicScore?.toFixed(2) || 'N/A'} | Created: ${token.firstPool?.createdAt || 'N/A'}`);
      });
    } else {
      console.log('No recent tokens found');
    }
  } catch (error) {
    console.log(`❌ Recent tokens: ${error.response?.status || error.message}`);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Testing Jupiter API v1 with updated endpoints...\n');
  
  await testPriceAPI();
  await testTokenAPI();
  await testQuoteAPI();
  await testRecentTokens();
  
  console.log('\n✨ Test complete! Check results above to see which tokens are supported.\n');
}

runTests().catch(console.error);