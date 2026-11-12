import fs from "node:fs";
import readline from "node:readline";

const logPath = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c/.system_generated/logs/transcript_full.jsonl";
const rl = readline.createInterface({ input: fs.createReadStream(logPath), crlfDelay: Infinity });

rl.on("line", (line) => {
  if (line.includes("invitation-preview-section") && line.includes("InvitationCardCinematic")) {
    console.log("FOUND InvitationCardCinematic in invitation-preview-section:", line.slice(0, 200));
  }
});

rl.on("close", () => {
  console.log("Check complete.");
});
