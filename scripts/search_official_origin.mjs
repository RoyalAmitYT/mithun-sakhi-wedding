import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes("official-wedding-invitation.tsx") && line.includes("write_file")) {
    const data = JSON.parse(line);
    console.log(`STEP: ${data.step_index} | Date: ${data.created_at}`);
  }
});
