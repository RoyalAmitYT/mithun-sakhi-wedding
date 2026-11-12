import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes('"step_index":622,')) {
    const data = JSON.parse(line);
    for (const tc of data.tool_calls || []) {
      console.log("Path:", tc.args.Path);
      console.log("================ CONTENT ================");
      console.log(tc.args.Content);
      console.log("=========================================");
    }
  }
});
