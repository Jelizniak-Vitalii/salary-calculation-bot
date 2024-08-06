import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname('');
// const dataDir = path.join(__dirname);
const dataDir = '/app/data';
const telegramDataFileName = 'telegram-data.json';

export const updateCurrency = async (currency) => {
  return await fs.promises.writeFile(
    path.join(dataDir, telegramDataFileName),
    JSON.stringify({
      ...await getCurrency(),
      ...currency
    }),
    'utf-8'
  );
};

export const getCurrency = async () =>
  JSON.parse(await fs.promises.readFile(path.join(dataDir, telegramDataFileName), 'utf-8'));
