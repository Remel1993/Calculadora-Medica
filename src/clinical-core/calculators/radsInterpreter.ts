import { validateCalculatorInputs } from '../math/precision.ts';
import type {
  CalculatorDefinition,
  CalculatorInputsState,
  SelectFieldDef,
  SeverityLevel,
} from '../types/clinical.ts';

interface RadsEntry {
  code: string;
  numericValue: number;
  title: string;
  risk: string;
  severity: SeverityLevel;
  interpretation: string;
  management: string;
  pitfall: string;
}

const BIRADS_DATA: Record<string, RadsEntry> = {
  '0': {
    code: 'BI-RADS 0',
    numericValue: 0,
    title: 'Evaluación incompleta',
    risk: 'Requiere estudios adicionales para asignar riesgo',
    severity: 'moderate',
    interpretation: 'Hallazgo no concluyente en el estudio actual; se necesitan proyecciones adicionales o estudio complementario.',
    management: 'Realizar proyecciones mamográficas adicionales (compresión focal, magnificación), ecografía mamaria dirigida o comparación con estudios previos.',
    pitfall: 'No dejar al paciente sin completar la evaluación ni asumir normalidad con categoría 0.',
  },
  '1': {
    code: 'BI-RADS 1',
    numericValue: 1,
    title: 'Negativo (sin hallazgos)',
    risk: '0 % (riesgo poblacional basal)',
    severity: 'normal',
    interpretation: 'Mamas simétricas sin nódulos, distorsión arquitectural ni microcalcificaciones sospechosas.',
    management: 'Continuar tamizaje anual o bienal habitual según edad y riesgo familiar.',
    pitfall: 'En mamas muy densas (ACR C/D) con masa palpable clínica, la mamografía BI-RADS 1 NO descarta cáncer: solicitar ecografía y biopsia de la lesión palpable.',
  },
  '2': {
    code: 'BI-RADS 2',
    numericValue: 2,
    title: 'Hallazgo definitivamente benigno',
    risk: '~0 %',
    severity: 'normal',
    interpretation: 'Hallazgos típicamente benignos (quiste simple, fibroadenoma calcificado en palomitas, ganglio intramamario, implantes íntegros).',
    management: 'Tamizaje rutinario según edad; no requiere biopsia ni seguimiento acortado.',
    pitfall: 'Confirmar concordancia si existe lesión clínica palpable nueva.',
  },
  '3': {
    code: 'BI-RADS 3',
    numericValue: 3,
    title: 'Probablemente benigno',
    risk: '> 0 % y ≤ 2 %',
    severity: 'low',
    interpretation: 'Hallazgo con probabilidad muy alta de benignidad (ej. nódulo sólido ovalado circunscrito sin calcificaciones sospechosas o asimetría focal no palpable).',
    management: 'Control de imagen a intervalo corto: seguimiento unilateral a los 6 meses, luego bilateral a los 12 y 24 meses. Si permanece estable 2 años -> bajar a BI-RADS 2; si crece/cambia -> subir a BI-RADS 4 y biopsiar.',
    pitfall: 'NO asignar BI-RADS 3 a nódulos palpables nuevos o pacientes sin posibilidad de seguimiento estricto (valorar biopsia).',
  },
  '4a': {
    code: 'BI-RADS 4A',
    numericValue: 4,
    title: 'Baja sospecha de malignidad',
    risk: '> 2 % a ≤ 10 %',
    severity: 'moderate',
    interpretation: 'Requiere confirmación histológica; la mayoría resultarán benignos tras biopsia.',
    management: 'Biopsia con aguja gruesa (tru-cut / core) guiada por ecografía o estereotaxia. Verificar concordancia radio-patológica tras el resultado.',
    pitfall: 'Si el resultado histológico es benigno pero discordante con la imagen, repetir biopsia o escisión.',
  },
  '4b': {
    code: 'BI-RADS 4B',
    numericValue: 4,
    title: 'Sospecha moderada de malignidad',
    risk: '> 10 % a ≤ 50 %',
    severity: 'high',
    interpretation: 'Hallazgos sospechosos intermedios (ej. grupo de microcalcificaciones amorfas/pleomórficas gruesas o masa con márgenes parcialmente indistintos).',
    management: 'Biopsia percutánea con aguja gruesa / vacío obligatoria y correlación radio-patológica en comité o consulta especializada.',
    pitfall: 'Un resultado benigno debe ser revisado cuidadosamente para descartar error de muestreo.',
  },
  '4c': {
    code: 'BI-RADS 4C',
    numericValue: 4,
    title: 'Alta sospecha de malignidad',
    risk: '> 50 % a < 95 %',
    severity: 'critical',
    interpretation: 'Alta probabilidad de malignidad sin cumplir aún todas las características clásicas de categoría 5.',
    management: 'Biopsia histológica urgente (tru-cut/vacío) y derivación prioritaria a Mastología / Oncología. Un resultado histológico benigno suele considerarse discordante.',
    pitfall: 'Si la biopsia es benigna en 4C, rebiopsiar o realizar biopsia escisional.',
  },
  '5': {
    code: 'BI-RADS 5',
    numericValue: 5,
    title: 'Altamente sugestivo de malignidad',
    risk: '≥ 95 %',
    severity: 'critical',
    interpretation: 'Hallazgos clásicos de carcinoma (masa espiculada irregular hiperdensa con microcalcificaciones pleomórficas lineales/ramificadas).',
    management: 'Biopsia histológica diagnóstica + marcadores (RE, RP, HER2, Ki-67) + evaluación axilar y derivación inmediata a Oncología / Cirugía Oncológica.',
    pitfall: 'No omitir biopsia preoperatoria: la planificación neoadyuvante depende del subtipo inmunohistoquímico.',
  },
  '6': {
    code: 'BI-RADS 6',
    numericValue: 6,
    title: 'Malignidad conocida comprobada por biopsia',
    risk: '100 % (confirmada)',
    severity: 'critical',
    interpretation: 'Estudio realizado para estadificación, valoración de extensión o respuesta a quimioterapia neoadyuvante antes de cirugía definitiva.',
    management: 'Continuar manejo multidisciplinario oncológico definitivo (cirugía, neoadyuvancia o radioterapia según estadio).',
    pitfall: 'Confirmar que toda la extensión sospechosa adicional haya sido mapeada antes de cirugía conservadora.',
  },
};

