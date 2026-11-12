import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

const steps = [622, 634, 662, 719, 733, 945, 989, 1165, 1171, 1173, 8876, 8878, 8961, 10505, 10566, 11220, 11468];

rl.on("line", (line) => {
  for (const s of steps) {
    if (line.includes(`"step_index":${s},`)) {
      const data = JSON.parse(line);
      for (const tc of data.tool_calls || []) {
        if (tc.args && tc.args.Path && tc.args.Path.includes("invitation-preview-section")) {
          console.log(`\n================ STEP ${s} (${data.created_at}) ================`);
          console.log("TOOL:", tc.name);
          if (tc.name === "write_file") {
            console.log(tc.args.Content);
          } else if (tc.name === "edit_file") {
            console.log("TARGET:\n" + tc.args.Target);
            console.log("REPLACEMENT:\n" + tc.args.Replacement);
          }
        }
      }
    }
  }
});
