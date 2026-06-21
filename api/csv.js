const { google } = require('googleapis');

const CREDENTIALS = {
    type: "service_account",
    project_id: "bump2tots-evaluator",
    private_key_id: "793d766ee404df55c97b559aaabc0023a2cddd42",
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: "id-bump2tots-evaluator@bump2tots-evaluator.iam.gserviceaccount.com",
    client_id: "116960397266797279873",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/id-bump2tots-evaluator%40bump2tots-evaluator.iam.gserviceaccount.com"
};

const FILE_ID = '1CXCLNDqMZe3qwYDsfhc4nnz1FEn5z9rE';

module.exports = async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        const file = await drive.files.get(
            { fileId: FILE_ID, alt: 'media' },
            { responseType: 'stream' }
        );

        res.setHeader('Content-Type', 'text/csv');
        file.data.pipe(res);
    } catch (error) {
        console.error('CSV fetch error:', error);
        res.status(500).json({ error: error.message });
    }
};