const PIRADS_DATA: Record<string, RadsEntry> = {
  '1': {
    code: 'PI-RADS 1',
    numericValue: 1,
    title: 'Muy bajo riesgo',
    risk: 'Cáncer clínicamente significativo altamente improbable',
    severity: 'normal',
    interpretation: 'Arquitectura prostática normal en zona periférica y de transición sin lesiones focales sospechosas.',
    management: 'Seguimiento clínico con PSA según riesgo; habitualmente no requiere biopsia salvo sospecha clínica o densidad de PSA muy elevada (≥ 0.15–0.20 ng/mL²).',
    pitfall: 'Vigilar tendencia de PSA y tacto rectal sospechoso.',
  },
  '2': {
    code: 'PI-RADS 2',
    numericValue: 2,
    title: 'Bajo riesgo',
    risk: 'Cáncer clínicamente significativo improbable',
    severity: 'low',
    interpretation: 'Cambios inflamatorios lineales/en cuña en zona periférica o nódulos típicos de hiperplasia prostática benigna (HPB) encapsulados en zona de transición.',
    management: 'Vigilancia con PSA y evaluación urológica; evitar biopsia innecesaria si densidad de PSA < 0.15 ng/mL² y tacto rectal normal.',
    pitfall: 'La prostatitis granulomatosa o difusión incompleta puede imitar o enmascarar focos pequeños.',
  },
  '3': {
    code: 'PI-RADS 3',
    numericValue: 3,
    title: 'Riesgo intermedio / equívoco',
    risk: '~12–20 % de cáncer clínicamente significativo',
    severity: 'moderate',
    interpretation: 'Presencia de cáncer clínicamente significativo es equívoca; requiere integración con variables clínicas y densidad de PSA (PSAD).',
    management: 'Integrar Densidad de PSA (PSAD): si PSAD ≥ 0.15 ng/mL², historia familiar o tacto anormal -> biopsia prostática dirigida + sistemática; si PSAD < 0.10–0.15 -> valorar seguimiento estrecho con PSA / RM.',
    pitfall: 'Biopsiar sistemáticamente todo PI-RADS 3 con PSAD muy baja aumenta sobrediagnóstico.',
  },
  '4': {
    code: 'PI-RADS 4',
    numericValue: 4,
    title: 'Alto riesgo',
    risk: '~45–60 % de cáncer clínicamente significativo',
    severity: 'high',
    interpretation: 'Lesión focal sospechosa (< 1.5 cm, marcada restricción en difusión/ADC bajo en ZP o lenticular mal definida en ZT) con alta probabilidad de neoplasia.',
    management: 'Biopsia prostática dirigida (fusión RM/ecografía o cognitiva) + biopsia sistemática recomendada por Urología.',
    pitfall: 'Si la biopsia inicial resulta negativa ante PI-RADS 4, reevaluar concordancia y considerar rebiopsia.',
  },
  '5': {
    code: 'PI-RADS 5',
    numericValue: 5,
    title: 'Muy alto riesgo',
    risk: '~75–90 % de cáncer clínicamente significativo',
    severity: 'critical',
    interpretation: 'Lesión ≥ 1.5 cm o con extensión extraprostática / invasión de vesículas seminales.',
    management: 'Biopsia dirigida + sistemática prioritaria por Urología / Uro-oncología y estadificación según grupo de riesgo (ISUP/Gleason y PSA).',
    pitfall: 'Evaluar ganglios pélvicos e invasión neurovascular en la misma RMmp.',
  },
};

