import { useState, useRef, useEffect } from 'react';
import { useAppStore, THEME_OPTIONS } from '../store/appStore';
import { useRoute } from '../hooks/useRoute';
import { routeToHash } from '../lib/router';
import { encodeSharePayload } from '../lib/shareCodec';
import { serializeToRDF } from '../lib/rdf/serializer';
import { Palette, Check, Database, Trophy, HelpCircle, FileJson, LayoutGrid, Sparkles, FileText, Share2, PenTool, BookOpen, Menu, X, Download, Info } from 'lucide-react';
import { useT, useI18nStore } from '../i18n';


interface HeaderProps {
  onAboutClick: () => void;
  onHelpClick: () => void;
  onDataSourcesClick: () => void;
  onImportExportClick: () => void;
  onGalleryClick: () => void;
  onDesignerClick: () => void;
  onLearnClick: () => void;
  onNLBuilderClick?: () => void;
  onSummaryClick: () => void;
}

export function Header({ onAboutClick, onHelpClick, onDataSourcesClick, onImportExportClick, onGalleryClick, onDesignerClick, onLearnClick, onNLBuilderClick, onSummaryClick }: HeaderProps) {
  const { theme, setTheme, totalPoints, earnedBadges, currentOntology, dataBindings } = useAppStore();
  const route = useRoute();
  const t = useT();
  const locale = useI18nStore((state) => state.locale);
  const setLocale = useI18nStore((state) => state.setLocale);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied' | 'downloaded'>('idle');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const ontologyDisplayName = currentOntology.name || t('Untitled Ontology');

  const shareableId = route.page === 'catalogue' && route.ontologyId ? route.ontologyId : null;

  const handleShare = async () => {
    if (shareStatus === 'copying') return;

    if (shareableId) {
      // Catalogue ontology — use the short deep link
      const url = `${window.location.origin}${window.location.pathname}#/catalogue/${shareableId}`;
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
      return;
    }

    // Custom ontology — compress and encode into a share URL
    setShareStatus('copying');
    const encoded = await encodeSharePayload(currentOntology, dataBindings);
    if (encoded) {
      const url = `${window.location.origin}${window.location.pathname}#/share/${encoded}`;
      await navigator.clipboard.writeText(url);
      history.replaceState(null, '', routeToHash({ page: 'share', data: encoded }));
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } else {
      // Too large for URL — download the RDF file instead
      const content = serializeToRDF(currentOntology, dataBindings);
      const blob = new Blob([content], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentOntology.name.toLowerCase().replace(/\s+/g, '-')}-ontology.rdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShareStatus('downloaded');
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const shareLabel = shareStatus === 'copied'
    ? t('Copied!')
    : shareStatus === 'downloaded'
      ? t('Downloaded RDF')
      : shareStatus === 'copying'
        ? t('Encoding…')
        : t('Share');


  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // Close theme menu when clicking outside
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [themeMenuOpen]);

  const menuAction = (fn: () => void) => () => { setMenuOpen(false); fn(); };

  return (
    <header className="header">
      <div className="header-logo">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="4" fill="#0078D4"/>
          <path d="M8 8H15V15H8V8Z" fill="white"/>
          <path d="M17 8H24V15H17V8Z" fill="white" opacity="0.7"/>
          <path d="M8 17H15V24H8V17Z" fill="white" opacity="0.7"/>
          <path d="M17 17H24V24H17V17Z" fill="white" opacity="0.5"/>
        </svg>
        <div>
          <span className="header-title">
            {t('Ontology Playground')} <span className="header-title-preview">{t('(Preview)')}</span>
          </span>
          <span className="header-context">{ontologyDisplayName}</span>
        </div>
      </div>

      <div className="header-stats">
        <div className="stat-item">
          <Trophy size={18} />
          <span className="stat-value">{totalPoints}</span>
          <span>{t('points')}</span>
        </div>
        <div className="stat-item">
          <span style={{ fontSize: 18 }}>🏆</span>
          <span className="stat-value">{earnedBadges.length}</span>
          <span>{t('badges')}</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-text-btn"
          onClick={handleShare}
          title={shareableId ? t('Copy shareable link to this ontology') : t('Share this ontology via link')}
          style={shareStatus === 'copied' ? { color: 'var(--ms-green, #107C10)' } : shareStatus === 'downloaded' ? { color: 'var(--ms-blue, #0078D4)' } : undefined}
        >
          {shareStatus === 'downloaded' ? <Download size={16} /> : <Share2 size={16} />}
          <span>{shareLabel}</span>
        </button>
        <button className="header-text-btn" onClick={onSummaryClick} title={t('View Ontology Summary')}>
          <FileText size={16} />
          <span>{t('Summary')}</span>
        </button>
        {onNLBuilderClick && (
          <button className="icon-btn" onClick={onNLBuilderClick} data-tooltip={t('AI Builder')} aria-label={t('AI Builder')}>
            <Sparkles size={20} />
          </button>
        )}
        <button className="icon-btn" onClick={onGalleryClick} data-tooltip={t('Catalogue')} aria-label={t('Catalogue')}>
          <LayoutGrid size={20} />
        </button>
        <button className="icon-btn" onClick={onDesignerClick} data-tooltip={t('Designer')} aria-label={t('Designer')}>
          <PenTool size={20} />
        </button>
        <button className="icon-btn" onClick={onLearnClick} data-tooltip={t('Ontology School')} aria-label={t('Ontology School')}>
          <BookOpen size={20} />
        </button>
        <button className="icon-btn" onClick={onImportExportClick} data-tooltip={t('Import / Export')} aria-label={t('Import / Export')}>
          <FileJson size={20} />
        </button>
        <button className="icon-btn" onClick={onHelpClick} data-tooltip={t('Help')} aria-label={t('Help')}>
          <HelpCircle size={20} />
        </button>
        <button className="icon-btn" onClick={onAboutClick} data-tooltip={t('About')} aria-label={t('About')}>
          <Info size={20} />
        </button>
        <button className="icon-btn" onClick={onDataSourcesClick} data-tooltip={t('Data Sources')} aria-label={t('Data Sources')}>
          <Database size={20} />
        </button>
        <button
          className="icon-btn"
          onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
          data-tooltip={`${t('Language')} · ${locale === 'zh-CN' ? 'EN' : '中文'}`}
          aria-label={t('Switch language')}
        >
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0 }}>{locale === 'zh-CN' ? '中' : 'EN'}</span>
        </button>
        <div className="theme-picker" ref={themeMenuRef}>
          <button
            className="icon-btn"
            onClick={() => setThemeMenuOpen((o) => !o)}
            data-tooltip={t('Theme')}
            aria-label={t('Theme')}
            aria-haspopup="menu"
            aria-expanded={themeMenuOpen}
          >
            <Palette size={20} />
          </button>
          {themeMenuOpen && (
            <div className="theme-menu" role="menu">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`theme-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={() => { setTheme(opt.id); setThemeMenuOpen(false); }}
                  role="menuitemradio"
                  aria-checked={theme === opt.id}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {t(opt.label)}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile hamburger menu */}
      <div className="header-mobile-menu" ref={menuRef}>
        <button className="icon-btn header-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label={t('Menu')}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <div className="mobile-menu-dropdown">
            <div className="mobile-menu-stats">
              <Trophy size={16} />
              <span className="stat-value">{totalPoints}</span>
              <span>{t('points')}</span>
              <span style={{ margin: '0 8px', color: 'var(--text-tertiary)' }}>·</span>
              <span>🏆</span>
              <span className="stat-value">{earnedBadges.length}</span>
              <span>{t('badges')}</span>
            </div>
            <button className="mobile-menu-item" onClick={menuAction(handleShare)}>
              <Share2 size={18} /> {shareLabel}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onSummaryClick)}>
              <FileText size={18} /> {t('Summary')}
            </button>
            {onNLBuilderClick && (
              <button className="mobile-menu-item" onClick={menuAction(onNLBuilderClick)}>
                <Sparkles size={18} /> {t('AI Builder')}
              </button>
            )}
            <button className="mobile-menu-item" onClick={menuAction(onGalleryClick)}>
              <LayoutGrid size={18} /> {t('Catalogue')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDesignerClick)}>
              <PenTool size={18} /> {t('Designer')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onLearnClick)}>
              <BookOpen size={18} /> {t('Ontology School')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onImportExportClick)}>
              <FileJson size={18} /> {t('Import / Export')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onHelpClick)}>
              <HelpCircle size={18} /> {t('Help')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onAboutClick)}>
              <Info size={18} /> {t('About')}
            </button>
            <button className="mobile-menu-item" onClick={menuAction(onDataSourcesClick)}>
              <Database size={18} /> {t('Data Sources')}
            </button>
            <div className="mobile-menu-themes">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`mobile-menu-item ${theme === opt.id ? 'active' : ''}`}
                  onClick={menuAction(() => setTheme(opt.id))}
                >
                  <span className="theme-swatch" style={{ background: opt.swatch }} />
                  {t(opt.label)}
                  {theme === opt.id && <Check size={16} className="theme-check" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
