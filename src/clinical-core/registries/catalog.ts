import { abcd2Calculator } from '../calculators/abcd2.ts';
import { airScoreCalculator } from '../calculators/airScore.ts';
import { alvaradoCalculator } from '../calculators/alvarado.ts';
import { anionGapCalculator } from '../calculators/anionGap.ts';
import { apacheIiCalculator } from '../calculators/apacheIi.ts';
import { apgarCalculator } from '../calculators/apgar.ts';
import { asaStatusCalculator } from '../calculators/asaStatus.ts';
import { bisapCalculator } from '../calculators/bisap.ts';
import { bishopCalculator } from '../calculators/bishop.ts';
import { bsaMostellerCalculator } from '../calculators/bsaMosteller.ts';
import { calciumCorrectionCalculator } from '../calculators/calciumCorrection.ts';
import { capriniCalculator } from '../calculators/caprini.ts';
import { centorMcisaacCalculator } from '../calculators/centorMcisaac.ts';
import { cha2ds2VascCalculator } from '../calculators/cha2ds2Vasc.ts';
import { ckdEpi2021Calculator } from '../calculators/ckdEpi2021.ts';
import { cockcroftGaultCalculator } from '../calculators/cockcroftGault.ts';
import { curb65Calculator } from '../calculators/curb65.ts';
import { dengueOmsCalculator } from '../calculators/dengueOms.ts';
import { fenaFeureaCalculator } from '../calculators/fenaFeurea.ts';
import { fisherModificadaCalculator } from '../calculators/fisherModificada.ts';
import { fourScoreCalculator } from '../calculators/fourScore.ts';
import { framinghamCvdCalculator } from '../calculators/framinghamCvd.ts';
import { freeWaterDeficitCalculator } from '../calculators/freeWaterDeficit.ts';
import { gestationalAgeCalculator } from '../calculators/gestationalAge.ts';
import { glasgowCalculator } from '../calculators/glasgow.ts';
import { glasgowPediatricCalculator } from '../calculators/glasgowPediatric.ts';
import { graceScoreCalculator } from '../calculators/graceScore.ts';
import { hasBledCalculator } from '../calculators/hasBled.ts';
import { heartScoreCalculator } from '../calculators/heartScore.ts';
import { hollidaySegarCalculator } from '../calculators/hollidaySegar.ts';
import { homaIrBCalculator } from '../calculators/homaIrB.ts';
import { huntHessCalculator } from '../calculators/huntHess.ts';
import { ichScoreCalculator } from '../calculators/ichScore.ts';
import { imcCalculator } from '../calculators/imc.ts';
import { infusionCalculator } from '../calculators/infusionCalculator.ts';
import { insulinProtocolCalculator } from '../calculators/insulinProtocol.ts';
import { kdigoAkiCalculator } from '../calculators/kdigoAki.ts';
import { mapPamCalculator } from '../calculators/mapPam.ts';
import { news2Calculator } from '../calculators/news2.ts';
import { nihssCalculator } from '../calculators/nihss.ts';
import { nyhaCalculator } from '../calculators/nyha.ts';
import { obstetricMgso4Calculator } from '../calculators/obstetricMgso4.ts';
import { obstetricShockIndexCalculator } from '../calculators/obstetricShockIndex.ts';
import { pediatricDehydrationCalculator } from '../calculators/pediatricDehydration.ts';
import { pediatricDosingCalculator } from '../calculators/pediatricDosing.ts';
import { percRuleCalculator } from '../calculators/percRule.ts';
import { pewsBrightonCalculator } from '../calculators/pewsBrighton.ts';
import { plasmaOsmolarityCalculator } from '../calculators/plasmaOsmolarity.ts';
import { psiPortCalculator } from '../calculators/psiPort.ts';
import { psofaCalculator } from '../calculators/psofa.ts';
import { qsofaCalculator } from '../calculators/qsofa.ts';
import { qtcCalculator } from '../calculators/qtc.ts';
import { ransonCalculator } from '../calculators/ranson.ts';
import { ripasaCalculator } from '../calculators/ripasa.ts';
import { shockIndexCalculator } from '../calculators/shockIndex.ts';
import { silvermanAndersenCalculator } from '../calculators/silvermanAndersen.ts';
import { sodiumCorrectionCalculator } from '../calculators/sodiumCorrection.ts';
import { sofaCalculator } from '../calculators/sofa.ts';
import { timiRiskCalculator } from '../calculators/timiRisk.ts';
import { wellsTepCalculator } from '../calculators/wellsTep.ts';
import { wellsTvpCalculator } from '../calculators/wellsTvp.ts';
import type { CalculatorDefinition, SpecialtyId } from '../types/clinical.ts';
import { SPECIALTY_MAP } from './specialties.ts';

