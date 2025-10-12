// npm install @google-cloud/ai-generativelanguage
// npm install textwrap
// npm install jimp

const { GenerativeLanguageServiceClient } = require('@google-cloud/ai-generativelanguage');
const textwrap = require('textwrap');
const Jimp = require('jimp');

// Configure the API key
const client = new GenerativeLanguageServiceClient({
  keyFilename: 'path/to/your/service-account-file.json'
});

async function listModels() {
  const [models] = await client.listModels();
  models.forEach(model => {
    if (model.supportedGenerationMethods.includes('generateContent')) {
      console.log(model.name);
    }
  });
}

async function generateContent() {
  const model = 'models/gemini-1.5-flash';
  const prompt = "Can you tell me the food name and weight of the food about the image?";

  const [response] = await client.generateContent({
    model,
    prompt
  });

  console.log(toMarkdown(response.text));
}

function toMarkdown(text) {
  text = text.replace('•', '  *');
  return textwrap.indent(text, '> ', () => true);
}

async function displayImage() {
  const imagePath = './images_test/grapes-2032838_1920.jpg';
  const image = await Jimp.read(imagePath);
  image.getBase64(Jimp.MIME_JPEG, (err, src) => {
    if (err) throw err;
    console.log(`<img src="${src}" />`);
  });
}

async function main() {
  await listModels();
  await generateContent();
  await displayImage();
}

main().catch(console.error);