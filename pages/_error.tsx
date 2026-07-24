import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1>{statusCode ? `${statusCode} - Bir Hata Oluştu` : 'Bir Hata Oluştu'}</h1>
      <a href="/" style={{ marginTop: '1rem', color: '#2563eb', textDecoration: 'underline' }}>Ana Sayfaya Dön</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
