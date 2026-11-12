import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity,
});

let found = 0;

rl.on("line", (line) => {
  if (line.includes("invitation-card-cinematic.tsx") && (line.includes("write_file") || line.includes("edit_file"))) {
    try {
      const data = JSON.parse(line);
      console.log(`\n========================================`);
      console.log(`STEP INDEX: ${data.step_index}`);
      if (data.tool_calls) {
        for (const tc of data.tool_calls) {
          if (tc.args && tc.args.Path && tc.args.Path.includes("invitation-card-cinematic.tsx")) {
            console.log(`TOOL: ${tc.name}`);
            if (tc.name === "write_file") {
              fs.writeFileSync(`scripts/recovered_step_${data.step_index}.txt`, tc.args.Content);
              console.log(`Saved write_file content to scripts/recovered_step_${data.step_index}.txt`);
            } else if (tc.name === "edit_file") {
              console.log("Target:", tc.args.Target);
              console.log("Replacement:", tc.args.Replacement);
            }
          }
        }
      }
      found++;
    } catch (e) {
      console.error("Parse error:", e.message);
    }
  }
});

rl.on("close", () => {
  console.log(`\nDone. Found ${found} occurrences.`);
});
