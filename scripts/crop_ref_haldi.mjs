import sharp from 'sharp';
import path from 'path';

const ARTIFACT_DIR = "C:/Users/Rabin Gorain/.gemini/antigravity/brain/2391ac95-fb5b-46c4-adf4-615015ea333c";
const REF_PATH = "images/digita-invitation-card-reference.png";

async function cropRefHaldi() {
  const refMeta = await sharp(REF_PATH).metadata();
  console.log("Ref dimensions:", refMeta.width, refMeta.height);

  const haldi = await sharp(REF_PATH)
    .extract({
      left: Math.round(refMeta.width * 0.05),
      top: Math.round(refMeta.height * 0.52),
      width: Math.round(refMeta.width * 0.45),
      height: Math.round(refMeta.height * 0.13)
    })
    .toBuffer();

  await sharp(haldi).toFile(path.join(ARTIFACT_DIR, "ref_haldi_crop.png"));
  console.log("Saved ref_haldi_crop.png");
}

cropRefHaldi();
