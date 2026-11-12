import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes("Digital Invitation Preview") || line.includes("Digital Invitation preview") || line.includes("digital invitation preview")) {
    const data = JSON.parse(line);
    if (data.source === "USER_INPUT" || data.type === "USER_INPUT") {
      console.log(`\n================ USER INPUT (Step ${data.step_index}, ${data.created_at}) ================`);
      console.log(data.content);
    }
  }
});
