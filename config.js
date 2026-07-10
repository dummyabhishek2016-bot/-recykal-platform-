// Serves the Apps Script webhook URL to the frontend securely
export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const url = process.env.APPS_SCRIPT_URL || '';
  res.status(200).json({ webhookUrl: url });
}
