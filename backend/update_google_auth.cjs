const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/controllers/auth.controller.ts');
let content = fs.readFileSync(filePath, 'utf8');

const importStatement = `import { OAuth2Client } from 'google-auth-library';\n`;
if (!content.includes('OAuth2Client')) {
    content = importStatement + content;
}

const googleAuthRegex = /export const googleAuth = async \(req: Request, res: Response, next: NextFunction\) => \{[\s\S]*?(?=export const)/;

const newGoogleAuth = `export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next(new AppError('Google credential is required', 400));
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "1058888702511-73ndeh0hvtkpge1ulhed049mdom0h8mc.apps.googleusercontent.com");
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID || "1058888702511-73ndeh0hvtkpge1ulhed049mdom0h8mc.apps.googleusercontent.com", 
      });
    } catch (err) {
      return next(new AppError('Invalid Google token', 401));
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new AppError('Google authentication failed', 401));
    }

    const { email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername || \`google_\${Date.now()}\`;
      
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = \`\${username}_\${Math.floor(100 + Math.random() * 900)}\`;
      }

      const { salt, hash } = hashPassword(\`google_\${Date.now()}_\${Math.random()}\`);

      user = await User.create({
        username,
        email: cleanEmail,
        name: name || 'Google User',
        passwordHash: hash,
        passwordSalt: salt,
        role: 'user',
        isVerified: false,
        farmName: \`ซุ้ม \${name || 'สมาร์ทฟาร์ม'}\`,
        profileImage: picture || ''
      });
    }

    const token = createToken({ id: user._id, role: user.role }, getJwtSecret());

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

`;

content = content.replace(googleAuthRegex, newGoogleAuth);
fs.writeFileSync(filePath, content);
console.log('Updated googleAuth in auth.controller.ts');