const ORADS_DATA: Record<string, RadsEntry> = {
  '0': {
    code: 'O-RADS 0',
    numericValue: 0,
    title: 'Evaluación incompleta',
    risk: 'No determinable',
    severity: 'moderate',
    interpretation: 'Estudio ecográfico limitado técnicamente (interposición gaseosa, masa demasiado grande o visión parcial).',
    management: 'Repetir ecografía transvaginal/transabdominal optimizada o solicitar RM pélvica con protocolo O-RADS MRI.',
    pitfall: 'No asumir benignidad si no se visualizó completamente el ovario/lesión.',
  },
  '1': {
    code: 'O-RADS 1',
    numericValue: 1,
    title: 'Ovario normal (fisiológico premenopáusico)',
    risk: '0 % malignidad',
    severity: 'normal',
    interpretation: 'Folículo (≤ 3 cm) o cuerpo lúteo (≤ 3 cm) en mujer premenopáusica.',
    management: 'Sin seguimiento ecográfico ni intervención.',
    pitfall: 'En posmenopausia no aplica estado fisiológico ovulatorio: todo quiste simple posmenopáusico es al menos O-RADS 2.',
  },
  '2': {
    code: 'O-RADS 2',
    numericValue: 2,
    title: 'Casi ciertamente benigno',
    risk: '< 1 % malignidad',
    severity: 'low',
    interpretation: 'Quiste simple ≤ 10 cm, quiste hemorrágico típico ≤ 5 cm, dermoide/endometrioma típico < 10 cm o quiste paraovárico/hidrosálpinx típico.',
    management: 'Manejo conservador por Ginecología: en premenopáusicas con quiste simple ≤ 3–5 cm sin seguimiento; > 5 a < 10 cm control en 8–12 sem o 1 año; en posmenopáusicas con quiste simple > 3 a < 10 cm control ecográfico en 1 año.',
    pitfall: 'Si el quiste clásico supera 10 cm asciende a O-RADS 3.',
  },
  '3': {
    code: 'O-RADS 3',
    numericValue: 3,
    title: 'Bajo riesgo de malignidad',
    risk: '1 % a < 10 %',
    severity: 'moderate',
    interpretation: 'Quiste simple ≥ 10 cm, lesión típica > 10 cm, quiste unilocular de pared irregular o multilocular de pared lisa < 10 cm con score Doppler 1–3.',
    management: 'Manejo por Ginecología general; valorar marcadores tumorales (CA-125, HE4 / ROMA o RMI) y/o RM O-RADS si duda diagnóstica antes de cirugía.',
    pitfall: 'En paciente posmenopáusica correlacionar siempre con CA-125 y evolución.',
  },
  '4': {
    code: 'O-RADS 4',
    numericValue: 4,
    title: 'Riesgo intermedio de malignidad',
    risk: '10 % a < 50 %',
    severity: 'high',
    interpretation: 'Quiste multilocular ≥ 10 cm o con pared interna irregular, lesión sólida de contorno liso (Doppler 2–3), o lesión quística con componente sólido/proyecciones papilares (1–3 papilas).',
    management: 'Interconsulta con Ginecólogo Oncólogo o realización de RM pélvica con protocolo O-RADS MRI + biomarcadores (CA-125, ROMA/RMI) para definir abordaje oncológico.',
    pitfall: 'Evitar cirugía laparoscópica sin estadificación/bolsa extractora ante riesgo de ruptura tumoral.',
  },
  '5': {
    code: 'O-RADS 5',
    numericValue: 5,
    title: 'Alto riesgo de malignidad',
    risk: '≥ 50 %',
    severity: 'critical',
    interpretation: 'Lesión quística con ≥ 4 proyecciones papilares, lesión sólida de contorno irregular, lesión multilocular con componente sólido y flujo Doppler marcado (score 4), ascitis o nódulos peritoneales.',
    management: 'Referencia directa y prioritaria a Ginecología Oncológica (cálculo de RMI / ROMA, TC tórax-abdomen-pelvis para estadificación y valoración de citorreducción).',
    pitfall: 'No drenar ni puncionar masas O-RADS 5 aisladas por riesgo de diseminación peritoneal.',
  },
};

