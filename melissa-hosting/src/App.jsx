import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { AdminShell, ClientShell } from './Shell.jsx';
import LoginPage, { ResetPage } from './pages/Login.jsx';
import Overview from './pages/Overview.jsx';
import AppsPage from './pages/AppsPage.jsx';
import AppPage from './pages/AppPage.jsx';
import ServerPage from './pages/ServerPage.jsx';
import Payments from './pages/Payments.jsx';
import Settings from './pages/Settings.jsx';
import Support from './pages/Support.jsx';
import AdminPage from './pages/AdminPage.jsx';
import { ScreenLoader } from './ui.jsx';
import Pricing from './pages/Pricing.jsx';
import Requisites from './pages/Requisites.jsx';

function currentPath() {
  const path = window.location.pathname || '/';
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [path, setPath] = useState(currentPath);

  const go = useCallback((to, replace = false) => {
    const next = to.startsWith('/') ? to : `/${to}`;
    if (replace) window.history.replaceState({}, '', next);
    else window.history.pushState({}, '', next);
    setPath(currentPath());
  }, []);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const load = useCallback(() => {
    api.me().then((next) => {
      setSession((current) => (next?.user || !current?.user ? next : current));
    }).catch(() => {
      setSession((current) => (current?.user ? current : current));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const retryMs = [0, 400, 900, 1600, 2500, 4000, 6000];

    const bootstrap = async () => {
      for (const wait of retryMs) {
        if (cancelled) return;
        if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
        try {
          const next = await api.me();
          if (cancelled) return;
          setSession(next);
          return;
        } catch {
          // сервер после передеплоя может отвечать с задержкой — пробуем снова
        }
      }
      if (!cancelled) setSession(null);
    };

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  const user = session?.user || null;

  useEffect(() => {
    if (session === undefined) return;
    if (!user && path !== '/login' && path !== '/reset' && path !== '/pricing' && path !== '/requisites') {
      go('/login', true);
    }
    if (user?.role === 'admin' && (path === '/' || path === '/login')) go('/admin', true);
    if (user?.role === 'client' && path === '/admin') go('/apps', true);
    if (user?.role === 'admin' && path !== '/admin' && path !== '/reset') go('/admin', true);
  }, [session, user, path, go]);

  useEffect(() => {
    if (user?.role !== 'client') return;
    const home = path === '/' || path === '/login' || path === '/overview' || path === '/server';
    if (!home) return;
    let cancelled = false;
    api.dashboard().then((data) => {
      if (cancelled) return;
      const app = (data.projects || []).flatMap((item) => item.resources?.apps || [])[0];
      go(app?.id ? `/app/${app.id}` : '/apps', true);
    }).catch(() => {
      if (!cancelled) go('/apps', true);
    });
    return () => { cancelled = true; };
  }, [user, path, go]);

  const logout = () => setSession(null);

  let page = null;
  if (session === undefined) {
    page = (
      <div className="portal-boot">
        <ScreenLoader />
      </div>
    );
  } else if (!user) {
    page = path === '/reset'
      ? <ResetPage go={go} />
      : path === '/pricing'
        ? <Pricing go={go} />
        : path === '/requisites'
          ? <Requisites go={go} />
          : <LoginPage onSession={setSession} go={go} />;
  } else if (user.role === 'admin') {
    page = (
      <AdminShell user={user} onLogout={logout}>
        <AdminPage />
      </AdminShell>
    );
  } else {
    const pages = {
      '/overview': <Overview />,
      '/apps': <AppsPage />,
      '/server': <ServerPage />,
      '/payments': <Payments onSession={load} />,
      '/settings': <Settings user={user} onSession={load} onLogout={logout} />,
      '/support': <Support />,
    };
    const openingApp = path === '/' || path === '/login' || path === '/overview' || path === '/server';
    const appPage = path.startsWith('/app/') ? <AppPage path={path} /> : null;
    page = (
      <ClientShell user={user} path={path} go={go} summary={session.summary} onLogout={logout}>
        {openingApp
          ? <ScreenLoader />
          : (appPage || pages[path] || pages['/apps'])}
      </ClientShell>
    );
  }

  return (
    <>
      <div className="app-bg" />
      {page}
    </>
  );
}
