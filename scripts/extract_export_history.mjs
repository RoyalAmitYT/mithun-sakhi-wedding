import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  if (line.includes("invitation-export.ts") && line.includes("write_file")) {
    try {
      const data = JSON.parse(line);
      console.log(`STEP INDEX: ${data.step_index}`);
      for (const tc of data.tool_calls) {
        if (tc.args?.Path?.includes("invitation-export.ts")) {
          fs.writeFileSync(`scripts/recovered_export_${data.step_index}.txt`, tc.args.Content);
          console.log(`Saved export to scripts/recovered_export_${data.step_index}.txt`);
        }
      }
    } catch {}
  }
});
