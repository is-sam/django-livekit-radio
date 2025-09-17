export default function Signature() {
  return (
    <div style={{
      position: 'fixed',
      left: 0,
      bottom: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      pointerEvents: 'none',
      paddingBottom: '12px',
    }}>
      <span style={{
        fontFamily: 'inherit',
        fontSize: '1rem',
        color: '#f3f4f6', // Tailwind slate-100
        opacity: 0.85,
        letterSpacing: '0.01em',
        pointerEvents: 'auto',
        background: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        padding: 0,
        textShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }}>
        Made with <span style={{color:'#e25555',fontSize:'1.1em'}}>❤️</span> by{' '}
        <a
          href="https://github.com/is-sam"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#bae6fd', // Tailwind cyan-200
            textDecoration: 'underline',
            fontWeight: 500,
            opacity: 0.95,
          }}
        >
          is-sam
        </a>
      </span>
    </div>
  );
}
