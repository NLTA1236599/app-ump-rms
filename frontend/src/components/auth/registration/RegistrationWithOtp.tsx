import { useCallback, useEffect, useState } from 'react';
import { RegisterForm } from '../RegisterForm.js';
import {
  DEFAULT_OTP_TTL_SECONDS,
  type OtpDeliveryChannel,
  type RegistrationWizardStep,
} from './constants.js';
import { OtpStep } from './OtpStep.js';
import { SuccessStep } from './SuccessStep.js';
import type { RegisterSuccessPayload } from '../useRegisterFlow.js';

export type ResumeOtpRequest = {
  email: string;
  otpTtlSeconds?: number;
};

type RegistrationWithOtpProps = {
  onSwitchToLogin: () => void;
  /** When set (e.g. from unverified-login notice), jump straight to OTP step. */
  resumeOtp?: ResumeOtpRequest | null;
  onResumeConsumed?: () => void;
};

export function RegistrationWithOtp({
  onSwitchToLogin,
  resumeOtp,
  onResumeConsumed,
}: RegistrationWithOtpProps) {
  const [step, setStep] = useState<RegistrationWizardStep>('form');
  const [email, setEmail] = useState('');
  const [otpTtlSeconds, setOtpTtlSeconds] = useState(DEFAULT_OTP_TTL_SECONDS);
  const [otpDeliveryChannel, setOtpDeliveryChannel] = useState<OtpDeliveryChannel>('smtp');
  const [autoResendOnMount, setAutoResendOnMount] = useState(false);

  useEffect(() => {
    if (!resumeOtp?.email) return;
    setEmail(resumeOtp.email);
    setOtpTtlSeconds(resumeOtp.otpTtlSeconds ?? DEFAULT_OTP_TTL_SECONDS);
    setOtpDeliveryChannel('smtp');
    setAutoResendOnMount(true);
    setStep('otp');
    onResumeConsumed?.();
  }, [resumeOtp, onResumeConsumed]);

  const onRegistered = useCallback((payload: RegisterSuccessPayload) => {
    setEmail(payload.email);
    setOtpTtlSeconds(payload.otpTtlSeconds);
    setOtpDeliveryChannel(payload.otpDeliveryChannel);
    setAutoResendOnMount(false);
    setStep('otp');
  }, []);

  if (step === 'otp') {
    return (
      <OtpStep
        email={email}
        otpTtlSeconds={otpTtlSeconds}
        otpDeliveryChannel={otpDeliveryChannel}
        autoResendOnMount={autoResendOnMount}
        onVerified={() => setStep('success')}
        onBackToForm={() => {
          setAutoResendOnMount(false);
          setStep('form');
        }}
        onGoToLogin={onSwitchToLogin}
      />
    );
  }

  if (step === 'success') {
    return <SuccessStep email={email} onGoToLogin={onSwitchToLogin} />;
  }

  return <RegisterForm onSwitchToLogin={onSwitchToLogin} onRegistered={onRegistered} />;
}
