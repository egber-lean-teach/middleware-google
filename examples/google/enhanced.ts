import { GoogleAiReveniumMiddleware } from "../../packages/google/src";

const googleAIReveniumMiddleware = new GoogleAiReveniumMiddleware();
const model = googleAIReveniumMiddleware.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

const googleAIEnhancedExample = async () => {
  try {
    const result = await model.generateContent(
      "Analyze this quarterly report for key insights"
    );

    console.log(
      `✅ Enhanced response: ${result?.response.text().substring(0, 100)}...`
    );
    if (!result) {
      console.log("❌ No result received from generateContent");
      return false;
    }
    console.log("🎯 Enhanced tracking with metadata successful!");
  } catch (error: any) {
    console.log(
      `❌ Google AI streaming test failed: ${error.message || error}`
    );
    console.error(error);
    return false;
  }
};

googleAIEnhancedExample();
