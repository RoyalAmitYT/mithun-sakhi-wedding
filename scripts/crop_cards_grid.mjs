import sharp from 'sharp';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c";
const CARD_PATH = path.join(ARTIFACT_DIR, "invitation_card_standalone.png");

async function cropCards() {
  const meta = await sharp(CARD_PATH).metadata();
  // 4 cards are located between y ~ 440 and y ~ 690
  const ceremonyGrid = await sharp(CARD_PATH)
    .extract({
      left: Math.round(meta.width * 0.04),
      top: Math.round(meta.height * 0.525),
      width: Math.round(meta.width * 0.92),
      height: Math.round(meta.height * 0.28)
    })
    .toBuffer();

  await sharp(ceremonyGrid).toFile(path.join(ARTIFACT_DIR, "crop_all_ceremonies_refined.png"));
  console.log("Ceremonies crop saved!");
}

cropCards();
