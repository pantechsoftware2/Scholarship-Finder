import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  // TEMP: hard‑code the key you were given to test it
  const genAI = new GoogleGenerativeAI("AIzaSyBMoODAhZMoz8DBndtyp0qLTqPL8M6qVZE");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in one sentence.");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("ERROR:", err?.response?.data ?? err?.message ?? err);
  }
}

main();
