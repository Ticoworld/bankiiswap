// Test the updated Jupiter integration
const { 
  getTokenPrice, 
  validateTokenExists, 
  isTokenTradable, 
  validateTokenForTrading,
  getQuote 
} = require('./src/lib/jupiter.ts');

async function testUpdatedIntegration() {
  console.log('🚀 Testing Updated Jupiter Integration...\n');
  
  const problemTokens = [
    '94fzsMkuHAuFP4J8iMZS43euWr2CLtuvwLgyjPHyqcnY', // MEME (your token)
    'JD8FzFN2Z5AMaqxrB2q5aGKknVu5s1VSKU4VkCYQpump', // Problematic pump token
    '51aXwxgrWKRXJGwWVVgE3Jrs2tWKhuNadfsEt6j2pump'  // Working pump token
  ];
  
  const solMint = 'So11111111111111111111111111111111111111112';
  
  for (const token of problemTokens) {
    console.log(`\n🔍 Testing token: ${token.slice(0, 20)}...`);
    
    // Test 1: Price API
    const price = await getTokenPrice(token);
    console.log(`💰 Price: ${price ? `$${price}` : 'Not available'}`);
    
    // Test 2: Token exists
    const exists = await validateTokenExists(token);
    console.log(`📋 Exists in Jupiter: ${exists ? '✅' : '❌'}`);
    
    // Test 3: Trading eligibility
    const tradable = await isTokenTradable(solMint, token);
    console.log(`🔄 Tradable with SOL: ${tradable ? '✅' : '❌'}`);
    
    // Test 4: Full validation
    const validation = await validateTokenForTrading(solMint, token);
    console.log(`🛡️ Full validation: ${validation.canTrade ? '✅ Ready' : `❌ ${validation.message}`}`);
    
    // Test 5: Quote attempt (only if validation passes)
    if (validation.canTrade) {
      try {
        const quote = await getQuote(solMint, token, '50000000', 0.005); // 0.05 SOL, 0.5% slippage
        console.log(`📊 Quote: ${quote.outAmount} tokens (${quote.routePlan?.length || 0} routes)`);
      } catch (error) {
        console.log(`📊 Quote failed: ${error.message}`);
      }
    }
  }
  
  console.log('\n✨ Test complete!\n');
  
  // Summary and recommendations
  console.log('📋 SUMMARY & RECOMMENDATIONS:\n');
  console.log('1. Tokens with price data but no trading routes are likely:');
  console.log('   - New tokens without sufficient liquidity');
  console.log('   - Tokens with trading restrictions');
  console.log('   - Tokens that lost liquidity over time\n');
  
  console.log('2. Your MEME token (94fzs...) appears to have lost trading liquidity');
  console.log('   - Consider checking if pools still exist');
  console.log('   - May need to recreate liquidity or use different DEX\n');
  
  console.log('3. Use validateTokenForTrading() before showing tokens to users');
  console.log('4. Enhanced error messages will help users understand issues');
}

testUpdatedIntegration().catch(console.error);