const LIRADS_DATA: Record<string, RadsEntry> = {
  'LR-NC': {
    code: 'LI-RADS NC',
    numericValue: 0,
    title: 'No categorizable',
    risk: 'Evaluación limitada',
    severity: 'moderate',
    interpretation: 'Artefactos técnicos u omisión de fases arterial/portal/tardía impiden clasificar la observación.',
    management: 'Repetir TC/RM multifásica con contraste adecuado en ≤ 3 meses o usar modalidad alternativa.',
    pitfall: 'LI-RADS SOLO aplica en pacientes de alto riesgo de CHC (cirrosis, VHB crónica o antecedente de CHC).',
  },
  'LR-1': {
    code: 'LI-RADS 1',
    numericValue: 1,
    title: 'Definitivamente benigno',
    risk: '0 % CHC',
    severity: 'normal',
    interpretation: 'Quiste hepático simple, hemangioma clásico o alteración de perfusión benigna definitiva.',
    management: 'Regresar a vigilancia semestral habitual de cirrosis/VHB (cada 6 meses).',
    pitfall: 'No biopsiar hemangiomas típicos.',
  },
  'LR-2': {
    code: 'LI-RADS 2',
    numericValue: 2,
    title: 'Probablemente benigno',
    risk: '~13 % CHC / 14 % malignidad en series',
    severity: 'low',
    interpretation: 'Observación distintiva < 20 mm sin características mayores ni auxiliares de malignidad (nódulo regenerativo/displásico de bajo grado).',
    management: 'Vigilancia diagnóstica en ≤ 6 meses (ecografía o imagen repetida según protocolo hepatológico).',
    pitfall: 'Confirmar que no haya crecimiento umbral en estudios comparativos.',
  },
  'LR-3': {
    code: 'LI-RADS 3',
    numericValue: 3,
    title: 'Probabilidad intermedia de malignidad',
    risk: '~38 % CHC',
    severity: 'moderate',
    interpretation: 'No cumple criterios suficientes de LR-5 ni características de benignidad definitiva.',
    management: 'Repetir imagen o usar modalidad diagnóstica alternativa en 3–6 meses (o discusión multidisciplinaria si duda clínica).',
    pitfall: 'Un ~38 % evolucionan o corresponden a CHC: no espaciar más de 6 meses.',
  },
  'LR-4': {
    code: 'LI-RADS 4',
    numericValue: 4,
    title: 'Probablemente Carcinoma Hepatocelular (CHC)',
    risk: '~74 % CHC (~80 % malignidad)',
    severity: 'high',
    interpretation: 'Alta sospecha de CHC (ej. hiperrealce arterial no periférico + lavado o cápsula sin alcanzar todos los criterios de LR-5).',
    management: 'Presentar en Comité Multidisciplinario de Tumores Hepáticos: valorar biopsia dirigida, imagen con contraste hepatobiliar o seguimiento estrecho (≤ 3 meses).',
    pitfall: 'No iniciar tratamiento ablativo/quimioembolización sin consenso multidisciplinario en LR-4.',
  },
  'LR-5': {
    code: 'LI-RADS 5',
    numericValue: 5,
    title: 'Definitivamente Carcinoma Hepatocelular (CHC)',
    risk: '~94 % CHC (~98 % malignidad)',
    severity: 'critical',
    interpretation: 'Cumple criterios diagnósticos no invasivos de CHC en paciente de alto riesgo (≥ 10 mm con hiperrealce arterial + lavado/cápsula/crecimiento umbral).',
    management: 'Diagnóstico definitivo de CHC sin necesidad rutinaria de biopsia confirmatoria; estadificar (BCLC, Child-Pugh, MELD-Na) y tratar en Comité Oncológico Hepático.',
    pitfall: 'Si el paciente NO tiene cirrosis ni VHB crónica, LI-RADS NO es válido y sí se requiere biopsia.',
  },
  'LR-M': {
    code: 'LI-RADS M',
    numericValue: 6,
    title: 'Probable o definitivamente maligno, no específico de CHC',
    risk: '~93 % malignidad (colangiocarcinoma, mixto o metástasis)',
    severity: 'critical',
    interpretation: 'Realce en anillo (targetoid), restricción periférica o lavado precoz sugestivos de colangiocarcinoma intrahepático o metástasis más que CHC típico.',
    management: 'Comité multidisciplinario + BIOPSIA hepática diagnóstica recomendada para tipificación histológica exacta.',
    pitfall: 'No asumir CHC ni usar criterios de trasplante estándar sin histología en LR-M.',
  },
  'LR-TIV': {
    code: 'LI-RADS TIV',
    numericValue: 7,
    title: 'Tumor en vena (invasión vascular macroscópica)',
    risk: 'Malignidad con invasión portal/suprahepática',
    severity: 'critical',
    interpretation: 'Tejido blando con realce dentro de vena porta o suprahepática (diferenciar de trombo blando no tumoral).',
    management: 'Evaluación urgente en Oncología / Hepatología (estadio avanzado BCLC C; contraindicación habitual para trasplante hepático estándar).',
    pitfall: 'Distinguir de trombo portal blando mediante presencia de realce arterial intravascular.',
  },
};

