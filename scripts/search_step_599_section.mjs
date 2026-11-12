import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes('"step_index":599,')) {
    const data = JSON.parse(line);
    const content = data.content;
    const lines = content.split("\n");
    let capturing = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("Invitation") || lines[i].includes("Section G") || lines[i].includes("Patra")) {
        console.log(`--- Match around line ${i} ---`);
        for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 25); j++) {
          console.log(lines[j]);
        }
      }
    }
  }
});
