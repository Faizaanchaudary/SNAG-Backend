export const passwordResetEmailTemplate = (code: string, expiryMinutes: number): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #1a73e8;">Reset your password</h2>
    <p>Use the code below to reset your SNAG account password. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a73e8; padding: 16px 0;">
      ${code}
    </div>
    <p style="color: #888; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
  </div>
`;

export const otpEmailTemplate = (code: string, expiryMinutes: number): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #1a73e8;">Verify your email</h2>
    <p>Use the code below to verify your SNAG account. It expires in <strong>${expiryMinutes} minutes</strong>.</p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a73e8; padding: 16px 0;">
      ${code}
    </div>
    <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;
