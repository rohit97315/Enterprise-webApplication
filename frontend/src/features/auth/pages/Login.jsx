import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Employee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
     
      const response = await axios.post('http://localhost:3000/api/auth/login', { 
        email, 
        password,
        role: selectedRole 
      },
    {
      withCredentials:true
    });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      
      if (user.role === 'Admin') navigate('/admin/dashboard',{ state: { user } });
      else if (user.role === 'HR_Manager') navigate('/hr/dashboard',{ state: { user } });
      else navigate('/employee/dashboard',{ state: { user } });

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  
  const buttonStyle = (role) => ({
    flex: 1,
    padding: '10px',
    margin: '0 5px',
    backgroundColor: selectedRole === role ? '#007bff' : '#f0f0f0',
    color: selectedRole === role ? '#fff' : '#000',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: selectedRole === role ? 'bold' : 'normal',
    transition: 'all 0.2s ease'
  });

const styles = {
    container: {
      backgroundColor: '#0b1329', 
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '32px',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '50px 50px',
    },
    logoIcon: {
      backgroundColor: '#4d66f6', 
      borderRadius: '12px',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: '24px',
      height: '24px',
      color: '#ffffff',
    },
    brandName: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: '600',
      letterSpacing: '0.02em',
      color: '#ffffff',
    },
    brandSub: {
      margin: 0,
      fontSize: '0.875rem',
      color: '#64748b', 
      fontWeight: '500',
    },
    heroMain: {
      marginTop: 'auto',
      marginBottom: 'auto',
      paddingTop: '84px',
      paddingBottom: '32px',
      paddingLeft: '50px',
    },
    heroTitle: {
      margin: 0,
      fontSize: '44px',
      fontWeight: '700',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
      color: '#ffffff',
    },
    textBlue: {
      color: '#6989fe', 
    },
    heroDescription: {
      margin: '20px 0 0 0',
      maxWidth: '400px',
      fontSize: '17px',
      lineHeight: '1.6',
      color: '#94a3b8',
    },
    statsRow: {
      display: 'flex',
      width: '90%',
      gap: '12px', 
      marginBottom: 'auto',
      paddingLeft: '50px',
      paddingBottom: '100px',
    },
    statCard: {
      flex: 1, 
      backgroundColor: '#162037', 
      border: '1px solid #1e293b',
      borderRadius: '16px',
      padding: '20px 16px',
    },
    statNumber: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#ffffff',
    },
    statLabel: {
      margin: '4px 0 0 0',
      fontSize: '0.875rem',
      color: '#94a3b8',
    },
    footer: {
      marginTop: '60px',
      fontSize: '0.875rem',
      color: '#475569',
      fontWeight: '500',
      paddingLeft: '50px',
    },
  };





  return (
    <>
    <div style={{display:'flex',backgroundColor:'#222222' ,minHeight:'100vh',width:'100%',gap:'16px'}} >
    <div style={{backgroundColor:'#152238',flex:'1',maxWidth:'600px'}} >

    <div style={styles.header}>
        <div style={styles.logoIcon}>
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={styles.icon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .414-.336.75-.75.75H4.5a.75.75 0 0 1-.75-.75V14.15M20.25 14.15a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25m16.5 0c.162.326.25.691.25 1.076v1.116c0 .414-.336.75-.75.75H4.5a.75.75 0 0 1-.75-.75V15.23c0-.385.088-.75.25-1.076M12 12v.01M12 3v3.75m0 0a3 3 0 1 0 0 6H12M12 6.75h3.75a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H12" />
          </svg>
        </div>
        <div>
          <h2 style={styles.brandName}>DevGuard</h2>
          <p style={styles.brandSub}>Enterprise Platform</p>
        </div>
      </div>

      
      <div style={styles.heroMain}>
        <h1 style={styles.heroTitle}>
          People-first.<br />
          <span style={styles.textBlue}>AI-powered.</span>
        </h1>
        <p style={styles.heroDescription}>
          Enterprise HR combining intelligent automation with human-centered design.
        </p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>2,400+</h3>
          <p style={styles.statLabel}>Employees</p>
        </div>
        
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>18K+</h3>
          <p style={styles.statLabel}>AI Screenings</p>
        </div>
        
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>99.9%</h3>
          <p style={styles.statLabel}>Uptime</p>
        </div>
      </div>

     
      <div style={styles.footer}>
        © 2026 DevGuard Corp
      </div>

</div>



    <div style={{ maxWidth: '450px',marginTop: '80px',marginLeft:'180px',marginBottom:'90px', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',flex:'1' }}>
      <h1 style={{  color: '#FFFFFF' ,fontSize:'30px',fontWeight:'bold'}}>Welcome Back</h1>
      <h2 style={{  marginBottom: '40px',color: '#778899' }}>Sign in to your HR Portal </h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <button type="button" style={buttonStyle('Employee')} onClick={() => setSelectedRole('Employee')}>
          Employee Login
        </button>
        <button type="button" style={buttonStyle('HR_Manager')} onClick={() => setSelectedRole('HR_Manager')}>
          HR Login
        </button>
        <button type="button" style={buttonStyle('Admin')} onClick={() => setSelectedRole('Admin')}>
          Admin Login
        </button>
      </div>

      <p style={{ textAlign: 'center', color: '#FFFFFF', }}>Logging in as: <strong>{selectedRole}</strong></p>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px',color: '#FFFFFF' }}>Email Address:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box',border: '1px solid #778899',color: '#FFFFFF' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#FFFFFF' }}>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box',border: '1px solid #778899',color: '#FFFFFF' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          Sign In
        </button>
        {/* <p style={{color:'#778899'}}>Need Access?</p> */}
      </form>
    </div>
    </div>
    </>
  );
};

export default Login;