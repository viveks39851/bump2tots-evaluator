const { google } = require('googleapis');

const CREDENTIALS = {
    type: "service_account",
    project_id: "bump2tots-evaluator",
    private_key_id: "793d766ee404df55c97b559aaabc0023a2cddd42",
    private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: "id-bump2tots-evaluator@bump2tots-evaluator.iam.gserviceaccount.com",
    client_id: "116960397266797279873",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/id-bump2tots-evaluator%40bump2tots-evaluator.iam.gserviceaccount.com"
};

const MAIN_FOLDER_ID = '1ForkYtMiAmwsqbHAwjAQLwYZwLR51I22';
const RESULTS_FOLDER_NAME = 'Results';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { filename, csv } = req.body;

        if (!filename || !csv) {
            return res.status(400).json({ error: 'Missing filename or csv' });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        // Find or create Results folder
        let resultsFolderId = null;
        const folderQuery = await drive.files.list({
            q: `name='${RESULTS_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${MAIN_FOLDER_ID}' in parents and trashed=false`,
            spaces: 'drive',
            fields: 'files(id, name)',
            pageSize: 1
        });

        if (folderQuery.data.files && folderQuery.data.files.length > 0) {
            resultsFolderId = folderQuery.data.files[0].id;
        } else {
            const folderRes = await drive.files.create({
                requestBody: {
                    name: RESULTS_FOLDER_NAME,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [MAIN_FOLDER_ID]
                },
                fields: 'id'
            });
            resultsFolderId = folderRes.data.id;
        }

        const fileRes = await drive.files.create({
            requestBody: {
                name: filename,
                mimeType: 'text/csv',
                parents: [resultsFolderId]
            },
            media: {
                mimeType: 'text/csv',
                body: csv
            },
            fields: 'id, webViewLink'
        });

        res.status(200).json({
            success: true,
            fileId: fileRes.data.id,
            link: fileRes.data.webViewLink,
            filename: filename
        });

    } catch (error) {
        console.error('Save results error:', error);
        res.status(500).json({ error: error.message });
    }
};
