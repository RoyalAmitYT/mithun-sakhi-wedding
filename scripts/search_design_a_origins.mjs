import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes("Design Edition A") || line.includes("Design A") || line.includes("invitation-card-cinematic") || line.includes("invitation-studio")) {
    if (line.includes("write_file") || line.includes("edit_file")) {
      const data = JSON.parse(line);
      console.log(`STEP: ${data.step_index} | Date: ${data.created_at}`);
      for (const tc of data.tool_calls || []) {
        if (tc.args && tc.args.Path) {
          console.log(`  Path: ${tc.args.Path}`);
        }
      }
    }
  }
});