const LUNGRADS_DATA: Record<string, RadsEntry> = {
  '0': {
    code: 'Lung-RADS 0',
    numericValue: 0,
    title: 'Evaluación incompleta',
    risk: 'Indeterminado',
    severity: 'moderate',
    interpretation: 'Faltan TC previas para comparar o estudio técnicamente incompleto / inflamación aguda transitoria.',
    management: 'Obtener TC previas o repetir TC torácica de baja dosis en 1–3 meses.',
    pitfall: 'Los nódulos inflamatorios/infecciosos agudos pueden resolverse a los 1–3 meses.',
  },
  '1': {
    code: 'Lung-RADS 1',
    numericValue: 1,
    title: 'Negativo (sin nódulos o benigno)',
    risk: '< 1 % malignidad',
    severity: 'normal',
    interpretation: 'Sin nódulos pulmonares o con calcificación benigna completa/grasa macroscópica (hamartoma).',
    management: 'Continuar tamizaje anual con TC de baja dosis (12 meses) si sigue cumpliendo criterios.',
    pitfall: 'Asegurar abandono del tabaquismo como medida preventiva principal.',
  },
  '2': {
    code: 'Lung-RADS 2',
    numericValue: 2,
    title: 'Apariencia o comportamiento benigno',
    risk: '< 1 % malignidad',
    severity: 'low',
    interpretation: 'Nódulo sólido < 6 mm (< 4 mm nuevo), parcialmente sólido < 6 mm o en vidrio deslustrado < 30 mm (o ≥ 30 mm estable).',
    management: 'Continuar tamizaje anual con TC de baja dosis (12 meses).',
    pitfall: 'Solo aplica en adultos asintomáticos en programa de cribado; no usar en pacientes con cáncer activo conocido.',
  },
  '3': {
    code: 'Lung-RADS 3',
    numericValue: 3,
    title: 'Probablemente benigno',
    risk: '1–2 % malignidad',
    severity: 'moderate',
    interpretation: 'Nódulo sólido basal ≥ 6 a < 8 mm (o nuevo 4 a < 6 mm), parcialmente sólido ≥ 6 mm con componente sólido < 6 mm, o vidrio deslustrado ≥ 30 mm basal.',
    management: 'Repetir TC torácica de baja dosis en 6 meses.',
    pitfall: 'Vigilar crecimiento ≥ 1.5 mm en diámetro medio.',
  },
  '4a': {
    code: 'Lung-RADS 4A',
    numericValue: 4,
    title: 'Sospechoso',
    risk: '5–15 % malignidad',
    severity: 'high',
    interpretation: 'Nódulo sólido ≥ 8 a < 15 mm (o en crecimiento < 8 mm / nuevo 6 a < 8 mm), o parcialmente sólido con componente sólido ≥ 6 a < 8 mm, o nódulo endobronquial.',
    management: 'TC torácica de baja dosis en 3 meses; si componente sólido ≥ 8 mm considerar PET/TC con 18F-FDG y valoración por Neumología/Oncología.',
    pitfall: 'En nódulos endobronquiales o infecciosos descartar tapón mucoso mediante TC en 3 meses o broncoscopia.',
  },
  '4b': {
    code: 'Lung-RADS 4B',
    numericValue: 5,
    title: 'Muy sospechoso',
    risk: '> 15 % malignidad',
    severity: 'critical',
    interpretation: 'Nódulo sólido ≥ 15 mm (o nuevo/creciente ≥ 8 mm) o parcialmente sólido con componente sólido ≥ 8 mm.',
    management: 'TC torácica diagnóstica (con o sin contraste), PET/TC y/o toma de biopsia / comité multidisciplinario de cáncer de pulmón sin demora.',
    pitfall: 'No esperar 3–6 meses ante un Lung-RADS 4B claro sin evaluación neumológica/oncológica.',
  },
  '4x': {
    code: 'Lung-RADS 4X',
    numericValue: 6,
    title: 'Categoría 3 o 4 con características adicionales de alta sospecha',
    risk: '> 15 % malignidad',
    severity: 'critical',
    interpretation: 'Espiculación marcada, duplicación en < 1 año, linfadenopatía mediastínica o masa asociada que eleva el riesgo más allá del tamaño aislado.',
    management: 'Evaluación diagnóstica inmediata (TC diagnóstica, PET/TC, biopsia) y comité multidisciplinario de tórax.',
    pitfall: 'Incluso nódulos pequeños con adenopatías hiliares/mediastínicas sospechosas escalan a 4X.',
  },
};

