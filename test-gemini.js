const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test the Gemini API integration with different models
async function testGeminiAPI() {
  const API_KEY = "AIzaSyB8lCAkJIHdukBB5zlZfiEnLpAbZn90VnQ";
  
  const modelsToTry = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
    "gemini-1.0-flash"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTesting model: ${modelName}...`);
      
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = "Hello! Please respond with 'Gemini API is working correctly' if you can see this message.";
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('✅ Gemini API Response:', text);
      console.log(`✅ Model "${modelName}" is working correctly!`);
      console.log(`\n🎉 Use "${modelName}" in your application!`);
      return modelName; // Return the working model name
      
    } catch (error) {
      console.error(`❌ Model "${modelName}" failed:`, error.message);
    }
  }
  
  console.error('\n❌ All models failed! Please check your API key and region.');
  return null;
}

testGeminiAPI(); 