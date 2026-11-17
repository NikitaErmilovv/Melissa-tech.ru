import SideRays from '../components/SideRays.jsx';
import { LEGAL_REQUISITES } from '../lib/legalRequisites.js';

export default function Requisites({ go }) {
  const back = () => (go ? go('/login') : window.location.assign('/login'));

  return (
    <div className="relative min-h-screen bg-[#070709]">
      <div className="absolute inset-0" aria-hidden="true">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
        />
      </div>
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-10">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg animate-fade-up signin-card">
            <img className="signin-mark" src="/favicon.svg" alt="" />
            <h1 className="signin-title">Реквизиты</h1>
            <p className="signin-sub">Исполнитель услуг размещения и сопровождения в кабинете Melissa Tech.</p>
            <dl className="requisites-list">
              <RequisitesRow label="ИНН" value={LEGAL_REQUISITES.inn} />
              <RequisitesRow label="Наименование" value={LEGAL_REQUISITES.name} />
              <RequisitesRow label="ОГРНИП" value={LEGAL_REQUISITES.ogrnip} />
            </dl>
            <button type="button" className="signin-submit mt-6" onClick={back}>
              Ко входу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequisitesRow({ label, value }) {
  return (
    <div className="requisites-row">
      <dt className="requisites-row__label">{label}</dt>
      <dd className="requisites-row__value">{value}</dd>
    </div>
  );
}