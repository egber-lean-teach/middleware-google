import { GoogleAiReveniumMiddleware } from "../../packages/google/src";

const googleAIReveniumMiddleware = new GoogleAiReveniumMiddleware();
const model = googleAIReveniumMiddleware.getGenerativeModel({
  model: "text-embedding-004",
});

const googleAIEmbeddingExample = async () => {
  try {
    const result = await model.embedContent("what is the universe");
    console.log(
      `✅ Generated ${result?.embedding.values.length} dimensional embedding`
    );
    console.log(
      "⚠️  Note: Token counts will be 0 due to Google AI SDK limitations"
    );
  } catch (error: any) {
    console.log("❌ Google AI embedding test failed:", error);
  }
};

googleAIEmbeddingExample();
