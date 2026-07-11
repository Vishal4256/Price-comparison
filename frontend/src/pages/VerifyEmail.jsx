import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
        
        // Auto redirect to dashboard after 3 seconds if logged in, or login if not
        setTimeout(() => {
          navigate(localStorage.getItem('token') ? '/dashboard' : '/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired verification link.');
      }
    };
    
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center animate-fadeIn border border-gray-100">
          {status === 'verifying' && (
            <div className="py-8">
              <div className="w-16 h-16 border-4 border-[#0B1E36] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-[#0B1E36] mb-2">Verifying your email...</h2>
              <p className="text-slate-500">Please wait while we confirm your email address.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8 animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B1E36] mb-2">Email Verified!</h2>
              <p className="text-slate-500 mb-8">{message}</p>
              <p className="text-sm text-slate-400 mb-4">Redirecting you shortly...</p>
              <Link to="/dashboard" className="inline-block bg-[#0B1E36] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1a365d] transition-colors shadow-lg hover:shadow-xl w-full">
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8 animate-fadeIn">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#0B1E36] mb-2">Verification Failed</h2>
              <p className="text-slate-500 mb-8">{message}</p>
              <Link to="/dashboard" className="inline-block bg-[#0B1E36] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#1a365d] transition-colors shadow-lg hover:shadow-xl w-full">
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
