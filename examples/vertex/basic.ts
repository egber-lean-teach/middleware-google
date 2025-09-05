import { VertexAIReveniumMiddleware } from "../../packages/vertex/src/";

const vertexAIReveniumMiddleware = new VertexAIReveniumMiddleware();
const model = vertexAIReveniumMiddleware.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

const vertexAIBasicExample = async () => {
  try {
    console.log("Google AI basic test started");
    const result = await model.generateContent("what is the universe");
    console.log(
      "result:",
      result?.response.candidates?.[0]?.content?.parts?.[0]?.text
    );
  } catch (error: any) {
    console.log("❌ Google AI basic test failed:", error);
  }
};

vertexAIBasicExample();