const systemField: SelectFieldDef = {
  id: 'radsSystem',
  label: 'Sistema RADS de imagen',
  type: 'select',
  defaultValue: 'birads',
  options: [
    { value: 'birads', label: 'BI-RADS — Mama (Mamografía / Ecografía / RM)' },
    { value: 'pirads', label: 'PI-RADS v2.1 — Próstata (RM multiparamétrica)' },
    { value: 'orads', label: 'O-RADS US v2022 — Ovario / Masa anexial (Ecografía)' },
    { value: 'lirads', label: 'LI-RADS — Hígado en riesgo de CHC (TC / RM)' },
    { value: 'lungrads', label: 'Lung-RADS v2022 — Tamizaje Pulmón (TC baja dosis)' },
  ],
};

const biradsCatField: SelectFieldDef = {
  id: 'biradsCat',
  label: 'Categoría BI-RADS',
  type: 'select',
  defaultValue: '4b',
  visibleWhen: (inputs) => inputs.radsSystem === 'birads',
  options: [
    { value: '0', label: 'BI-RADS 0 — Evaluación incompleta' },
    { value: '1', label: 'BI-RADS 1 — Negativo' },
    { value: '2', label: 'BI-RADS 2 — Benigno' },
    { value: '3', label: 'BI-RADS 3 — Probablemente benigno (≤ 2 %)' },
    { value: '4a', label: 'BI-RADS 4A — Baja sospecha (> 2 % a ≤ 10 %)' },
    { value: '4b', label: 'BI-RADS 4B — Sospecha moderada (> 10 % a ≤ 50 %)' },
    { value: '4c', label: 'BI-RADS 4C — Alta sospecha (> 50 % a < 95 %)' },
    { value: '5', label: 'BI-RADS 5 — Altamente sugestivo de malignidad (≥ 95 %)' },
    { value: '6', label: 'BI-RADS 6 — Malignidad confirmada por biopsia' },
  ],
};

const piradsCatField: SelectFieldDef = {
  id: 'piradsCat',
  label: 'Categoría PI-RADS v2.1',
  type: 'select',
  defaultValue: '4',
  visibleWhen: (inputs) => inputs.radsSystem === 'pirads',
  options: [
    { value: '1', label: 'PI-RADS 1 — Riesgo muy bajo' },
    { value: '2', label: 'PI-RADS 2 — Riesgo bajo' },
    { value: '3', label: 'PI-RADS 3 — Riesgo intermedio / equívoco' },
    { value: '4', label: 'PI-RADS 4 — Riesgo alto' },
    { value: '5', label: 'PI-RADS 5 — Riesgo muy alto' },
  ],
};

