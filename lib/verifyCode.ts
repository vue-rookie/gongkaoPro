import VerificationCode from '@/models/VerificationCode';

interface VerifyCodeResult {
  success: boolean;
  message: string;
}

/**
 * Verify a verification code
 * @param email - User's email address
 * @param code - Verification code to verify
 * @param type - Type of verification (register or reset_password)
 * @returns Result object with success status and message
 */
export async function verifyCode(
  email: string,
  code: string,
  type: 'register' | 'reset_password'
): Promise<VerifyCodeResult> {
  try {
    // Find the verification code
    const verificationCode = await VerificationCode.findOne({ email, type } as any);

    if (!verificationCode) {
      return { success: false, message: '验证码不存在或已过期' };
    }

    // Check if already used
    if (verificationCode.used) {
      return { success: false, message: '验证码已被使用' };
    }

    // Check attempt limit (max 5 attempts)
    if (verificationCode.attempts >= 5) {
      return { success: false, message: '验证码尝试次数过多，请重新获取' };
    }

    // Verify the code
    if (verificationCode.code !== code) {
      // Increment attempts
      verificationCode.attempts += 1;
      await verificationCode.save();
      return { success: false, message: '验证码错误' };
    }

    // Mark as used
    verificationCode.used = true;
    await verificationCode.save();

    return { success: true, message: '验证成功' };
  } catch (error) {
    console.error('Error verifying code:', error);
    return { success: false, message: '验证失败，请稍后重试' };
  }
}