export const CALCULATOR_CATALOG: CalculatorDefinition[] = [
  imcCalculator,
  ckdEpi2021Calculator,
  cockcroftGaultCalculator,
  kdigoAkiCalculator,
  fenaFeureaCalculator,
  anionGapCalculator,
  sodiumCorrectionCalculator,
  freeWaterDeficitCalculator,
  plasmaOsmolarityCalculator,
  calciumCorrectionCalculator,
  homaIrBCalculator,
  insulinProtocolCalculator,
  curb65Calculator,
  wellsTvpCalculator,
  wellsTepCalculator,
  cha2ds2VascCalculator,
  hasBledCalculator,
  mapPamCalculator,
  shockIndexCalculator,
  qtcCalculator,
  nyhaCalculator,
  framinghamCvdCalculator,
  heartScoreCalculator,
  timiRiskCalculator,
  graceScoreCalculator,
  percRuleCalculator,
  qsofaCalculator,
  sofaCalculator,
  news2Calculator,
  apacheIiCalculator,
  centorMcisaacCalculator,
  psiPortCalculator,
  dengueOmsCalculator,
  infusionCalculator,
  glasgowCalculator,
  fourScoreCalculator,
  nihssCalculator,
  abcd2Calculator,
  huntHessCalculator,
  fisherModificadaCalculator,
  ichScoreCalculator,
  alvaradoCalculator,
  ripasaCalculator,
  airScoreCalculator,
  ransonCalculator,
  bisapCalculator,
  capriniCalculator,
  asaStatusCalculator,
  bsaMostellerCalculator,
  hollidaySegarCalculator,
  pediatricDehydrationCalculator,
  pediatricDosingCalculator,
  glasgowPediatricCalculator,
  pewsBrightonCalculator,
  psofaCalculator,
  gestationalAgeCalculator,
  bishopCalculator,
  apgarCalculator,
  silvermanAndersenCalculator,
  obstetricShockIndexCalculator,
  obstetricMgso4Calculator,
];

export const CALCULATOR_BY_ID: Record<string, CalculatorDefinition> = CALCULATOR_CATALOG.reduce(
  (acc, calc) => {
    acc[calc.id] = calc;
    return acc;
  },
  {} as Record<string, CalculatorDefinition>,
);

export function getCalculatorsBySpecialty(specialtyId: SpecialtyId): CalculatorDefinition[] {
  return CALCULATOR_CATALOG.filter(
    (calc) =>
      calc.primarySpecialty === specialtyId ||
      calc.secondarySpecialties.includes(specialtyId),
  );
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function searchCalculators(query: string): CalculatorDefinition[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return CALCULATOR_CATALOG;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return CALCULATOR_CATALOG.filter((calc) => {
    const specialtyNames = [
      SPECIALTY_MAP[calc.primarySpecialty].name,
      ...calc.secondarySpecialties.map((id) => SPECIALTY_MAP[id].name),
    ].join(' ');

    const haystack = normalizeSearchText(
      [
        calc.name,
        calc.shortName,
        calc.description,
        calc.clinicalIndication,
        calc.keywords.join(' '),
        specialtyNames,
      ].join(' '),
    );

    return terms.every((term) => haystack.includes(term));
  });
}