const oradsCatField: SelectFieldDef = {
  id: 'oradsCat',
  label: 'Categoría O-RADS US (Ecografía anexial)',
  type: 'select',
  defaultValue: '4',
  visibleWhen: (inputs) => inputs.radsSystem === 'orads',
  options: [
    { value: '0', label: 'O-RADS 0 — Evaluación incompleta' },
    { value: '1', label: 'O-RADS 1 — Ovario fisiológico normal (0 %)' },
    { value: '2', label: 'O-RADS 2 — Casi ciertamente benigno (< 1 %)' },
    { value: '3', label: 'O-RADS 3 — Bajo riesgo (1 % a < 10 %)' },
    { value: '4', label: 'O-RADS 4 — Riesgo intermedio (10 % a < 50 %)' },
    { value: '5', label: 'O-RADS 5 — Alto riesgo (≥ 50 %)' },
  ],
};

const liradsCatField: SelectFieldDef = {
  id: 'liradsCat',
  label: 'Categoría LI-RADS (Hígado)',
  type: 'select',
  defaultValue: 'LR-4',
  visibleWhen: (inputs) => inputs.radsSystem === 'lirads',
  options: [
    { value: 'LR-NC', label: 'LR-NC — No categorizable' },
    { value: 'LR-1', label: 'LR-1 — Definitivamente benigno' },
    { value: 'LR-2', label: 'LR-2 — Probablemente benigno' },
    { value: 'LR-3', label: 'LR-3 — Probabilidad intermedia de CHC' },
    { value: 'LR-4', label: 'LR-4 — Probablemente CHC' },
    { value: 'LR-5', label: 'LR-5 — Definitivamente CHC' },
    { value: 'LR-M', label: 'LR-M — Probable/definitivamente maligno no específico de CHC' },
    { value: 'LR-TIV', label: 'LR-TIV — Tumor en vena' },
  ],
};

const lungradsCatField: SelectFieldDef = {
  id: 'lungradsCat',
  label: 'Categoría Lung-RADS v2022',
  type: 'select',
  defaultValue: '4a',
  visibleWhen: (inputs) => inputs.radsSystem === 'lungrads',
  options: [
    { value: '0', label: 'Lung-RADS 0 — Incompleta' },
    { value: '1', label: 'Lung-RADS 1 — Negativo (< 1 %)' },
    { value: '2', label: 'Lung-RADS 2 — Apariencia benigna (< 1 %)' },
    { value: '3', label: 'Lung-RADS 3 — Probablemente benigno (1–2 %)' },
    { value: '4a', label: 'Lung-RADS 4A — Sospechoso (5–15 %)' },
    { value: '4b', label: 'Lung-RADS 4B — Muy sospechoso (> 15 %)' },
    { value: '4x', label: 'Lung-RADS 4X — Sospecha adicional alta (> 15 %)' },
  ],
};

