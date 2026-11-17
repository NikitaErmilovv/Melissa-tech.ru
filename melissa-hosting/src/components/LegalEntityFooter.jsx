import { LEGAL_REQUISITES } from '../lib/legalRequisites.js';

/** Краткий блок реквизитов внизу экрана входа. */
export default function LegalEntityFooter({ go }) {
  const openRequisites = () => {
    if (go) go('/requisites');
    else window.location.assign('/requisites');
  };

  return (
    <footer className="legal-entity-footer">
      <p className="legal-entity-footer__line">ИНН: {LEGAL_REQUISITES.inn}</p>
      <p className="legal-entity-footer__line">{LEGAL_REQUISITES.name}</p>
      <p className="legal-entity-footer__line">ОГРНИП: {LEGAL_REQUISITES.ogrnip}</p>
      <button type="button" className="legal-entity-footer__link" onClick={openRequisites}>
        Реквизиты
      </button>
    </footer>
  );
}