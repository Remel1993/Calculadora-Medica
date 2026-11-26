import { ArrowLeft, ChevronDown, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CALCULATOR_CATALOG } from '../../clinical-core/registries/catalog.ts';
import {
  CLINICAL_REFERENCE_TABLES,
  SETTING_LABELS,
  type ClinicalSetting,
  type ClinicalTableCell,
  type TableTone,
} from '../../clinical-core/registries/clinicalTables.ts';
import { getCalculatorFormulaReference } from '../../clinical-core/registries/formulaReference.ts';
import { SPECIALTIES, SPECIALTY_MAP } from '../../clinical-core/registries/specialties.ts';
import type { SpecialtyId } from '../../clinical-core/types/clinical.ts';
import {
  ClinicalEvidenceBookIcon,
  ClinicalInfoPulseIcon,
  ClinicalSafetyShieldIcon,
  ClinicalSearchIcon,
} from '../icons/clinicalUiIcons.tsx';
import { ScrollableTableShell } from '../components/ScrollableTableShell.tsx';
import { AcronymLegend } from '../components/AcronymLegend.tsx';
import { SPECIALTY_VISUALS } from '../registries/specialtyVisuals.tsx';

interface ReferencesViewProps {
  onBack: () => void;
}

type ReferenceTab = 'tables' | 'formulas';
type SettingFilter = 'all' | 'consulta-externa' | 'urgencias';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getToneCellClass(tone?: TableTone): string {
  switch (tone) {
    case 'normal':
      return 'bg-emerald-50/85 text-emerald-900 dark:bg-emerald-950/45 dark:text-emerald-200';
    case 'low':
      return 'bg-amber-50/85 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200';
    case 'moderate':
      return 'bg-orange-50/90 text-orange-900 dark:bg-orange-950/45 dark:text-orange-200';
    case 'high':
      return 'bg-rose-50/90 text-rose-900 dark:bg-rose-950/45 dark:text-rose-200';
    case 'critical':
      return 'bg-red-100/80 text-red-950 dark:bg-red-950/55 dark:text-red-200';
    default:
      return 'text-slate-700 dark:text-slate-300';
  }
}

function getSettingBadgeClass(setting: ClinicalSetting): string {
  if (setting === 'urgencias') {
    return 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300';
  }
  if (setting === 'consulta-externa') {
    return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300';
  }
  return 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-300';
}

function renderCellContent(cell: string | ClinicalTableCell): {
  text: string;
  tone?: TableTone;
  emphasize?: boolean;
} {
  if (typeof cell === 'string') {
    return { text: cell };
  }
  return cell;
}

function getStickyFirstColToneClass(tone?: TableTone, isRowHighlighted?: boolean): string {
  if (isRowHighlighted) {
    return 'bg-sky-50 text-sky-950 dark:bg-sky-950 dark:text-sky-100';
  }
  switch (tone) {
    case 'normal':
      return 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200';
    case 'low':
      return 'bg-amber-50 text-amber-950 dark:bg-amber-950 dark:text-amber-200';
    case 'moderate':
      return 'bg-orange-50 text-orange-950 dark:bg-orange-950 dark:text-orange-200';
    case 'high':
      return 'bg-rose-50 text-rose-950 dark:bg-rose-950 dark:text-rose-200';
    case 'critical':
      return 'bg-red-100 text-red-950 dark:bg-red-950 dark:text-red-200';
    default:
      return 'bg-white text-slate-900 group-hover/row:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:group-hover/row:bg-slate-800';
  }
}

