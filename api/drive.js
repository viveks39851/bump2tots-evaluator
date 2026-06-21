const { google } = require('googleapis');

const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "bump2tots-evaluator",
  private_key_id: "793d766ee404df55c97b559aaabc0023a2cddd42",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDezMTcpZ4UcNek\nS8e63Mzc0d7K6/X2a5FY5VzUeTeNY48+4Ro3i3mqFsDn4fk2KwiluYqtO0xzm57J\nnScG3k33kRoGhyqUqbeULCtW0PVVdpkSuvqCEJuEfk0xCF0vr6sGJrJabnXkLM6O\nn5i80pgwn/y3aZiF3/6l8y/akieWCTVq+uPkg2XeM+bWYnpSySrvihneP4VumxyN\nM6I1HPuC6FLuSFAFkuEzaVx9sOElU4Nr/WaP70wLbK5IdFHrcb2UNzy62PgZFwRi\ndQDuTrvd19sAooNss8XwcheYQ/Ei5isnRIHdVsjB9//YJpcjajhqk3KS/I5+xDgL\nLu8pfQJ9AgMBAAECggEAaWqooJ+qHpDPrzh9za/ILJkOWaPwkkIOGOoZFJ0wCDF5\npu46Cdrv22b9qhmU4SjWZBdYgqOChla0+D7npsvLRx48GqecoY91wWFuthqTYfcF\n8UNP4Pd7peJeopsLAFOVT4lCrSADns0GhJwF2B2qjaM9HwkS9hDoO1vHohqyKT3b\nLKW6WuRE/6icfCn7VOFwMUqGra/vVSJ44IWkZp+ZdnyS9aDoiCdmMVT3effRIk+P\n3axRPvzzmvdkyz9ifpX/hneV7JI7T1z0z+WJayCjPdoo1vCpLEg+Ny97pCR5/Fz4\n4fW0islaRMiglO/+IzqIm6yQSs+zYTKgcOGGcm6yDwKBgQDvrBhFNHEh6Z2fDKus\nozpk0qReoa4o/F7FdtkTY8AvMdcjWdpdAd8XdIBNgOCV6lLNbDlCPCcDMX5BJwAo\nJCCOlogef/cwIpdcU8bkU8MGYdXsqeCYzytutFi0/7lwp58FO10D2aeZCpQv/MGC\nXUIw17WvtmD2OStmok0YrencRwKBgQDt+msqqwN+GxIO9xJcPnN1fjtB8uibtsf2\nUjVImI3oMy5KyP27IWQGom5BTZYC3glmEZBtoMUr3rcxXaMXX11Aq8kcxHat+Qwp\nFqXxs3lCHz8FuP5GELn5guliGoYElowT8e81D+QySXPPBL1BsSkTRkrTIHAAqtRb\nkgmh2BWBGwKBgB4mE9eAxUpyzLUZLu9EiS/tn2eYBwR42qMUVDIwNhi5uEpmHyXb\n+mhE627Ua2vwUgItPvaqAm5QZ4Vilo52HPJS1USg7ENN1qRylW5bawj+fZ6LsAkI\n5nnCjfYWxQj6zPIniYfWdVK3FfUDYoQ3nv/t4pj75C6U+nSqrfAQ0H45AoGAViOw\nqs8gAoN18+jGwpDwZfT9Kg/s1oBAvQ5grxhZNVVhSjyaayPY+vXMhuK4i+0m5cUx\nzBzHgeupz7qfEBS6wm/r6ffLJYniNvU1t9lI6QA6Za3ijCX9yyzxoUsMe5iqt4V5\nGnHYHcOsoaCLiL3BqnJlHyq8n+E14LdpuSVoE0UCgYEAsfqbVYf4XiaxfasUmOor\nwU9aWT97m/r96l/4bTQYql3FbRYbZD+MeTnb75ODG75F5mIYTkSVcN4l9wOBz7np\nCpNZ0qo233vS0AoO+tbsLRdAxnHNkjFVRR0jYPe72a2PIilWdE1K9BFAKLcl4Yse\n1BN3XxeWrFZ2fzuGpeh2VaY=\n-----END PRIVATE KEY-----\n",
  client_email: "id-bump2tots-evaluator@bump2tots-evaluator.iam.gserviceaccount.com",
  client_id: "115932379907880959038",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/id-bump2tots-evaluator%40bump2tots-evaluator.iam.gserviceaccount.com"
};

const FOLDER_ID = "1ForkYtMiAmwsqbHAwjAQLwYZwLR51I22";
const CSV_FILENAME = "all-AI-Answer-ComparisonVVS.csv";

let authClient = null;

async function getAuthClient() {
  if (authClient) return authClient;
  authClient = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ['https://www.googleapis.com/auth/drive']
  );
  await authClient.authorize();
  return authClient;
}

async function getFileIdByName(fileName) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  
  const res = await drive.files.list({
    q: `name='${fileName}' and '${FOLDER_ID}' in parents and trashed=false`,
    spaces: 'drive',
    fields: 'files(id, name)',
  });
  
  if (res.data.files.length === 0) {
    throw new Error(`File ${fileName} not found`);
  }
  return res.data.files[0].id;
}

async function readCSV() {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  
  const fileId = await getFileIdByName(CSV_FILENAME);
  
  const res = await drive.files.get({
    fileId: fileId,
    alt: 'media'
  }, { responseType: 'stream' });
  
  return new Promise((resolve, reject) => {
    let data = '';
    res.data.on('data', chunk => { data += chunk; });
    res.data.on('end', () => { resolve(data); });
    res.data.on('error', reject);
  });
}

async function saveResults(fileName, csvContent) {
  const auth = await getAuthClient();
  const drive = google.drive({ version: 'v3', auth });
  
  const resultsFolder = FOLDER_ID;
  
  const folderRes = await drive.files.list({
    q: `name='Results' and '${FOLDER_ID}' in parents and trashed=false and mimeType='application/vnd.google-apps.folder'`,
    spaces: 'drive',
    fields: 'files(id)',
  });
  
  const resultsFolderId = folderRes.data.files[0]?.id || FOLDER_ID;
  
  const fileRes = await drive.files.list({
    q: `name='${fileName}' and '${resultsFolderId}' in parents and trashed=false`,
    spaces: 'drive',
    fields: 'files(id)',
  });
  
  if (fileRes.data.files.length > 0) {
    await drive.files.update({
      fileId: fileRes.data.files[0].id,
      media: {
        mimeType: 'text/csv',
        body: csvContent
      }
    });
  } else {
    await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'text/csv',
        parents: [resultsFolderId]
      },
      media: {
        mimeType: 'text/csv',
        body: csvContent
      }
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const csv = await readCSV();
      return res.status(200).json({ csv });
    }

    if (req.method === 'POST') {
      const { fileName, csvContent } = req.body;
      await saveResults(fileName, csvContent);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
