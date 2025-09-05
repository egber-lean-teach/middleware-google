import { GoogleAiReveniumMiddleware } from "../../packages/google/src";

const googleAIReveniumMiddleware = new GoogleAiReveniumMiddleware();
const model = googleAIReveniumMiddleware.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

const googleAIBasicExample = async () => {
  try {
    console.log("Google AI basic test started");
    const response = await model.generateContent("what is php");
    console.log("response:", response?.response.text());
  } catch (error: any) {
    console.log("❌ Google AI basic test failed:", error);
  }
};

googleAIBasicExample();
