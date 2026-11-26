import {
  formatClinicalNumber,
  getCanonicalNumberValue,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import type {
  BooleanFieldDef,
  CalculatorDefinition,
  CalculatorInputsState,
  NumberFieldDef,
  NumberInputValue,
  SecondaryResultItem,
  SelectFieldDef,
} from '../types/clinical.ts';
import { WEIGHT_UNITS_KG } from '../units/converters.ts';

const syndromeField: SelectFieldDef = {
  id: 'stiEntity',
  label: 'ETS / Síndrome clínico (exclusivamente Infecciones de Transmisión Sexual)',
  type: 'select',
  defaultValue: 'syphilis_early',
  options: [
    { value: 'syphilis_early', label: 'Sífilis primaria, secundaria o latente temprana (< 1 año)' },
    { value: 'syphilis_late', label: 'Sífilis latente tardía (> 1 año) o duración desconocida' },
    { value: 'neurosyphilis', label: 'Neurosífilis, sífilis ocular o sífilis ótica' },
    { value: 'genital_herpes_first', label: 'Herpes Simple Genital (VHS-1/2): Primer episodio clínico' },
    { value: 'genital_herpes_recurrent', label: 'Herpes Simple Genital: Episodio recurrente o terapia supresiva' },
    { value: 'chancroid', label: 'Chancro Blando / Chancroide (Haemophilus ducreyi)' },
    { value: 'lgv_donovanosis', label: 'Linfogranuloma Venéreo (LGV) o Donovanosis' },
    { value: 'chlamydia_ng', label: 'Infección por Chlamydia trachomatis (no LGV) / UNG' },
    { value: 'trichomoniasis', label: 'Tricomoniasis (Trichomonas vaginalis)' },
  ],
};

const weightField: NumberFieldDef = {
  id: 'weightKg',
  label: 'Peso del paciente (para dosis pediátricas de penicilina si < 48 kg)',
  type: 'number',
  required: false,
  canonicalUnit: 'kg',
  units: WEIGHT_UNITS_KG,
  defaultUnitId: 'kg',
  defaultValue: '70',
  min: 2,
  max: 250,
  placeholder: 'Ej. 70',
  helpText:
    'En sífilis pediátrica: Penicilina G benzatínica 50,000 UI/kg IM (máx 2,400,000 UI).',
};

const pregnantField: BooleanFieldDef = {
  id: 'pregnant',
  label: 'Paciente embarazada (prioridad de prevención de sífilis congénita y herpes neonatal)',
  type: 'boolean',
  defaultValue: false,
};

const penicillinAllergyField: BooleanFieldDef = {
  id: 'penicillinAllergy',
  label: 'Alergia confirmada a penicilina (si sífilis en embarazo exige desensibilización)',
  type: 'boolean',
  defaultValue: false,
};

export const stiSyndromesCalculator: CalculatorDefinition = {
  id: 'sti-ulcer-discharge',
  name: 'Infecciones de Transmisión Sexual (ETS): Sífilis, Herpes Simple, Chancroide, Chlamydia, LGV y Tricomoniasis',
  shortName: 'ETS: Sífilis, VHS, Chancroide',
  primarySpecialty: 'infectologia',
  secondarySpecialties: ['gineco-obstetricia', 'urologia', 'dermatologia', 'medicina-interna'],
  subcategory: 'dosificacion',
  keywords: [
    'ets',
    'its',
    'sifilis',
    'sífilis',
    'treponema pallidum',
    'penicilina benzatinica',
    'neurosifilis',
    'herpes simple',
    'herpes genital',
    'vhs',
    'chancro',
    'chancroide',
    'haemophilus ducreyi',
    'lgv',
    'linfogranuloma venereo',
    'donovanosis',
    'chlamydia',
    'clamidia',
    'tricomoniasis',
    'metronidazol',
  ],
  description:
    'Esquemas terapéuticos específicos exclusivamente para ETS ulcerativas y exudativas (complementario a Gonorrea): Sífilis en todos sus estadios, Herpes Simple Genital, Chancroide, LGV/Donovanosis, Chlamydia y Tricomoniasis según CDC STI 2021 y OMS.',
  clinicalIndication:
    'Manejo sindrómico y etiológico de úlceras genitales, proctitis, uretritis/cervicitis no gonocócica y sífilis gestacional o neurológica.',
  validatedPopulation:
    'Adultos, adolescentes y gestantes (con ajuste pediátrico para sífilis); las tablas y dosis excluyen patologías no ETS como Herpes Zóster.',
  contraindications: [
    'En Sífilis durante el embarazo con alergia a penicilina: NO usar doxiciclina, azitromicina ni ceftriaxona como sustituto definitivo; realizar DESENSIBILIZACIÓN a penicilina hospitalaria obligatoria.',
    'CONTRAINDICADA Doxiciclina en embarazo (usar Azitromicina 1 g DU en Chlamydia/chancroide o Eritromicina en LGV).',
    'No utilizar nitroimidazoles en dosis única de 2 g como primera línea en mujeres con tricomoniasis (CDC 2021 prefiere Metronidazol 500 mg c/12 h × 7 días por mayor tasa de curación).',
  ],
  limitations: [
    'En úlceras genitales, la coinfección es frecuente (sífilis + herpes simple o chancroide); solicitar siempre VDRL/RPR, prueba treponémica, VIH y PCR/cultivo de VHS.',
    'Las pruebas serológicas tempranas (VDRL/RPR) pueden ser falsamente negativas en chancro sifilítico inicial (10–30 %); repetir a las 2–4 semanas si sospecha clínica alta.',
  ],
  requiredLabsNote:
    'Tamizaje sistemático de VIH, sífilis (VDRL/RPR + prueba treponémica) y hepatitis B/C en todo paciente con una ETS.',
  version: 'CDC STI Treatment Guidelines 2021 · WHO STI Guidelines 2024',
  references: [
    {
      citation:
        'Workowski KA, Bachmann LH, Chan PA, et al. Sexually Transmitted Infections Treatment Guidelines, 2021. MMWR Recomm Rep. 2021;70(4):1-187.',
      year: 2021,
    },
    {
      citation:
        'World Health Organization (WHO). Guidelines for the management of symptomatic sexually transmitted infections & Syphilis updates. Geneva: WHO; 2024.',
      year: 2024,
    },
  ],
  fields: [syndromeField, weightField, pregnantField, penicillinAllergyField],
  calculate: (inputs: CalculatorInputsState) => {
    const errors = validateCalculatorInputs(stiSyndromesCalculator, inputs);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }

    const sti = String(inputs.stiEntity ?? 'syphilis_early');
    const weightKg = getCanonicalNumberValue(
      weightField,
      inputs.weightKg as NumberInputValue | undefined,
    ).canonicalValue;
    const pregnant = inputs.pregnant === true;
    const penAllergy = inputs.penicillinAllergy === true;

    const pedBenzUi =
      weightKg !== null && weightKg < 48
        ? roundClinical(Math.min(weightKg * 50000, 2400000), 0)
        : 2400000;

    if (sti === 'syphilis_early' || sti === 'syphilis_late' || sti === 'neurosyphilis') {
      const isNeuro = sti === 'neurosyphilis';
      const isLate = sti === 'syphilis_late';

      if (isNeuro) {
        return {
          primaryResult: {
            label: 'Neurosífilis / Ocular / Ótica',
            value: 18,
            formattedValue: penAllergy && !pregnant
              ? 'Ceftriaxona 2 g IV/d × 10–14 d (o desensibilizar)'
              : 'Penicilina G cristalina 18–24 M UI/día IV',
            unit: '3–4 M UI IV c/4 h × 10–14 días',
          },
          secondaryResults: [
            {
              label: 'Alternativa ambulatoria (solo si adherencia asegurada)',
              formattedValue: 'Penicilina G procaína 2.4 M UI IM/d + Probenecid 500 mg c/6 h × 10–14 d',
              unit: 'Si alergia en embarazo: desensibilización obligatoria',
            },
          ],
          severity: 'critical',
          riskClassification: 'Neurosífilis / Sífilis Ocular u Ótica — Tratamiento Intravenoso Urgente',
          clinicalInterpretation:
            'Compromiso del sistema nervioso central, uveítis/retinitis sifilítica o hipoacusia neurosensorial. Exige concentraciones treponemicidas en LCR.',
          guidance: [
            pregnant && penAllergy
              ? 'Embarazo con alergia a penicilina: realizar DESENSIBILIZACIÓN hospitalaria a penicilina antes de administrar Penicilina G cristalina IV.'
              : 'Administrar Penicilina G sódica cristalina 3–4 millones UI IV c/4 h (o infusión continua 18–24 M UI/día) durante 10–14 días.',
            'Vigilar reacción de Jarisch-Herxheimer en las primeras 24 horas (fiebre, mialgias, empeoramiento neurológico/ocular transitorio; valorar corticoides en sífilis ocular/ótica).',
          ],
          formulaUsed: 'CDC STI 2021: Penicilina G cristalina 18–24 millones UI/día IV × 10–14 días',
          inputsSummary: `Estadio: Neurosífilis/Ocular · Embarazo: ${pregnant ? 'Sí' : 'No'} · Alergia penicilina: ${penAllergy ? 'Sí' : 'No'}`,
        };
      }

      const benzLabel = isLate
        ? '2.4 M UI IM semanal × 3 sem (7.2 M UI total)'
        : `${formatClinicalNumber(pedBenzUi, 0)} UI IM dosis única`;

      const altText = pregnant
        ? 'Desensibilización a Penicilina OBLIGATORIA (no usar doxiciclina)'
        : isLate
          ? 'Doxiciclina 100 mg VO c/12 h × 28 días'
          : 'Doxiciclina 100 mg VO c/12 h × 14 días';

      return {
        primaryResult: {
          label: isLate ? 'Sífilis Latente Tardía' : 'Sífilis Temprana (1.ª/2.ª/< 1 a)',
          value: pedBenzUi,
          formattedValue: penAllergy ? altText : `Penicilina G benzatínica ${isLate ? '2.4 M UI × 3' : formatClinicalNumber(pedBenzUi, 0)}`,
          unit: penAllergy ? (pregnant ? 'Emergencia obstétrica' : 'Alternativa oral') : 'UI vía IM profunda',
        },
        secondaryResults: [
          {
            label: 'Esquema estándar de Penicilina G benzatínica',
            formattedValue: benzLabel,
            unit: isLate ? 'Intervalo estricto c/7 días (máx 9–14 d; reiniciar en embarazo si > 9 d)' : '50,000 UI/kg en niños (máx 2.4 M UI)',
          },
          {
            label: 'Seguimiento serológico no treponémico',
            formattedValue: 'VDRL / RPR cuantitativo a 6 y 12 m (y 24 m si tardía)',
            unit: 'Esperar descenso ≥ 4 veces (2 diluciones)',
          },
        ],
        severity: pregnant ? 'high' : 'moderate',
        riskClassification: isLate
          ? 'Sífilis Latente Tardía / Duración Desconocida'
          : 'Sífilis Temprana (Chancro Duro Indoloro, Secundarismo o Latente < 1 Año)',
        clinicalInterpretation: isLate
          ? 'Infección > 1 año o de inicio indeterminado; requiere 3 dosis semanales consecutivas para cubrir la replicación lenta de Treponema pallidum.'
          : 'Chancro único indoloro de base limpia o exantema maculopapular palmoplantar, condilomas planos y linfadenopatía generalizada.',
        guidance: [
          pregnant
            ? 'En embarazo, si se retrasa > 9 días entre dosis semanales de sífilis tardía, REINICIAR la serie completa de 3 dosis. Advertir sobre reacción de Jarisch-Herxheimer (puede desencadenar contracciones/sufrimiento fetal tras dosis inicial).'
            : 'Tratar presuntivamente a contactos sexuales de los últimos 90 días (aunque serología negativa) y evaluar VIH y otras ITS.',
        ],
        formulaUsed: isLate
          ? 'CDC STI 2021: Penicilina G benzatínica 2.4 M UI IM c/sem × 3 semanas'
          : 'CDC STI 2021: Penicilina G benzatínica 50,000 UI/kg IM (máx 2.4 M UI) dosis única',
        inputsSummary: `Estadio: ${isLate ? 'Latente tardía' : 'Temprana'} · Embarazo: ${pregnant ? 'Sí' : 'No'} · Alergia: ${penAllergy ? 'Sí' : 'No'}`,
      };
    }

    if (sti === 'genital_herpes_first' || sti === 'genital_herpes_recurrent') {
      const isFirst = sti === 'genital_herpes_first';
      return {
        primaryResult: {
          label: isFirst ? 'Primer episodio Herpes Simple Genital' : 'Herpes Genital Recurrente / Supresión',
          value: isFirst ? 400 : 500,
          formattedValue: isFirst
            ? 'Aciclovir 400 mg VO c/8 h × 7–10 d'
            : 'Valaciclovir 500 mg c/12 h × 3 d (episódico)',
          unit: isFirst ? 'o Valaciclovir 1 g VO c/12 h × 7–10 d' : 'Supresión: Aciclovir 400 mg c/12 h',
        },
        secondaryResults: [
          {
            label: 'Manejo obstétrico (si embarazo)',
            formattedValue: 'Terapia supresiva desde 36 SG: Aciclovir 400 mg c/8 h',
            unit: 'Cesárea si lesiones activas o pródromos al parto',
            note: 'Alternativa supresiva en embarazo: Valaciclovir 500 mg VO c/12 h desde las 36 semanas.',
          },
        ],
        severity: pregnant ? 'high' : 'moderate',
        riskClassification: isFirst
          ? 'Herpes Simple Genital (VHS-1 / VHS-2) — Primer Episodio Clínico'
          : 'Herpes Simple Genital Recurrente (Múltiples Vesículas Agrupadas Dolorosas)',
        clinicalInterpretation:
          'Úlceras/vesículas genitales dolorosas sobre base eritematosa; a diferencia de Herpes Zóster (dermatómico unilateral por VVZ), suele ser bilateral o localizado en mucosa genital y recurrente.',
        guidance: [
          isFirst
            ? 'Iniciar Aciclovir 400 mg VO c/8 h (o Valaciclovir 1,000 mg c/12 h o Famciclovir 250 mg c/8 h) × 7–10 días; extender si lesiones no han cicatrizado al día 10.'
            : 'Para recurrencias iniciar dentro de las primeras 24 h: Aciclovir 800 mg c/8 h × 2 días o Valaciclovir 500 mg c/12 h × 3 días; si ≥ 6 episodios/año indicar supresión diaria (Valaciclovir 500–1,000 mg/d o Aciclovir 400 mg c/12 h).',
          'Descartar sífilis (VDRL/RPR) y VIH; aconsejar abstinencia durante lesiones activas o pródromos y uso de preservativo.',
        ],
        formulaUsed: 'CDC STI 2021: Esquemas antivirales específicos para VHS-1/VHS-2 genital',
        inputsSummary: `VHS Genital: ${isFirst ? 'Primer episodio' : 'Recurrente'} · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    if (sti === 'chancroid') {
      return {
        primaryResult: {
          label: 'Chancro Blando (H. ducreyi)',
          value: 1000,
          formattedValue: 'Azitromicina 1 g VO DU · ó Ceftriaxona 250 mg IM DU',
          unit: 'Seguras en embarazo',
        },
        secondaryResults: [
          {
            label: 'Alternativas orales (no gestantes)',
            formattedValue: 'Ciprofloxacino 500 mg VO c/12 h × 3 d · Eritromicina 500 mg c/8 h × 7 d',
            unit: 'Aspirar/drenar bubón fluctuante con aguja si riesgo de ruptura',
          },
        ],
        severity: 'moderate',
        riskClassification: 'Chancroide (Úlcera Genital Dolorosa de Base Purulenta + Bubón Inguinal)',
        clinicalInterpretation:
          'Úlcera necrótica dolorosa con bordes socavados que sangra con facilidad, acompañada en ~50 % de linfadenopatía inguinal dolorosa unilateral supurativa.',
        guidance: [
          'Administrar Azitromicina 1 g VO dosis única o Ceftriaxona 250 mg IM dosis única; reevaluar a los 3–7 días (debe mostrar mejoría sintomática en 3 días y epitelización en 7–14 d).',
          'Siempre descartar sífilis y VHS concomitantes y tratar parejas de los últimos 10 días previos al inicio de síntomas.',
        ],
        formulaUsed: 'CDC STI 2021: Azitromicina 1 g VO DU o Ceftriaxona 250 mg IM DU',
        inputsSummary: `Entidad: Chancroide · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    if (sti === 'lgv_donovanosis') {
      return {
        primaryResult: {
          label: 'LGV (C. trachomatis L1–L3) / Donovanosis',
          value: 21,
          formattedValue: pregnant ? 'Eritromicina 500 mg VO c/6 h × 21 d (o Azitromicina)' : 'Doxiciclina 100 mg VO c/12 h × 21 días',
          unit: 'Esquema prolongado (3 semanas)',
        },
        secondaryResults: [
          {
            label: 'Alternativa LGV / 1.ª línea Donovanosis (Klebsiella granulomatis)',
            formattedValue: 'Azitromicina 1 g VO semanal × ≥ 3 sem (hasta cicatrización completa)',
            unit: 'En LGV: Doxiciclina 21 días es primera línea',
          },
        ],
        severity: 'moderate',
        riskClassification: 'Linfogranuloma Venéreo (Bubón / Proctitis) o Granuloma Inguinal (Donovanosis)',
        clinicalInterpretation:
          'LGV cursa con úlcera fugaz indolora seguida de bubones inguinales ("signo del surco") o proctitis hemorrágica/ulcerativa; Donovanosis presenta úlceras rojo carne muy vascularizadas e indoloras.',
        guidance: [
          pregnant
            ? 'En embarazo: contraindicada doxiciclina; indicar Eritromicina base 500 mg VO c/6 h × 21 d (o Azitromicina 1 g VO/sem × 3 sem) y seguimiento estrecho.'
            : 'En LGV: Doxiciclina 100 mg VO c/12 h × 21 días; en Donovanosis: Azitromicina 1 g/sem (o 500 mg/d) por ≥ 3 semanas hasta resolución total de lesiones.',
        ],
        formulaUsed: 'CDC STI 2021: Doxiciclina 100 mg c/12 h × 21 d (LGV) · Azitromicina ≥ 3 sem (Donovanosis)',
        inputsSummary: `Entidad: LGV/Donovanosis · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    if (sti === 'trichomoniasis') {
      return {
        primaryResult: {
          label: 'Tricomoniasis (T. vaginalis)',
          value: 500,
          formattedValue: 'Mujeres: Metronidazol 500 mg VO c/12 h × 7 d',
          unit: 'Hombres: Metronidazol 2 g VO DU',
        },
        secondaryResults: [
          {
            label: 'Alternativa (Tinidazol 2 g VO DU) / Embarazo',
            formattedValue: pregnant ? 'Metronidazol 500 mg c/12 h × 7 d (seguro en embarazo)' : 'Tinidazol 2 g VO DU (evitar en embarazo)',
            unit: 'Tratar siempre a la pareja sexual simultáneamente',
          },
        ],
        severity: 'low',
        riskClassification: 'Tricomoniasis Genital (ITS Protozoaria)',
        clinicalInterpretation:
          'Flujo vaginal amarillo-verdoso espumoso, eritema vulvovaginal y cérvix "en fresa" (o uretritis en varones); se asocia a mayor riesgo de transmisión de VIH y parto pretérmino.',
        guidance: [
          'En mujeres (con o sin VIH), el CDC recomienda Metronidazol 500 mg VO c/12 h × 7 días (superior a dosis única de 2 g); en varones: Metronidazol 2 g VO dosis única.',
          'Abstinencia sexual hasta completar tratamiento en ambos miembros de la pareja y resolución de síntomas; repetir prueba en mujeres sexualmente activas a los 3 meses por alta reinfección.',
        ],
        formulaUsed: 'CDC STI 2021: Metronidazol 500 mg VO c/12 h × 7 d (mujeres) / 2 g DU (hombres)',
        inputsSummary: `Entidad: Tricomoniasis · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
      };
    }

    // Chlamydia / NGU
    return {
      primaryResult: {
        label: 'Chlamydia trachomatis / UNG',
        value: pregnant ? 1000 : 100,
        formattedValue: pregnant
          ? 'Azitromicina 1 g VO dosis única'
          : 'Doxiciclina 100 mg VO c/12 h × 7 días',
        unit: pregnant ? 'De elección en embarazo' : '1.ª línea CDC STI 2021',
      },
      secondaryResults: [
        {
          label: 'Prueba de curación / Re-tamizaje',
          formattedValue: pregnant ? 'TOC obligatoria a las 4 semanas en embarazo' : 'Re-tamizaje a los 3 meses',
          unit: 'Tratar parejas de últimos 60 días',
        },
      ],
      severity: 'low',
      riskClassification: 'Infección por Chlamydia trachomatis (Cervicitis / Uretritis No Gonocócica)',
      clinicalInterpretation:
        'Principal causa bacteriana de cervicitis mucopurulenta y uretritis no gonocócica; frecuentemente asintomática pero causa EIP, dolor pélvico crónico e infertilidad tubárica.',
      guidance: [
        pregnant
          ? 'En gestantes: Azitromicina 1 g VO dosis única (contraindicada doxiciclina y levofloxacino) y realizar prueba de curación (NAAT) 4 semanas después.'
          : 'Indicar Doxiciclina 100 mg VO c/12 h × 7 días (mayor eficacia que azitromicina especialmente en infección rectal); alternativa Azitromicina 1 g VO DU o Levofloxacino 500 mg/d × 7 d.',
      ],
      formulaUsed: 'CDC STI 2021: Doxiciclina 100 mg c/12 h × 7 d (Azitromicina 1 g DU en embarazo)',
      inputsSummary: `Entidad: Chlamydia · Embarazo: ${pregnant ? 'Sí' : 'No'}`,
    };
  },
};