export const radsInterpreterCalculator: CalculatorDefinition = {
  id: 'rads-imaging-interpreter',
  name: 'Sistemas RADS Oncológicos (BI-RADS, PI-RADS, O-RADS, LI-RADS, Lung-RADS)',
  shortName: 'Sistemas RADS (BI/PI/O/LI/Lung)',
  primarySpecialty: 'oncologia',
  secondarySpecialties: ['gineco-obstetricia', 'urologia', 'medicina-interna', 'cirugia-general', 'gastroenterologia', 'neumologia'],
  subcategory: 'diagnostico',
  keywords: [
    'rads',
    'bi-rads',
    'birads',
    'pi-rads',
    'pirads',
    'o-rads',
    'orads',
    'li-rads',
    'lirads',
    'lung-rads',
    'lungrads',
    'mamografia',
    'prostata',
    'ovario',
    'higado',
    'pulmon',
  ],
  description:
    'Intérprete clínico unificado de las categorías ACR RADS (mama, próstata, ovario/anexo, hígado y tamizaje pulmonar) con riesgo de malignidad y conducta diagnóstica recomendada.',
  clinicalIndication:
    'Interpretación rápida en consulta externa, urgencias u oncología de reportes imagenológicos estandarizados con sistemas RADS.',
  validatedPopulation: 'Adultos evaluados según población diana de cada sistema ACR RADS (ej. LI-RADS solo en alto riesgo de CHC).',
  contraindications: [
    'LI-RADS no debe aplicarse en pacientes sin cirrosis, sin VHB crónica ni antecedente de CHC, ni en menores de 18 años.',
    'O-RADS US v2022 y Lung-RADS no deben sustituir la valoración clínica en pacientes sintomáticos agudos (ej. torsión ovárica o hemoptisis masiva).',
  ],
  limitations: [
    'La categoría radiológica debe integrarse con síntomas, exploración física (ej. nódulo mamario palpable), biomarcadores (PSA/PSAD, CA-125, AFP) y anatomía patológica.',
  ],
  version: 'ACR BI-RADS 5.ª ed. · PI-RADS v2.1 · O-RADS US v2022 · LI-RADS v2018 · Lung-RADS v2022',
  references: [
    {
      citation: 'D’Orsi CJ, Sickles EA, Mendelson EB, Morris EA. ACR BI-RADS Atlas, Breast Imaging Reporting and Data System. 5th ed. Reston, VA: American College of Radiology; 2013.',
      year: 2013,
    },
    {
      citation: 'Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging Reporting and Data System Version 2.1: 2019 Update. Eur Urol. 2019;76(3):340-351.',
      year: 2019,
    },
    {
      citation: 'Strachowski LM, Jha P, Phillips CH, et al. O-RADS US v2022: An Update from the American College of Radiology’s Ovarian-Adnexal Reporting and Data System US Committee. Radiology. 2023;308(3):e230685.',
      year: 2023,
    },
    {
      citation: 'American College of Radiology. CT/MRI LI-RADS v2018 & Lung-RADS v2022 Assessment Categories.',
      year: 2022,
    },
  ],
  fields: [
    systemField,
    biradsCatField,
    piradsCatField,
    oradsCatField,
    liradsCatField,
    lungradsCatField,
  ],
  calculate(inputs: CalculatorInputsState) {
    const errors = validateCalculatorInputs(radsInterpreterCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors.map((e) => e.message).join(' '));
    }

    const system = String(inputs.radsSystem ?? 'birads');
    let entry: RadsEntry;
    let rawKey = '';

    if (system === 'birads') {
      rawKey = String(inputs.biradsCat ?? '4b');
      entry = BIRADS_DATA[rawKey] ?? BIRADS_DATA['4b'];
    } else if (system === 'pirads') {
      rawKey = String(inputs.piradsCat ?? '4');
      entry = PIRADS_DATA[rawKey] ?? PIRADS_DATA['4'];
    } else if (system === 'orads') {
      rawKey = String(inputs.oradsCat ?? '4');
      entry = ORADS_DATA[rawKey] ?? ORADS_DATA['4'];
    } else if (system === 'lirads') {
      rawKey = String(inputs.liradsCat ?? 'LR-4');
      entry = LIRADS_DATA[rawKey] ?? LIRADS_DATA['LR-4'];
    } else {
      rawKey = String(inputs.lungradsCat ?? '4a');
      entry = LUNGRADS_DATA[rawKey] ?? LUNGRADS_DATA['4a'];
    }

    return {
      primaryResult: {
        label: 'Categoría asignada',
        value: entry.numericValue,
        formattedValue: entry.code,
        unit: entry.title,
      },
      secondaryResults: [
        {
          label: 'Riesgo estimado de malignidad',
          formattedValue: entry.risk,
          unit: '',
        },
        {
          label: 'Conducta principal',
          formattedValue: entry.management,
          unit: '',
        },
      ],
      severity: entry.severity,
      riskClassification: `${entry.code} · ${entry.title}`,
      clinicalInterpretation: `${entry.interpretation} Probabilidad estimada de malignidad: ${entry.risk}.`,
      guidance: [
        `Conducta recomendada: ${entry.management}`,
        `Precaución clave: ${entry.pitfall}`,
      ],
      guidanceDisclaimer:
        'Las decisiones de biopsia, seguimiento o cirugía deben individualizarse en comité multidisciplinario o según evaluación clínica directa.',
      formulaUsed: `Mapeo oficial ACR ${entry.code} (riesgo de malignidad y algoritmo de conducta estándar)`,
      inputsSummary: `Sistema=${system.toUpperCase()}, Categoría=${entry.code}`,
    };
  },
};
