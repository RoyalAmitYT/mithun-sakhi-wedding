import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes("invitation-card-traditional.tsx") && line.includes("write_file")) {
    const data = JSON.parse(line);
    console.log(`\n================ TRADITIONAL (Step ${data.step_index}) ================`);
    for (const tc of data.tool_calls || []) {
      if (tc.args && tc.args.Path && tc.args.Path.includes("invitation-card-traditional.tsx")) {
        console.log(tc.args.Content);
      }
    }
  }
});
