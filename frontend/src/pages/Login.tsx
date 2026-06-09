import React, { useState, useEffect, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';
import './Login.css';

// GraphQL Mutations
const TOKEN_AUTH = gql`
  mutation TokenAuth($username: String!, $password: String!, $captcha: String!) {
    tokenAuth(username: $username, password: $password, captcha: $captcha) {
      token
      requires2fa
      tempToken
      userEmail
    }
  }
`;

const VERIFY_OTP = gql`
  mutation VerifyOtp($tempToken: String!, $code: String!) {
    verifyOtp(tempToken: $tempToken, code: $code) {
      token
      userEmail
    }
  }
`;

interface LoginProps {
  onLoginSuccess: (token: string, email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Navigation / Auth Stage: 'login' | 'otp'
  const [stage, setStage] = useState<'login' | 'otp'>('login');
  
  // Credentials Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  // Captcha Generator State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  
  // OTP Verification State
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [tempToken, setTempToken] = useState('');
  
  // UI States
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Refs for OTP input elements to control focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Mutations
  const [tokenAuth, { loading: authLoading }] = useMutation(TOKEN_AUTH);
  const [verifyOtp, { loading: otpLoading }] = useMutation(VERIFY_OTP);

  // Generate random captcha on load or reset
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 9) + 1);
    setNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Set error and trigger shake animation
  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Handle credentials form submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password || !captchaInput) {
      triggerError('Por favor completa todos los campos.');
      return;
    }

    // Verify mathematical captcha in frontend first
    if (parseInt(captchaInput) !== num1 + num2) {
      triggerError('Captcha matemático incorrecto. Intenta de nuevo.');
      generateCaptcha();
      return;
    }

    try {
      const response = await tokenAuth({
        variables: {
          username,
          password,
          captcha: captchaInput,
        },
      });

      const data = response.data?.tokenAuth;
      if (!data) {
        triggerError('Error de autenticación. Inténtalo de nuevo.');
        return;
      }

      if (data.requires2fa) {
        setTempToken(data.tempToken);
        setStage('otp');
        setErrorMsg('');
        // Focus the first OTP box in the next tick
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 100);
      } else if (data.token) {
        onLoginSuccess(data.token, data.userEmail);
      } else {
        triggerError('Error en la respuesta del servidor.');
      }
    } catch (err: any) {
      triggerError(err.message || 'Error en las credenciales.');
      generateCaptcha();
    }
  };

  // Handle OTP Inputs key downs / values change
  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1); // Only keep the last character entered
    setOtpCode(newOtp);

    // Auto focus next field
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        // Clear previous field and focus it
        const newOtp = [...otpCode];
        newOtp[index - 1] = '';
        setOtpCode(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        // Clear current field
        const newOtp = [...otpCode];
        newOtp[index] = '';
        setOtpCode(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(Number(pasteData))) {
      const newOtp = pasteData.split('');
      setOtpCode(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  // Handle OTP code verification submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const fullCode = otpCode.join('');

    if (fullCode.length < 6) {
      triggerError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }

    try {
      const response = await verifyOtp({
        variables: {
          tempToken,
          code: fullCode,
        },
      });

      const data = response.data?.verifyOtp;
      if (data && data.token) {
        onLoginSuccess(data.token, data.userEmail);
      } else {
        triggerError('Código OTP inválido o vencido.');
      }
    } catch (err: any) {
      triggerError(err.message || 'Código OTP inválido o vencido.');
      // Clear OTP inputs on error
      setOtpCode(Array(6).fill(''));
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative blurred background circles */}
      <div className="login-bg-sphere sphere-1"></div>
      <div className="login-bg-sphere sphere-2"></div>
      <div className="login-bg-sphere sphere-3"></div>

      <div className={`login-card ${shake ? 'shake-animation' : ''}`}>
        
        {stage === 'login' ? (
          <>
            <div className="login-header">
              <span className="login-logo">🏛️</span>
              <h1>Activos Fijos</h1>
              <p>Inicia sesión para acceder al sistema administrativo</p>
            </div>

            {errorMsg && (
              <div className="error-badge">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="input-wrapper">
                <label className="input-label">Usuario (Correo Electrónico)</label>
                <div className="input-field-container">
                  <span className="input-icon">👤</span>
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario@uagrm.edu.bo"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Contraseña</label>
                <div className="input-field-container">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="login-input"
                    required
                  />
                </div>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Verificación de Seguridad</label>
                <div className="captcha-container">
                  <div className="captcha-challenge">
                    {num1} + {num2} = ?
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Suma"
                    className="captcha-input"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={authLoading}
              >
                {authLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="login-header">
              <span className="login-logo">🔑</span>
              <h1>Verificación OTP</h1>
              <p>Ingresa el código de 6 dígitos enviado o de tu app autenticadora</p>
            </div>

            {errorMsg && (
              <div className="error-badge">
                <span>⚠️</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="login-form">
              <div className="otp-container">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    required
                  />
                ))}
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={otpLoading}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                }}
              >
                {otpLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span>Verificar Código</span>
                    <span>✓</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setStage('login');
                  setErrorMsg('');
                  setOtpCode(Array(6).fill(''));
                }}
              >
                ← Volver a ingresar datos
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
