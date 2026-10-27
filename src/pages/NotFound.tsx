import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="font-kannada text-4xl text-saffron-500" lang="kn">ಕ್ಷಮಿಸಿ</p>
      <h1 className="mt-3 text-xl font-bold text-ink-800">We could not find that page</h1>
      <p className="mt-2 text-sm text-ink-500">The link may be old. Everything in this app is one click away.</p>
      <Link to="/" className="btn-primary mt-5">Back to home</Link>
    </div>
  );
}
