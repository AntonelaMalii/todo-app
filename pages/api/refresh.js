import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const session = req.cookies.mcp_session;

  if (!session) {
    return res.status(401).json({ error: 'No session' });
  }

  try {
    const payload = jwt.verify(session, process.env.MCP_SECRET);

    const newToken = jwt.sign(
      { user_id: payload.user_id, role: payload.role },
      process.env.MCP_SECRET,
      { expiresIn: '1h' }
    );

    res.setHeader(
      'Set-Cookie',
      `mcp_session=${newToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`
    );
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Session expired' });
  }
}
