import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data));
        toast.success('Login Successful! Welcome back.');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans">
      {/* Left side with image */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-[#081a13] justify-center items-center relative overflow-hidden">
        <img 
          src="/image.png" 
          alt="Dashboard Preview" 
          className="w-full h-auto max-w-[90%] object-contain relative z-0"
        />
        {/* Gradient overlay to blend/fade the edges into the background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#081a13_100%)] z-10 pointer-events-none"></div>
        {/* Additional linear gradient for the right edge to blend it specifically towards the form */}
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#081a13] to-transparent z-10 pointer-events-none"></div>
      </div>
      
      {/* Right side with login form */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col p-8 md:p-12 lg:p-16 xl:p-24 bg-white justify-center relative">
        <div className="max-w-[420px] w-full mx-auto flex flex-col h-full">
          
          <div className="mb-12 text-center">
            <h1 className="text-[2.25rem] font-bold text-[#0f172a] mb-2 tracking-tight">Welcome Back 👋</h1>
            <p className="text-slate-500 text-[0.95rem]">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleLogin} className="flex-1">
            <div className="mb-6">
              <label htmlFor="email" className="block text-[0.9rem] font-semibold text-[#0f172a] mb-2">
                Email Address
              </label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-[0.95rem] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0CA356] focus:ring-4 focus:ring-[#0CA356]/10 transition-all duration-200" 
                placeholder="admin@wncoders.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-[0.9rem] font-semibold text-[#0f172a] mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-[0.95rem] text-slate-800 placeholder-slate-800 focus:outline-none focus:border-[#0CA356] focus:ring-4 focus:ring-[#0CA356]/10 transition-all duration-200 font-medium tracking-widest" 
                  placeholder="•••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-8"></div>

            <button type="submit" className="w-full py-3.5 bg-[#0CA356] hover:bg-[#0a8f4b] text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200">
              Sign In
            </button>
          </form>

          <div className="mt-12 text-center text-sm text-slate-400">
            © 2024 WNCoders. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
