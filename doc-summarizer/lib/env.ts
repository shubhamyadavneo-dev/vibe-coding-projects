const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY?.trim());

if (process.env.NODE_ENV !== "test") {
  console.info(
    JSON.stringify({
      type: "startup_env_validation",
      timestamp: new Date().toISOString(),
      openAiKeyConfigured: hasOpenAIKey,
    }),
  );
}

export const env = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

