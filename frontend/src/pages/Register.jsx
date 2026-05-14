import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const { register: authRegister, isLoggedIn, loading: authLoading } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!authLoading && isLoggedIn) navigate('/dashboard', { replace: true });
  }, [isLoggedIn, authLoading, navigate]);

  const onSubmit = async ({ name, email, password, phone }) => {
    const result = await authRegister(name, email, password, phone);
    if (result.success) {
      toast.success('Account created! Welcome to RentEase 🎉');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  const inputCls = (hasErr) => `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all duration-200
    ${dark ? 'bg-dm-hover text-dm-text placeholder:text-dm-muted' : 'bg-white'}
    ${hasErr
      ? 'border-danger focus:ring-2 focus:ring-danger/20'
      : dark ? 'border-dm-border focus:border-primary focus:ring-2 focus:ring-primary/20'
             : 'border-ink-200 focus:border-primary focus:ring-2 focus:ring-primary/15'}`;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${dark ? 'bg-dm-bg' : 'bg-ink-50'}`}>

      {/* Left promo */}
      <div className="hidden lg:flex flex-col justify-center flex-[0_0_44%] relative overflow-hidden px-12"
        style={{ background: dark
          ? 'linear-gradient(135deg, #010409 0%, #0D1117 50%, #26A54115 100%)'
          : 'linear-gradient(135deg, #1a2a1a 0%, #26A541 60%, #0F9D8A 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(38,165,65,0.2), transparent 60%)' }} />
        <div className="relative max-w-sm">
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <span className="text-3xl">🏠</span>
            <span className="font-head font-extrabold text-2xl text-white">RentEase</span>
          </Link>
          <h2 className="font-head text-3xl font-extrabold text-white mb-4 leading-tight">Join 10,000+<br />happy renters</h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">Students and professionals trust RentEase to furnish their homes affordably.</p>
          <div className="space-y-3">
            {['No credit check needed','Cancel anytime','Same-city relocations','48hr maintenance SLA'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-white/85">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="text-3xl">🏠</span>
            <span className="font-head font-extrabold text-2xl text-primary">RentEase</span>
          </Link>

          <div className="flex justify-end mb-4">
            <button onClick={toggle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200
                ${dark ? 'bg-dm-card border-dm-border text-dm-muted hover:text-dm-text' : 'bg-white border-ink-200 text-ink-500 hover:text-ink-700'}`}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <div className={`rounded-2xl border p-8 transition-colors duration-300
            ${dark ? 'bg-dm-card border-dm-border shadow-dark-card' : 'bg-white border-ink-100 shadow-card'}`}>
            <h1 className="font-head text-2xl font-bold mb-1">Create account</h1>
            <p className="text-sm text-ink-400 dark:text-dm-muted mb-7">Start renting in minutes</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {[
                { label:'Full Name',              name:'name',     type:'text',     placeholder:'Your full name',
                  rules:{ required:'Full name is required', minLength:{ value:2, message:'At least 2 characters' } } },
                { label:'Email Address',          name:'email',    type:'email',    placeholder:'you@example.com',
                  rules:{ required:'Email is required', pattern:{ value:/^\S+@\S+\.\S+$/, message:'Enter a valid email' } } },
                { label:'Phone Number',        name:'phone',    type:'tel',      placeholder:'10-digit mobile',
                  rules:{ pattern:{ value:/^[6-9]\d{9}$/, message:'Enter a valid 10-digit Indian number' } } },
                { label:'Password',               name:'password', type:'password', placeholder:'Min 6 characters',
                  rules:{ required:'Password is required', minLength:{ value:6, message:'At least 6 characters' },
                    pattern:{ value:/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, message:'Include at least one letter and one number' } } },
              ].map(({ label, name, type, placeholder, rules }) => (
                <div key={name}>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-1.5 text-ink-600 dark:text-dm-muted">{label}</label>
                  <input type={type} placeholder={placeholder} className={inputCls(errors[name])}
                    {...register(name, rules)} />
                  {errors[name] && <p className="field-error">⚠ {errors[name].message}</p>}
                </div>
              ))}

              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 mt-1">
                {isSubmitting ? '⏳ Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-ink-400 dark:text-dm-muted mt-5">
              Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