export const ReferencesView: React.FC<ReferencesViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ReferenceTab>('tables');
  const [query, setQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyId | 'all'>('all');
  const [settingFilter, setSettingFilter] = useState<SettingFilter>('all');
  const [highlightedRows, setHighlightedRows] = useState<Record<string, number | null>>({});

  const toggleHighlightedRow = (tableId: string, rowIdx: number) => {
    setHighlightedRows((prev) => ({
      ...prev,
      [tableId]: prev[tableId] === rowIdx ? null : rowIdx,
    }));
  };

  const totalCitations = useMemo(
    () => CALCULATOR_CATALOG.reduce((sum, calc) => sum + calc.references.length, 0),
    [],
  );

  const formulaMap = useMemo(() => {
    const entries = new Map<string, ReturnType<typeof getCalculatorFormulaReference>>();
    for (const calc of CALCULATOR_CATALOG) {
      entries.set(calc.id, getCalculatorFormulaReference(calc));
    }
    return entries;
  }, []);

  const filteredTables = useMemo(() => {
    const q = normalizeText(query);
    return CLINICAL_REFERENCE_TABLES.filter((table) => {
      if (
        specialtyFilter !== 'all' &&
        table.specialty !== specialtyFilter &&
        !(table.secondarySpecialties ?? []).includes(specialtyFilter)
      ) {
        return false;
      }

      if (settingFilter === 'consulta-externa' && table.setting === 'urgencias') {
        return false;
      }
      if (settingFilter === 'urgencias' && table.setting === 'consulta-externa') {
        return false;
      }

      if (!q) return true;

      const rowText = table.rows
        .flatMap((row) => row.map((cell) => (typeof cell === 'string' ? cell : cell.text)))
        .join(' ');

      const haystack = normalizeText(
        [
          table.title,
          table.shortTitle,
          table.guidelineVersion,
          table.summary,
          SPECIALTY_MAP[table.specialty].name,
          table.columns.join(' '),
          rowText,
          table.keyManagementPearls.join(' '),
          ...table.references.map((r) => `${r.citation} ${r.year}`),
        ].join(' '),
      );

      return haystack.includes(q);
    });
  }, [query, specialtyFilter, settingFilter]);

  const filteredCalculators = useMemo(() => {
    const q = normalizeText(query);
    return CALCULATOR_CATALOG.filter((calc) => {
      if (
        specialtyFilter !== 'all' &&
        calc.primarySpecialty !== specialtyFilter &&
        !calc.secondarySpecialties.includes(specialtyFilter)
      ) {
        return false;
      }

      if (!q) return true;

      const formulaInfo = formulaMap.get(calc.id);
      const haystack = normalizeText(
        [
          calc.name,
          calc.shortName,
          calc.version,
          calc.description,
          calc.clinicalIndication,
          calc.validatedPopulation,
          SPECIALTY_MAP[calc.primarySpecialty].name,
          formulaInfo?.formulaUsed ?? '',
          ...(formulaInfo?.variables.map((v) => `${v.label} ${v.detail}`) ?? []),
          ...calc.references.map((r) => `${r.citation} ${r.year} ${r.note ?? ''}`),
        ].join(' '),
      );

      return haystack.includes(q);
    });
  }, [query, specialtyFilter, formulaMap]);

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Volver al inicio</span>
        </button>

        <div className="font-mono text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
          {CLINICAL_REFERENCE_TABLES.length} tablas · {CALCULATOR_CATALOG.length} fórmulas · {totalCitations} citas
        </div>
      </div>

      <section className="-mx-2.5 rounded-none border-x-0 border-y border-slate-200 bg-white px-3.5 py-3.5 sm:mx-0 sm:rounded-2xl sm:border sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800/60">
            <ClinicalEvidenceBookIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
              Guías, tablas clínicas y fórmulas
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
              Apartado de consulta y verificación offline: tablas de manejo para consulta externa y urgencias, ecuaciones matemáticas, variables de cada escala y referencias bibliográficas.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div
          role="tablist"
          aria-label="Secciones de guías y referencias"
          className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-950"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tables'}
            onClick={() => setActiveTab('tables')}
            className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === 'tables'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Tablas y manejos ({CLINICAL_REFERENCE_TABLES.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'formulas'}
            onClick={() => setActiveTab('formulas')}
            className={`min-h-[40px] rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              activeTab === 'formulas'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Fórmulas y bibliografía ({CALCULATOR_CATALOG.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div
          className={`mt-3 grid gap-2.5 ${
            activeTab === 'tables'
              ? 'sm:grid-cols-[1fr_210px_210px]'
              : 'sm:grid-cols-[1fr_240px]'
          }`}
        >
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-950">
            <ClinicalSearchIcon className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <input
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              placeholder={
                activeTab === 'tables'
                  ? 'Buscar patología, tabla, fármaco o guía (ej. KDIGO, sepsis, HTA)...'
                  : 'Buscar fórmula, variable, escala, autor o año...'
              }
              aria-label="Buscar en guías, tablas y fórmulas"
              className="min-h-[42px] w-full min-w-0 bg-transparent px-2.5 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {activeTab === 'tables' && (
            <select
              value={settingFilter}
              onChange={(e) => setSettingFilter(e.target.value as SettingFilter)}
              aria-label="Filtrar tablas por ámbito clínico"
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:border-sky-500 focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="all">Todos los ámbitos</option>
              <option value="consulta-externa">Consulta Externa</option>
              <option value="urgencias">Urgencias / Emergencias</option>
            </select>
          )}

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value as SpecialtyId | 'all')}
            aria-label="Filtrar por especialidad"
            className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:border-sky-500 focus:outline-none sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">Todas las especialidades ({SPECIALTIES.length})</option>
            {SPECIALTIES.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {activeTab === 'tables' ? (
        <>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Mostrando {filteredTables.length} de {CLINICAL_REFERENCE_TABLES.length} tablas clínicas
          </div>

          {filteredTables.length > 0 ? (
            <div className="space-y-4">
              {filteredTables.map((table) => {
                const spec = SPECIALTY_MAP[table.specialty];
                const visual = SPECIALTY_VISUALS[table.specialty];
                return (
                  <article
                    key={table.id}
                    className="-mx-2.5 rounded-none border-x-0 border-y border-slate-200 bg-white px-3.5 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2.5">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visual.badgeBgClass} ${visual.iconClass}`}
                        >
                          {visual.renderIcon('h-5 w-5')}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                              {spec.name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>
                            <span className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {table.guidelineVersion}
                            </span>
                          </div>
                          <h2 className="mt-0.5 break-words text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
                            {table.title}
                          </h2>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold ${getSettingBadgeClass(
                          table.setting,
                        )}`}
                      >
                        {SETTING_LABELS[table.setting]}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                      {table.summary}
                    </p>

                    {/* Responsive 2D Sticky Reference Table */}
                    <ScrollableTableShell
                      className="mt-3"
                      allowExpand
                      compactHeightClass="max-h-[400px] sm:max-h-[460px]"
                      ariaLabel={`Tabla clínica: ${table.shortTitle}`}
                    >
                      <table
                        className={`w-full border-separate border-spacing-0 text-left text-xs sm:text-[13px] ${
                          table.columns.length >= 5
                            ? 'min-w-[720px]'
                            : table.columns.length === 4
                              ? 'min-w-[600px]'
                              : 'min-w-[460px]'
                        }`}
                      >
                        <thead>
                          <tr className="text-slate-700 dark:text-slate-200">
                            {table.columns.map((col, colIdx) => {
                              const isFirstCol = colIdx === 0;
                              return (
                                <th
                                  key={`${table.id}-col-${colIdx}`}
                                  scope="col"
                                  className={`border-b border-r border-slate-200 bg-slate-100 px-3 py-2.5 font-semibold last:border-r-0 dark:border-slate-700 dark:bg-slate-800 ${
                                    isFirstCol
                                      ? 'sticky top-0 left-0 z-30 min-w-[132px] max-w-[168px] sm:min-w-[180px] sm:max-w-[240px] group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(15,23,42,0.14)] dark:group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.5)]'
                                      : 'sticky top-0 z-20'
                                  }`}
                                >
                                  {col}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rowIdx) => {
                            const isRowHighlighted = highlightedRows[table.id] === rowIdx;
                            const isLastRow = rowIdx === table.rows.length - 1;
                            return (
                              <tr
                                key={`${table.id}-row-${rowIdx}`}
                                onClick={() => toggleHighlightedRow(table.id, rowIdx)}
                                title="Toca para resaltar o quitar el resaltado de esta fila al desplazarte"
                                className={`group/row cursor-pointer transition-colors ${
                                  isRowHighlighted
                                    ? 'bg-sky-50/90 dark:bg-sky-950/60'
                                    : 'bg-white hover:bg-slate-50/80 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                {row.map((rawCell, cellIdx) => {
                                  const cell = renderCellContent(rawCell);
                                  const isFirstCol = cellIdx === 0;
                                  const borderClasses = `${isLastRow ? '' : 'border-b'} border-r border-slate-200 last:border-r-0 dark:border-slate-800`;

                                  if (isFirstCol) {
                                    return (
                                      <th
                                        key={`${table.id}-r${rowIdx}-c${cellIdx}`}
                                        scope="row"
                                        className={`sticky left-0 z-10 min-w-[132px] max-w-[168px] px-3 py-2.5 text-left align-top font-semibold leading-relaxed transition-colors sm:min-w-[180px] sm:max-w-[240px] group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(15,23,42,0.12)] dark:group-data-[scrolled-x=true]/scroll:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.45)] ${borderClasses} ${getStickyFirstColToneClass(
                                          cell.tone,
                                          isRowHighlighted,
                                        )}`}
                                      >
                                        {cell.text}
                                      </th>
                                    );
                                  }

                                  return (
                                    <td
                                      key={`${table.id}-r${rowIdx}-c${cellIdx}`}
                                      className={`px-3 py-2.5 align-top leading-relaxed ${borderClasses} ${
                                        isRowHighlighted
                                          ? 'text-sky-950 dark:text-sky-100'
                                          : getToneCellClass(cell.tone)
                                      } ${cell.emphasize ? 'font-semibold' : ''}`}
                                    >
                                      {cell.text}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </ScrollableTableShell>

                    {/* Key Clinical Pearls */}
                    {table.keyManagementPearls.length > 0 && (
                      <div className="mt-3 border-l-2 border-sky-500/80 bg-slate-50/60 py-2 pl-3 pr-2 dark:border-sky-500/60 dark:bg-slate-950/40">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                          <ClinicalInfoPulseIcon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                          <span>Puntos clave de manejo y verificación</span>
                        </div>
                        <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          {table.keyManagementPearls.map((pearl, idx) => (
                            <li key={`${table.id}-pearl-${idx}`} className="flex gap-1.5">
                              <span className="font-bold text-sky-600 dark:text-sky-400">•</span>
                              <span>{pearl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bibliographic Citations */}
                    <ul className="mt-3 select-text space-y-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      {table.references.map((ref, idx) => (
                        <li
                          key={`${table.id}-ref-${idx}`}
                          className="text-[11px] leading-relaxed text-slate-600 sm:text-xs dark:text-slate-400"
                        >
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            [{ref.year}]
                          </span>{' '}
                          <span>{ref.citation}</span>
                        </li>
                      ))}
                    </ul>

                    <AcronymLegend
                      className="mt-3"
                      initialLimit={8}
                      sourceText={[
                        table.title,
                        table.guidelineVersion,
                        table.summary,
                        ...table.columns,
                        ...table.rows.flatMap((row) =>
                          row.map((cell) => (typeof cell === 'string' ? cell : cell.text)),
                        ),
                        ...table.keyManagementPearls,
                        table.cautionNote ?? '',
                      ].join(' ')}
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="-mx-2.5 rounded-none border-x-0 border-y border-slate-200 bg-white p-6 text-center sm:mx-0 sm:rounded-2xl sm:border sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                No se encontraron tablas clínicas para los filtros seleccionados.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Prueba cambiando el ámbito clínico o buscando términos como KDIGO, HTA, diabetes, asma, sepsis o dengue.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Mostrando {filteredCalculators.length} de {CALCULATOR_CATALOG.length} herramientas para verificación técnica
          </div>

          {filteredCalculators.length > 0 ? (
            <div className="space-y-3">
              {filteredCalculators.map((calc) => {
                const spec = SPECIALTY_MAP[calc.primarySpecialty];
                const visual = SPECIALTY_VISUALS[calc.primarySpecialty];
                const formulaInfo = formulaMap.get(calc.id);
                return (
                  <article
                    key={calc.id}
                    className="-mx-2.5 rounded-none border-x-0 border-y border-slate-200 bg-white px-3.5 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${visual.badgeBgClass} ${visual.iconClass}`}
                      >
                        {visual.renderIcon('h-5 w-5')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                            {spec.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {calc.version}
                          </span>
                        </div>
                        <h2 className="mt-0.5 break-words text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
                          {calc.name}
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                          {calc.description}
                        </p>
                        <p className="mt-1 break-words text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Población validada:
                          </span>{' '}
                          {calc.validatedPopulation}
                        </p>
                      </div>
                    </div>

                    {/* Formula / Scoring Rule Box */}
                    {formulaInfo && (
                      <div className="mt-3 select-text border-l-2 border-sky-600 bg-sky-50/55 py-2 pl-3 pr-2 dark:border-sky-400 dark:bg-sky-950/30">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300">
                          Fórmula / Criterio de cálculo implementado
                        </div>
                        <div className="mt-1 break-words font-mono text-xs leading-relaxed text-slate-900 sm:text-[13px] dark:text-slate-100">
                          {formulaInfo.formulaUsed}
                        </div>
                      </div>
                    )}

                    {/* Collapsible Variables, Points, Contraindications & Limitations */}
                    {formulaInfo && (
                      <details className="group mt-3 border-t border-slate-200/80 pt-1 dark:border-slate-800">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 text-xs font-semibold text-slate-700 select-none hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                          <span>
                            Verificar variables, unidades, puntos y limitaciones ({formulaInfo.variables.length} parámetros)
                          </span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="space-y-3 border-t border-slate-100 pt-2.5 pb-1 text-xs dark:border-slate-800">
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              Indicación clínica
                            </div>
                            <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
                              {calc.clinicalIndication}
                            </p>
                          </div>

                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              Parámetros y puntos de corte
                            </div>
                            <ul className="mt-1 divide-y divide-slate-200/70 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
                              {formulaInfo.variables.map((v) => (
                                <li
                                  key={`${calc.id}-var-${v.id}`}
                                  className="py-1.5 first:pt-1 last:pb-0"
                                >
                                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                                    {v.label}:
                                  </span>{' '}
                                  <span>{v.detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {(calc.contraindications.length > 0 || calc.limitations.length > 0) && (
                            <div className="border-l-2 border-amber-500 bg-amber-50/45 py-2 pl-3 pr-2 dark:border-amber-500/70 dark:bg-amber-950/25">
                              <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                                <ClinicalSafetyShieldIcon className="h-3.5 w-3.5 shrink-0" />
                                <span>Contraindicaciones y limitaciones</span>
                              </div>
                              <ul className="mt-1 space-y-1 text-amber-950/90 dark:text-amber-100/90">
                                {calc.contraindications.map((item, idx) => (
                                  <li key={`${calc.id}-contra-${idx}`}>• {item}</li>
                                ))}
                                {calc.limitations.map((item, idx) => (
                                  <li key={`${calc.id}-limit-${idx}`}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </details>
                    )}

                    <ul className="mt-3 select-text space-y-1.5 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      {calc.references.map((ref, idx) => (
                        <li
                          key={`${calc.id}-ref-${idx}`}
                          className="text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-300"
                        >
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                            [{ref.year}]
                          </span>{' '}
                          <span>{ref.citation}</span>
                          {ref.note && (
                            <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                              Nota: {ref.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    <AcronymLegend
                      className="mt-3"
                      initialLimit={8}
                      sourceText={[
                        calc.name,
                        calc.version,
                        calc.description,
                        calc.clinicalIndication,
                        formulaInfo?.formulaUsed ?? '',
                        ...(formulaInfo?.variables.map((v) => `${v.label} ${v.detail}`) ?? []),
                      ].join(' ')}
                    />
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="-mx-2.5 rounded-none border-x-0 border-y border-slate-200 bg-white p-6 text-center sm:mx-0 sm:rounded-2xl sm:border sm:p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                No se encontraron fórmulas o referencias para “{query}”.
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Prueba buscando por nombre de escala, ecuación, sociedad científica (ADA, ESC, GINA, KDIGO, OMS) o año.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
