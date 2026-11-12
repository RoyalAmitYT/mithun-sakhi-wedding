import sharp from 'sharp';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c";
const REF_PATH = "images/digita-invitation-card-reference.png";
const CARD_PATH = path.join(ARTIFACT_DIR, "invitation_card_standalone.png");

async function cropDetails() {
  const curMeta = await sharp(CARD_PATH).metadata();
  console.log("Current card dimensions:", curMeta.width, curMeta.height);

  // Haldi card crop from current implementation
  // Card is roughly at x ~ 30-330, y ~ 430-540 in 672x840
  const curHaldi = await sharp(CARD_PATH)
    .extract({
      left: Math.round(curMeta.width * 0.04),
      top: Math.round(curMeta.height * 0.52),
      width: Math.round(curMeta.width * 0.45),
      height: Math.round(curMeta.height * 0.14)
    })
    .toBuffer();

  await sharp(curHaldi).toFile(path.join(ARTIFACT_DIR, "crop_haldi_card_refined.png"));

  // Message crop from current implementation
  const curMsg = await sharp(CARD_PATH)
    .extract({
      left: Math.round(curMeta.width * 0.08),
      top: Math.round(curMeta.height * 0.22),
      width: Math.round(curMeta.width * 0.84),
      height: Math.round(curMeta.height * 0.12)
    })
    .toBuffer();

  await sharp(curMsg).toFile(path.join(ARTIFACT_DIR, "crop_message_refined.png"));

  console.log("Crops saved successfully!");
}

cropDetails();
