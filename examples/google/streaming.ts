import { GoogleAiReveniumMiddleware } from "../../packages/google/src";

const googleAIReveniumMiddleware = new GoogleAiReveniumMiddleware();
const model = googleAIReveniumMiddleware.getGenerativeModel({
  model: "gemini-2.0-flash-001",
});

const googleAIStreamingExample = async () => {
  try {
    const result = await model.generateContentStream("what is php");

    if (!result) {
      console.log("❌ No result received from generateContentStream");
      return false;
    }

    if (!result.stream) {
      console.log("❌ No stream property found in result");
      return false;
    }

    console.log("📝 Streaming response:");
    let fullText = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      process.stdout.write(text);
      fullText += text;
    }
    console.log("\n");
    if (fullText.length > 0) {
      console.log("✅ Streaming with metering successful!");
      return true;
    } else {
      console.log("❌ No streaming content received");
      return false;
    }
  } catch (error: any) {
    console.log(
      `❌ Google AI streaming test failed: ${error.message || error}`
    );
    console.error(error);
    return false;
  }
};

googleAIStreamingExample();
