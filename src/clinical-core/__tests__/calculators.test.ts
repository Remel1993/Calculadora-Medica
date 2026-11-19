import assert from 'node:assert/strict';
import test from 'node:test';

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
import {
  createInitialInputs,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import {
  CALCULATOR_CATALOG,
  getCalculatorsBySpecialty,
  searchCalculators,
} from '../registries/catalog.ts';
import { SPECIALTIES } from '../registries/specialties.ts';

test('precision: roundClinical handles classic half-up cases safely', () => {
  assert.equal(roundClinical(1.005, 2), 1.01);
  assert.equal(roundClinical(24.949, 1), 24.9);
  assert.equal(roundClinical(24.96, 1), 25.0);
});

test('IMC: calculates standard values, unit conversion kg/lb and cm/m, and WHO thresholds', () => {
  const normal = imcCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    height: { value: '175', unitId: 'cm' },
  });
  assert.equal(normal.primaryResult.value, 22.9);
  assert.equal(normal.severity, 'normal');

  const imperial = imcCalculator.calculate({
    weight: { value: '154.32358', unitId: 'lb' },
    height: { value: '1.75', unitId: 'm' },
  });
  assert.equal(imperial.primaryResult.value, 22.9);

  const overweight = imcCalculator.calculate({
    weight: { value: '72.25', unitId: 'kg' },
    height: { value: '170', unitId: 'cm' },
  });
  assert.equal(overweight.primaryResult.value, 25.0);
  assert.equal(overweight.severity, 'low');

  const underweight = imcCalculator.calculate({
    weight: { value: '50', unitId: 'kg' },
    height: { value: '175', unitId: 'cm' },
  });
  assert.equal(underweight.primaryResult.value, 16.3);
  assert.equal(underweight.severity, 'moderate');

  const errors = validateCalculatorInputs(imcCalculator, {
    weight: { value: '70', unitId: 'kg' },
    height: { value: '10', unitId: 'cm' },
  });
  assert.equal(errors.length, 1);
});

test('CKD-EPI 2021: matches published race-free equation and unit equivalence mg/dL <-> µmol/L', () => {
  const male50 = ckdEpi2021Calculator.calculate({
    creatinine: { value: '1.0', unitId: 'mg_dl' },
    age: { value: '50', unitId: 'years' },
    sex: 'male',
  });
  assert.equal(male50.primaryResult.value, 92);
  assert.equal(male50.severity, 'normal');

  const male50Umol = ckdEpi2021Calculator.calculate({
    creatinine: { value: '88.4', unitId: 'umol_l' },
    age: { value: '50', unitId: 'years' },
    sex: 'male',
  });
  assert.equal(male50Umol.primaryResult.value, male50.primaryResult.value);

  const female50 = ckdEpi2021Calculator.calculate({
    creatinine: { value: '0.8', unitId: 'mg_dl' },
    age: { value: '50', unitId: 'years' },
    sex: 'female',
  });
  assert.equal(female50.primaryResult.value, 90);

  const severe = ckdEpi2021Calculator.calculate({
    creatinine: { value: '2.2', unitId: 'mg_dl' },
    age: { value: '68', unitId: 'years' },
    sex: 'female',
  });
  assert.equal(severe.primaryResult.value, 24);
  assert.equal(severe.severity, 'high');

  const errors = validateCalculatorInputs(ckdEpi2021Calculator, {
    creatinine: { value: '0.8', unitId: 'mg_dl' },
    age: { value: '16', unitId: 'years' },
    sex: 'female',
  });
  assert.equal(errors.length, 1);
});

test('Cockcroft-Gault: actual, ideal, and adjusted body weight calculations', () => {
  // Male, age 60, 70 kg, Scr 1.0 mg/dL -> (80*70)/(72*1) = 77.78 -> 78 mL/min
  const male = cockcroftGaultCalculator.calculate({
    age: { value: '60', unitId: 'years' },
    sex: 'male',
    weight: { value: '70', unitId: 'kg' },
    height: { value: '', unitId: 'cm' },
    creatinine: { value: '1.0', unitId: 'mg_dl' },
  });
  assert.equal(male.primaryResult.value, 78);

  // Female factor 0.85: 77.777 * 0.85 = 66.1 -> 66
  const female = cockcroftGaultCalculator.calculate({
    age: { value: '60', unitId: 'years' },
    sex: 'female',
    weight: { value: '70', unitId: 'kg' },
    height: { value: '', unitId: 'cm' },
    creatinine: { value: '1.0', unitId: 'mg_dl' },
  });
  assert.equal(female.primaryResult.value, 66);

  // Obese male with height triggers adjusted body weight as primary
  const obese = cockcroftGaultCalculator.calculate({
    age: { value: '50', unitId: 'years' },
    sex: 'male',
    weight: { value: '120', unitId: 'kg' },
    height: { value: '170', unitId: 'cm' },
    creatinine: { value: '1.2', unitId: 'mg_dl' },
  });
  assert.ok(obese.primaryResult.label.includes('peso ajustado'));
});

test('KDIGO AKI: evaluates creatinine ratio, 48h rise, and urine output max stage', () => {
  // Stage 1 via >= 0.3 mg/dL in 48h (1.0 -> 1.35)
  const stage1 = kdigoAkiCalculator.calculate({
    baselineCr: { value: '1.0', unitId: 'mg_dl' },
    currentCr: { value: '1.35', unitId: 'mg_dl' },
    acute48hRise: true,
    urineOutput: 'none',
    rrt: false,
  });
  assert.equal(stage1.primaryResult.value, 1);

  // Urine output Stage 2 overrides normal Cr ratio
  const stage2Uo = kdigoAkiCalculator.calculate({
    baselineCr: { value: '1.0', unitId: 'mg_dl' },
    currentCr: { value: '1.1', unitId: 'mg_dl' },
    acute48hRise: false,
    urineOutput: 'stage2',
    rrt: false,
  });
  assert.equal(stage2Uo.primaryResult.value, 2);

  // RRT forces Stage 3
  const stage3Rrt = kdigoAkiCalculator.calculate({
    baselineCr: { value: '1.0', unitId: 'mg_dl' },
    currentCr: { value: '1.8', unitId: 'mg_dl' },
    acute48hRise: false,
    urineOutput: 'none',
    rrt: true,
  });
  assert.equal(stage3Rrt.primaryResult.value, 3);
});

test('FENa / FEUrea: skips hidden fields and computes accurately', () => {
  // FENa = (15 * 2.0) / (140 * 100) * 100 = 0.214 -> 0.21 % (prerrenal)
  const fena = fenaFeureaCalculator.calculate({
    mode: 'fena',
    serumCr: { value: '2.0', unitId: 'mg_dl' },
    urineCr: { value: '100', unitId: 'mg_dl' },
    serumNa: { value: '140', unitId: 'meq_l' },
    urineNa: { value: '15', unitId: 'meq_l' },
    serumUrea: { value: '', unitId: 'bun_mg_dl' },
    urineUrea: { value: '', unitId: 'bun_mg_dl' },
  });
  assert.equal(fena.primaryResult.value, 0.21);
  assert.equal(fena.severity, 'low');

  // FEUrea = (400 * 2.0) / (40 * 100) * 100 = 20.0 %
  const feurea = fenaFeureaCalculator.calculate({
    mode: 'feurea',
    serumCr: { value: '2.0', unitId: 'mg_dl' },
    urineCr: { value: '100', unitId: 'mg_dl' },
    serumNa: { value: '', unitId: 'meq_l' },
    urineNa: { value: '', unitId: 'meq_l' },
    serumUrea: { value: '40', unitId: 'bun_mg_dl' },
    urineUrea: { value: '400', unitId: 'bun_mg_dl' },
  });
  assert.equal(feurea.primaryResult.value, 20.0);
});

test('Anion Gap: standard calculation, Figge albumin correction, and Delta-Delta', () => {
  const normal = anionGapCalculator.calculate({
    sodium: { value: '140', unitId: 'meq_l' },
    chloride: { value: '104', unitId: 'meq_l' },
    bicarbonate: { value: '24', unitId: 'meq_l' },
    albumin: { value: '', unitId: 'g_dl' },
  });
  assert.equal(normal.primaryResult.value, 12.0);
  assert.equal(normal.severity, 'normal');

  const corrected = anionGapCalculator.calculate({
    sodium: { value: '140', unitId: 'meq_l' },
    chloride: { value: '108', unitId: 'meq_l' },
    bicarbonate: { value: '20', unitId: 'meq_l' },
    albumin: { value: '20', unitId: 'g_l' },
  });
  assert.equal(corrected.primaryResult.value, 17.0);
  assert.equal(corrected.severity, 'moderate');
  assert.ok(corrected.secondaryResults?.some((r) => r.label.includes('Delta-Delta')));
});

test('Sodium correction: Katz (1.6) <= 400 mg/dL and Hillier (2.4) > 400 mg/dL', () => {
  // Na 130, Glucose 300 -> Katz = 130 + 1.6 * 2 = 133.2
  const katzCase = sodiumCorrectionCalculator.calculate({
    sodium: { value: '130', unitId: 'meq_l' },
    glucose: { value: '300', unitId: 'mg_dl' },
  });
  assert.equal(katzCase.primaryResult.value, 133.2);

  // Na 126, Glucose 600 -> Hillier primary = 126 + 2.4 * 5 = 138.0
  const hillierCase = sodiumCorrectionCalculator.calculate({
    sodium: { value: '126', unitId: 'meq_l' },
    glucose: { value: '600', unitId: 'mg_dl' },
  });
  assert.equal(hillierCase.primaryResult.value, 138.0);
  assert.equal(hillierCase.severity, 'normal');
});

test('Free water deficit: calculates TBW deficit and 24h safe volume', () => {
  // Adult male 70 kg -> TBW 42 L; Na 160 -> Target 140 => 42 * (160/140 - 1) = 6.00 L
  const res = freeWaterDeficitCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    tbwProfile: 'adult_male',
    currentNa: { value: '160', unitId: 'meq_l' },
    targetNa: { value: '140', unitId: 'meq_l' },
  });
  assert.equal(res.primaryResult.value, 6.0);
  assert.equal(res.severity, 'critical');
});

test('Plasma osmolarity: calculates total, tonicity, and osmolar gap', () => {
  // Na 140, Glu 90, BUN 14 => Eff = 285.0, Calc = 290.0; Measured 315 => Gap +25.0
  const res = plasmaOsmolarityCalculator.calculate({
    sodium: { value: '140', unitId: 'meq_l' },
    glucose: { value: '90', unitId: 'mg_dl' },
    bun: { value: '14', unitId: 'bun_mg_dl' },
    measuredOsm: { value: '315', unitId: 'mosm_kg' },
    ethanol: { value: '', unitId: 'mg_dl' },
  });
  assert.equal(res.primaryResult.value, 290.0);
  assert.equal(res.severity, 'critical');
  assert.ok(res.secondaryResults?.some((r) => r.formattedValue === '+25.0'));
});

test('Calcium correction: Payne formula with g/dL and g/L albumin', () => {
  // Ca 7.6 mg/dL, Albumin 25 g/L (2.5 g/dL) => 7.6 + 0.8 * 1.5 = 8.80 mg/dL
  const res = calciumCorrectionCalculator.calculate({
    calcium: { value: '7.6', unitId: 'mg_dl' },
    albumin: { value: '25', unitId: 'g_l' },
  });
  assert.equal(res.primaryResult.value, 8.8);
  assert.equal(res.severity, 'normal');
});

test('HOMA-IR / HOMA-B: Matthews equation and low-glucose denominator guard', () => {
  // Glu 100 mg/dL (5.55 mmol/L), Insulin 15 uIU/mL -> HOMA-IR = (5.54994 * 15)/22.5 = 3.70
  const res = homaIrBCalculator.calculate({
    fastingGlucose: { value: '100', unitId: 'mg_dl' },
    fastingInsulin: { value: '15', unitId: 'uiu_ml' },
  });
  assert.equal(res.primaryResult.value, 3.7);
  assert.equal(res.severity, 'moderate');

  // Low fasting glucose guards HOMA-B safely
  const lowGlu = homaIrBCalculator.calculate({
    fastingGlucose: { value: '55', unitId: 'mg_dl' },
    fastingInsulin: { value: '5', unitId: 'uiu_ml' },
  });
  assert.ok(lowGlu.secondaryResults?.some((r) => r.formattedValue === 'No calculable'));
});

test('Insulin protocol: calculates correction + meal bolus and blocks hypoglycemia < 70 mg/dL', () => {
  // Glucose 240, target 120, FSI 40 => 3 U corr; Carbs 60, IC 15 => 4 U meal; total 7.0 U
  const bolus = insulinProtocolCalculator.calculate({
    protocolMode: 'direct_fsi',
    currentGlucose: { value: '240', unitId: 'mg_dl' },
    targetGlucose: { value: '120', unitId: 'mg_dl' },
    directFsi: { value: '40', unitId: 'mg_dl_u' },
    directIcRatio: { value: '15', unitId: 'g_u' },
    tdd: { value: '', unitId: 'u_day' },
    insulinType: 'rapid',
    carbs: { value: '60', unitId: 'g' },
  });
  assert.equal(bolus.primaryResult.value, 7.0);

  // Hypoglycemia safety lock
  const hypo = insulinProtocolCalculator.calculate({
    protocolMode: 'direct_fsi',
    currentGlucose: { value: '62', unitId: 'mg_dl' },
    targetGlucose: { value: '120', unitId: 'mg_dl' },
    directFsi: { value: '40', unitId: 'mg_dl_u' },
    directIcRatio: { value: '15', unitId: 'g_u' },
    tdd: { value: '', unitId: 'u_day' },
    insulinType: 'rapid',
    carbs: { value: '30', unitId: 'g' },
  });
  assert.equal(hypo.primaryResult.value, 0);
  assert.equal(hypo.severity, 'critical');
});

test('CURB-65: scores 0 through 5 accurately with correct risk strata', () => {
  const score0 = curb65Calculator.calculate({
    confusion: false,
    urea: false,
    respRate: false,
    bloodPressure: false,
    age65: false,
  });
  assert.equal(score0.primaryResult.value, 0);
  assert.equal(score0.severity, 'low');

  const score2 = curb65Calculator.calculate({
    confusion: false,
    urea: true,
    respRate: false,
    bloodPressure: false,
    age65: true,
  });
  assert.equal(score2.primaryResult.value, 2);
  assert.equal(score2.severity, 'moderate');

  const score5 = curb65Calculator.calculate({
    confusion: true,
    urea: true,
    respRate: true,
    bloodPressure: true,
    age65: true,
  });
  assert.equal(score5.primaryResult.value, 5);
  assert.equal(score5.severity, 'critical');
});

test('Wells TVP and Wells TEP: scoring and 2-tier thresholds', () => {
  const tvpNegativeAlt = wellsTvpCalculator.calculate({
    activeCancer: true,
    paralysis: false,
    bedriddenSurgery: false,
    tenderness: false,
    entireLegSwollen: false,
    calfSwelling: false,
    pittingEdema: false,
    collateralVeins: false,
    previousDvt: false,
    alternativeDiagnosis: true,
  });
  assert.equal(tvpNegativeAlt.primaryResult.value, -1);
  assert.equal(tvpNegativeAlt.severity, 'low');

  const tepProbable = wellsTepCalculator.calculate({
    dvtSigns: true,
    peMostLikely: false,
    tachycardia: true,
    immobSurgery: false,
    prevDvtPe: false,
    hemoptysis: false,
    malignancy: false,
  });
  assert.equal(tepProbable.primaryResult.value, 4.5);
  assert.equal(tepProbable.severity, 'high');
});

test('CHA2DS2-VASc/VA and HAS-BLED: dual scoring and thresholds', () => {
  // Female, age 65-74 (+1), HTN (+1) -> CHA2DS2-VA = 2, CHA2DS2-VASc = 3
  const afib = cha2ds2VascCalculator.calculate({
    ageGroup: '65_74',
    sex: 'female',
    chf: false,
    htn: true,
    diabetes: false,
    stroke: false,
    vascular: false,
  });
  assert.equal(afib.primaryResult.value, 2);
  assert.equal(afib.secondaryResults?.[0].formattedValue, '3');
  assert.equal(afib.severity, 'high');

  const hasBledHigh = hasBledCalculator.calculate({
    hypertension: true,
    renal: false,
    liver: false,
    stroke: true,
    bleeding: false,
    labileInr: false,
    elderly: true,
    drugs: false,
    alcohol: false,
  });
  assert.equal(hasBledHigh.primaryResult.value, 3);
  assert.equal(hasBledHigh.severity, 'high');
});

test('PAM: computes mean arterial pressure, pulse pressure, and rejects PAS <= PAD', () => {
  // PAS 120, PAD 80 -> PAM = 93.3, PP = 40
  const norm = mapPamCalculator.calculate({
    sbp: { value: '120', unitId: 'mmhg' },
    dbp: { value: '80', unitId: 'mmhg' },
  });
  assert.equal(norm.primaryResult.value, 93.3);
  assert.equal(norm.severity, 'normal');

  // Hypoperfusion: PAS 80, PAD 50 -> PAM = 60.0 -> critical
  const low = mapPamCalculator.calculate({
    sbp: { value: '80', unitId: 'mmhg' },
    dbp: { value: '50', unitId: 'mmhg' },
  });
  assert.equal(low.primaryResult.value, 60.0);
  assert.equal(low.severity, 'critical');

  assert.throws(() =>
    mapPamCalculator.calculate({
      sbp: { value: '80', unitId: 'mmhg' },
      dbp: { value: '90', unitId: 'mmhg' },
    }),
  );
});

test('Shock Index: computes SI and Modified Shock Index when PAD is provided', () => {
  // HR 110, SBP 100 -> SI = 1.10 (high); DBP 70 -> PAM = 80 -> MSI = 110/80 = 1.38
  const res = shockIndexCalculator.calculate({
    hr: { value: '110', unitId: 'bpm' },
    sbp: { value: '100', unitId: 'mmhg' },
    dbp: { value: '70', unitId: 'mmhg' },
  });
  assert.equal(res.primaryResult.value, 1.1);
  assert.equal(res.severity, 'high');
  assert.equal(res.secondaryResults?.[0].formattedValue, '1.38');
});

test('QTc: calculates Bazett, Fridericia, Framingham, Hodges and warns outside 60-100 bpm', () => {
  // QT 400 ms, HR 60 bpm (RR = 1.0 s) -> all 4 formulas equal 400 ms
  const at60 = qtcCalculator.calculate({
    qt: { value: '400', unitId: 'ms' },
    hr: { value: '60', unitId: 'bpm' },
    sex: 'male',
    primaryFormula: 'fridericia',
  });
  assert.equal(at60.primaryResult.value, 400);
  assert.equal(at60.severity, 'normal');
  assert.equal(at60.guidance, undefined);

  // Tachycardia HR 120 (RR = 0.5 s), QT 400 -> Fridericia 504 (critical), Bazett 566
  const tachy = qtcCalculator.calculate({
    qt: { value: '400', unitId: 'ms' },
    hr: { value: '120', unitId: 'bpm' },
    sex: 'female',
    primaryFormula: 'fridericia',
  });
  assert.equal(tachy.primaryResult.value, 504);
  assert.equal(tachy.severity, 'critical');
  assert.ok(tachy.secondaryResults?.some((r) => r.label.includes('Bazett') && r.formattedValue === '566'));
  assert.ok(tachy.guidance && tachy.guidance.length > 0);
});

test('NYHA: maps classes I through IV accurately', () => {
  const cls3 = nyhaCalculator.calculate({ nyhaClass: 'III' });
  assert.equal(cls3.primaryResult.value, 3);
  assert.equal(cls3.primaryResult.formattedValue, 'Clase III');
  assert.equal(cls3.severity, 'high');
});

test('Framingham CVD 2008: matches published D Agostino 10-year risk and mmol/L conversion', () => {
  // D Agostino 2008 paper male profile: age 55, TC 210, HDL 45, SBP 130 untreated, non-smoker, no DM
  const male = framinghamCvdCalculator.calculate({
    age: { value: '55', unitId: 'years' },
    sex: 'male',
    totalChol: { value: '210', unitId: 'mg_dl' },
    hdlChol: { value: '45', unitId: 'mg_dl' },
    sbp: { value: '130', unitId: 'mmhg' },
    treatedBp: false,
    smoker: false,
    diabetes: false,
  });
  assert.ok(male.primaryResult.value >= 11 && male.primaryResult.value <= 13);
  assert.equal(male.severity, 'moderate');

  // Unit conversion equivalence mmol/L -> mg/dL (factor 38.67)
  const maleMmol = framinghamCvdCalculator.calculate({
    age: { value: '55', unitId: 'years' },
    sex: 'male',
    totalChol: { value: String(210 / 38.67), unitId: 'mmol_l' },
    hdlChol: { value: String(45 / 38.67), unitId: 'mmol_l' },
    sbp: { value: '130', unitId: 'mmhg' },
    treatedBp: false,
    smoker: false,
    diabetes: false,
  });
  assert.equal(maleMmol.primaryResult.value, male.primaryResult.value);

  // High risk female smoker + DM + treated HTN
  const femaleHigh = framinghamCvdCalculator.calculate({
    age: { value: '68', unitId: 'years' },
    sex: 'female',
    totalChol: { value: '260', unitId: 'mg_dl' },
    hdlChol: { value: '35', unitId: 'mg_dl' },
    sbp: { value: '160', unitId: 'mmhg' },
    treatedBp: true,
    smoker: true,
    diabetes: true,
  });
  assert.ok(femaleHigh.primaryResult.value >= 20);
  assert.equal(femaleHigh.severity, 'high');
});

test('HEART Score: scores 0-10 across low, moderate, and high risk strata', () => {
  const low = heartScoreCalculator.calculate({
    history: '1',
    ecg: '0',
    age: '1',
    riskFactors: '1',
    troponin: '0',
  });
  assert.equal(low.primaryResult.value, 3);
  assert.equal(low.severity, 'low');

  const high = heartScoreCalculator.calculate({
    history: '2',
    ecg: '2',
    age: '2',
    riskFactors: '1',
    troponin: '2',
  });
  assert.equal(high.primaryResult.value, 9);
  assert.equal(high.severity, 'critical');
});

test('TIMI Risk Score: handles both SCASEST (0-7) and IAMCEST (0-14) modes', () => {
  const nstemi = timiRiskCalculator.calculate({
    syndrome: 'nstemi',
    n_age65: true,
    n_riskFactors: true,
    n_knownCad: false,
    n_asaUse: true,
    n_severeAngina: true,
    n_stDeviation: false,
    n_markers: true,
    s_age: '0',
    s_dmHtnAngina: false,
    s_sbp100: false,
    s_hr100: false,
    s_killip: false,
    s_weight67: false,
    s_antSte: false,
    s_time4h: false,
  });
  assert.equal(nstemi.primaryResult.value, 5);
  assert.equal(nstemi.severity, 'critical');

  const stemi = timiRiskCalculator.calculate({
    syndrome: 'stemi',
    n_age65: false,
    n_riskFactors: false,
    n_knownCad: false,
    n_asaUse: false,
    n_severeAngina: false,
    n_stDeviation: false,
    n_markers: false,
    s_age: '3',
    s_dmHtnAngina: true,
    s_sbp100: true,
    s_hr100: false,
    s_killip: false,
    s_weight67: false,
    s_antSte: true,
    s_time4h: false,
  });
  assert.equal(stemi.primaryResult.value, 8);
  assert.equal(stemi.severity, 'critical');
});

test('GRACE Score: matches Granger 2003 in-hospital nomogram strata', () => {
  // Age 65 (58) + HR 95 (15) + SBP 115 (43) + Cr 1.1 (7) + Killip II (20) + ST (28) + Markers (14) = 185
  const high = graceScoreCalculator.calculate({
    age: { value: '65', unitId: 'years' },
    hr: { value: '95', unitId: 'bpm' },
    sbp: { value: '115', unitId: 'mmhg' },
    creatinine: { value: '1.1', unitId: 'mg_dl' },
    killip: '2',
    cardiacArrest: false,
    stDeviation: true,
    elevatedMarkers: true,
  });
  assert.equal(high.primaryResult.value, 185);
  assert.equal(high.severity, 'critical');

  // Low risk: Age 35 (8) + HR 65 (3) + SBP 145 (24) + Cr 0.7 (4) + Killip I (0) = 39
  const low = graceScoreCalculator.calculate({
    age: { value: '35', unitId: 'years' },
    hr: { value: '65', unitId: 'bpm' },
    sbp: { value: '145', unitId: 'mmhg' },
    creatinine: { value: '0.7', unitId: 'mg_dl' },
    killip: '1',
    cardiacArrest: false,
    stDeviation: false,
    elevatedMarkers: false,
  });
  assert.equal(low.primaryResult.value, 39);
  assert.equal(low.severity, 'low');
});

test('PERC Rule: excludes PE only when 0/8 criteria are present', () => {
  const negative = percRuleCalculator.calculate({
    age50: false,
    hr100: false,
    spo2: false,
    legSwelling: false,
    hemoptysis: false,
    surgeryTrauma: false,
    priorVte: false,
    estrogen: false,
  });
  assert.equal(negative.primaryResult.value, 0);
  assert.equal(negative.severity, 'normal');

  const positive = percRuleCalculator.calculate({
    age50: true,
    hr100: false,
    spo2: false,
    legSwelling: false,
    hemoptysis: false,
    surgeryTrauma: false,
    priorVte: false,
    estrogen: false,
  });
  assert.equal(positive.primaryResult.value, 1);
  assert.equal(positive.severity, 'moderate');
});

test('qSOFA and SOFA: sepsis screening caveat and multi-organ dysfunction sum', () => {
  const qsofaPos = qsofaCalculator.calculate({
    rr22: true,
    alteredMental: false,
    sbp100: true,
  });
  assert.equal(qsofaPos.primaryResult.value, 2);
  assert.equal(qsofaPos.severity, 'critical');

  const sofaMod = sofaCalculator.calculate({
    respiration: '2',
    coagulation: '1',
    liver: '1',
    cardiovascular: '3',
    cns: '1',
    renal: '2',
  });
  assert.equal(sofaMod.primaryResult.value, 10);
  assert.equal(sofaMod.severity, 'high');
});

test('NEWS2: handles Scale 1 vs Scale 2 hypercapnia and single-parameter red trigger', () => {
  // Single red parameter (+3 from RR 26) -> total 3, moderate red trigger
  const redSingle = news2Calculator.calculate({
    rr: { value: '26', unitId: 'rpm' },
    spo2Scale: 'scale1',
    spo2: { value: '97', unitId: 'pct' },
    onOxygen: false,
    sbp: { value: '120', unitId: 'mmhg' },
    hr: { value: '75', unitId: 'bpm' },
    consciousness: 'A',
    temp: { value: '36.8', unitId: 'c' },
  });
  assert.equal(redSingle.primaryResult.value, 3);
  assert.equal(redSingle.severity, 'moderate');

  // Scale 2 COPD on room air with SpO2 95 -> 0 pts (no O2 penalty), whereas on O2 -> +2 (O2) + 2 (SpO2 95) = 4
  const copdO2 = news2Calculator.calculate({
    rr: { value: '18', unitId: 'rpm' },
    spo2Scale: 'scale2',
    spo2: { value: '95', unitId: 'pct' },
    onOxygen: true,
    sbp: { value: '120', unitId: 'mmhg' },
    hr: { value: '75', unitId: 'bpm' },
    consciousness: 'A',
    temp: { value: '36.8', unitId: 'c' },
  });
  assert.equal(copdO2.primaryResult.value, 4);
});

test('APACHE II: skips hidden HCO3 field when pH is selected and doubles Cr in ARF', () => {
  const inputsNormal = {
    temp: { value: '37.0', unitId: 'c' },
    map: { value: '85', unitId: 'mmhg' },
    hr: { value: '80', unitId: 'bpm' },
    rr: { value: '18', unitId: 'rpm' },
    oxygenation: '0',
    acidBaseSource: 'ph',
    ph: { value: '7.40', unitId: 'ph' },
    hco3: { value: '', unitId: 'meq_l' },
    sodium: { value: '140', unitId: 'meq_l' },
    potassium: { value: '4.0', unitId: 'meq_l' },
    creatinine: { value: '2.5', unitId: 'mg_dl' }, // 3 pts normal, 6 pts if ARF
    acuteRenalFailure: true,
    hematocrit: { value: '40', unitId: 'pct' },
    wbc: { value: '8.0', unitId: 'k_ul' },
    gcs: { value: '15', unitId: 'pts' },
    age: { value: '66', unitId: 'years' }, // 5 pts
    chronicHealth: '5', // 5 pts
  };
  assert.equal(validateCalculatorInputs(apacheIiCalculator, inputsNormal).length, 0);
  const res = apacheIiCalculator.calculate(inputsNormal);
  // APS = 6 (Cr*2), Age = 5, Chronic = 5 => Total = 16
  assert.equal(res.primaryResult.value, 16);
  assert.equal(res.severity, 'moderate');
});

test('Centor/McIsaac: handles -1 to 5 score range properly', () => {
  const low45 = centorMcisaacCalculator.calculate({
    ageGroup: '45plus',
    exudate: false,
    nodes: false,
    fever: false,
    noCough: false,
  });
  assert.equal(low45.primaryResult.value, -1);
  assert.equal(low45.severity, 'normal');

  const highChild = centorMcisaacCalculator.calculate({
    ageGroup: '3_14',
    exudate: true,
    nodes: true,
    fever: true,
    noCough: true,
  });
  assert.equal(highChild.primaryResult.value, 5);
  assert.equal(highChild.severity, 'high');
});

test('PSI / PORT: identifies Step 1 Class I and computes Class II-V points with female -10 offset', () => {
  const classI = psiPortCalculator.calculate({
    age: { value: '40', unitId: 'years' },
    sex: 'male',
    nursingHome: false,
    neoplastic: false,
    liver: false,
    chf: false,
    cerebrovascular: false,
    renal: false,
    alteredMental: false,
    rr30: false,
    sbp90: false,
    tempExtreme: false,
    hr125: false,
    ph735: false,
    bun30: false,
    na130: false,
    glu250: false,
    hct30: false,
    pao2_60: false,
    effusion: false,
  });
  assert.equal(classI.primaryResult.formattedValue, 'Clase I');
  assert.equal(classI.severity, 'normal');

  // Female age 75 (-10 = 65) + neoplastic (+30) + effusion (+10) = 105 -> Class IV (91-130)
  const classIV = psiPortCalculator.calculate({
    age: { value: '75', unitId: 'years' },
    sex: 'female',
    nursingHome: false,
    neoplastic: true,
    liver: false,
    chf: false,
    cerebrovascular: false,
    renal: false,
    alteredMental: false,
    rr30: false,
    sbp90: false,
    tempExtreme: false,
    hr125: false,
    ph735: false,
    bun30: false,
    na130: false,
    glu250: false,
    hct30: false,
    pao2_60: false,
    effusion: true,
  });
  assert.equal(classIV.primaryResult.value, 105);
  assert.equal(classIV.severity, 'high');
});

test('Dengue OMS/OPS: prioritizes Grupo C (Grave) > Grupo B2 (Alarma) > B1 > A', () => {
  const base = {
    sev_plasma: false,
    sev_bleed: false,
    sev_organ: false,
    ws_pain: false,
    ws_vomiting: false,
    ws_fluid: false,
    ws_bleed: false,
    ws_lethargy: false,
    ws_liver: false,
    ws_labs: false,
    comorbidityOrSocial: false,
  };
  assert.equal(dengueOmsCalculator.calculate(base).primaryResult.value, 0);
  assert.equal(dengueOmsCalculator.calculate({ ...base, comorbidityOrSocial: true }).primaryResult.value, 1);
  assert.equal(dengueOmsCalculator.calculate({ ...base, ws_pain: true, comorbidityOrSocial: true }).primaryResult.value, 2);
  assert.equal(dengueOmsCalculator.calculate({ ...base, sev_plasma: true, ws_pain: true }).primaryResult.value, 3);
});

test('Infusion Calculator: bidirectional conversion mcg/kg/min <-> mL/h and non-weight modes', () => {
  // Norepinephrine: 8 mg in 250 mL (32 mcg/mL), 70 kg, 0.1 mcg/kg/min => (0.1*70*60)/32 = 13.125 -> 13.13 mL/h
  const toRate = infusionCalculator.calculate({
    direction: 'dose_to_rate',
    doseUnit: 'mcg_kg_min',
    drugAmountMg: { value: '8', unitId: 'mg' },
    volumeMl: { value: '250', unitId: 'ml' },
    weight: { value: '70', unitId: 'kg' },
    desiredDose: { value: '0.1', unitId: 'dose' },
    pumpRate: { value: '', unitId: 'ml_h' },
  });
  assert.equal(toRate.primaryResult.value, 13.13);

  // Reverse: 13.125 mL/h -> 0.100 mcg/kg/min
  const toDose = infusionCalculator.calculate({
    direction: 'rate_to_dose',
    doseUnit: 'mcg_kg_min',
    drugAmountMg: { value: '8', unitId: 'mg' },
    volumeMl: { value: '250', unitId: 'ml' },
    weight: { value: '70', unitId: 'kg' },
    desiredDose: { value: '', unitId: 'dose' },
    pumpRate: { value: '13.125', unitId: 'ml_h' },
  });
  assert.equal(toDose.primaryResult.value, 0.1);
});

test('Glasgow (GCS & GCS-P) and FOUR Score: coma grading and pupil subtraction', () => {
  const gcsComa = glasgowCalculator.calculate({
    eye: '1',
    verbal: '1',
    motor: '3',
    pupilNonReactive: '2',
  });
  assert.equal(gcsComa.primaryResult.value, 5);
  assert.equal(gcsComa.secondaryResults?.[0].formattedValue, '3'); // GCS-P = 5 - 2
  assert.equal(gcsComa.severity, 'critical');

  const fourIntubated = fourScoreCalculator.calculate({
    eye: '2',
    motor: '3',
    brainstem: '4',
    respiration: '1',
  });
  assert.equal(fourIntubated.primaryResult.value, 10);
  assert.equal(fourIntubated.severity, 'high');
});

test('NIHSS: sums all 15 official sub-items across stroke severity tiers', () => {
  const base = {
    i1a: '0', i1b: '0', i1c: '0', i2: '0', i3: '0', i4: '0',
    i5a: '0', i5b: '0', i6a: '0', i6b: '0', i7: '0', i8: '0',
    i9: '0', i10: '0', i11: '0',
  };
  assert.equal(nihssCalculator.calculate(base).primaryResult.value, 0);

  const severe = nihssCalculator.calculate({
    ...base,
    i1a: '2', i1b: '2', i1c: '2', i2: '2', i3: '2', i4: '2',
    i5b: '4', i6b: '4', i9: '3', i10: '1', i11: '2',
  });
  assert.equal(severe.primaryResult.value, 26);
  assert.equal(severe.severity, 'critical');
});

test('ABCD2, Hunt-Hess, and Modified Fisher: neurovascular risk stratification', () => {
  const tiaHigh = abcd2Calculator.calculate({
    age60: true,
    bpHigh: true,
    clinicalFeatures: '2',
    duration: '2',
    diabetes: false,
  });
  assert.equal(tiaHigh.primaryResult.value, 6);
  assert.equal(tiaHigh.severity, 'critical');

  const hh4 = huntHessCalculator.calculate({ grade: '4' });
  assert.equal(hh4.primaryResult.value, 4);
  assert.equal(hh4.severity, 'high');

  const mf4 = fisherModificadaCalculator.calculate({ grade: '4' });
  assert.equal(mf4.primaryResult.value, 4);
  assert.equal(mf4.severity, 'critical');
});

test('ICH Score: direct volume mode and ABC/2 volume calculation', () => {
  // ABC/2 = (5 * 4 * 4) / 2 = 40.0 mL (>= 30 => +1) + GCS 5-12 (+1) + IVH (+1) + age80 (+1) = 4
  const abcRes = ichScoreCalculator.calculate({
    gcsGroup: '1',
    volumeMode: 'abc2',
    vol30: '0',
    dimA: { value: '5', unitId: 'cm' },
    dimB: { value: '4', unitId: 'cm' },
    dimC: { value: '4', unitId: 'cm' },
    ivh: true,
    infratentorial: false,
    age80: true,
  });
  assert.equal(abcRes.primaryResult.value, 4);
  assert.equal(abcRes.severity, 'critical');
  assert.ok(abcRes.secondaryResults?.some((r) => r.formattedValue === '40.0'));
});

test('Alvarado, RIPASA, and AIR Score: appendicitis probability thresholds', () => {
  const alvHigh = alvaradoCalculator.calculate({
    migration: true,
    anorexia: true,
    nausea: false,
    tenderness: true,
    rebound: true,
    fever: false,
    leukocytosis: true,
    leftShift: true,
  });
  assert.equal(alvHigh.primaryResult.value, 8);
  assert.equal(alvHigh.severity, 'high');

  // RIPASA: Male (1) + <40 (1) + <48h (1) + RIF pain (0.5) + tenderness (1) + guarding (2) + Rovsing (2) + negUA (1) = 9.5
  const ripasaHigh = ripasaCalculator.calculate({
    sex: '1',
    ageGroup: '1',
    duration: '1',
    rifPain: true,
    migration: false,
    anorexia: false,
    nausea: false,
    tenderness: true,
    guarding: true,
    rebound: false,
    rovsing: true,
    fever: false,
    wbc: false,
    negUa: true,
    foreignNric: false,
  });
  assert.equal(ripasaHigh.primaryResult.value, 9.5);
  assert.equal(ripasaHigh.severity, 'high');

  // AIR: vomiting(1) + rifPain(1) + rebound mod(2) + PMN 85%(2) + WBC 15(2) + CRP >=50(2) = 10
  const airHigh = airScoreCalculator.calculate({
    vomiting: true,
    rifPain: true,
    rebound: '2',
    temp385: false,
    pmn: '2',
    wbc: '2',
    crp: '2',
  });
  assert.equal(airHigh.primaryResult.value, 10);
  assert.equal(airHigh.severity, 'high');
});

test('Ranson and BISAP: non-biliary vs biliary criteria and early pancreatitis scoring', () => {
  const ransonBiliary = ransonCalculator.calculate({
    etiology: 'biliary',
    timing: 'full48h',
    b_age70: true,
    b_wbc18: true,
    b_glu220: false,
    b_ldh400: false,
    b_ast250: true,
    b_hctDrop10: false,
    b_bunRise2: true,
    b_ca8: false,
    b_baseDef5: false,
    b_fluid4: false,
  });
  assert.equal(ransonBiliary.primaryResult.value, 4);
  assert.equal(ransonBiliary.severity, 'high');

  const bisapHigh = bisapCalculator.calculate({
    bun25: true,
    mental: false,
    sirs: true,
    age60: true,
    effusion: false,
  });
  assert.equal(bisapHigh.primaryResult.value, 3);
  assert.equal(bisapHigh.severity, 'high');
});

test('Caprini VTE and ASA Physical Status: surgical risk and emergency modifier', () => {
  // Age 61-74 (+2) + Major surgery (+2) + Malignancy (+2) + BMI>25 (+1) = 7 (high)
  const capHigh = capriniCalculator.calculate({
    ageGroup: '2',
    surgeryType: '2',
    p1_bmi25: true,
    p1_varicose: false,
    p1_priorMajorSurg: false,
    p1_acuteMedical: false,
    p1_bedRestMed: false,
    p1_ibd: false,
    p1_estrogen: false,
    p2_malignancy: true,
    p2_bed72h: false,
    p2_cvc: false,
    p3_priorVte: false,
    p3_familyVte: false,
    p3_thrombophilia: false,
    p5_stroke: false,
    p5_fractureTrauma: false,
    p5_spinalCord: false,
  });
  assert.equal(capHigh.primaryResult.value, 7);
  assert.equal(capHigh.severity, 'high');

  const asa3E = asaStatusCalculator.calculate({
    asaClass: '3',
    isEmergency: true,
  });
  assert.equal(asa3E.primaryResult.formattedValue, 'ASA IIIE');
  assert.equal(asa3E.severity, 'critical');
});

test('BSA Mosteller and Holliday-Segar: pediatric body surface area and 4-2-1 maintenance fluids', () => {
  // 18 kg, 110 cm => sqrt(18*110/3600) = sqrt(0.55) = 0.74 m2
  const bsa = bsaMostellerCalculator.calculate({
    weight: { value: '18', unitId: 'kg' },
    height: { value: '110', unitId: 'cm' },
  });
  assert.equal(bsa.primaryResult.value, 0.74);

  // 25 kg => 65 mL/h and 1600 mL/day
  const hs = hollidaySegarCalculator.calculate({
    weight: { value: '25', unitId: 'kg' },
    factor: '1',
  });
  assert.equal(hs.primaryResult.value, 65.0);
  assert.equal(hs.secondaryResults?.[0].formattedValue, '1600');
});

test('Pediatric Dehydration & Pediatric Dosing: weight-loss deficit, liquid mL, and daily cap', () => {
  // Prev 10 kg, Curr 9 kg => 10% dehydration -> 10 * 10 * 10 = 1000 mL deficit
  const deh = pediatricDehydrationCalculator.calculate({
    mode: 'weight_loss',
    ageGroup: 'infant',
    clinicalGrade: 'moderate',
    currentWeight: { value: '9', unitId: 'kg' },
    previousWeight: { value: '10', unitId: 'kg' },
    bolusGiven: { value: '0', unitId: 'ml' },
  });
  assert.equal(deh.primaryResult.value, 1000);
  assert.equal(deh.severity, 'critical');

  // Amoxicillin 90 mg/kg/day in 2 doses for 15 kg = 1350 mg/day -> 675 mg/dose; 250mg/5mL -> 13.50 mL/dose
  const dose = pediatricDosingCalculator.calculate({
    weight: { value: '15', unitId: 'kg' },
    doseBasis: 'per_day',
    doseMgKg: { value: '90', unitId: 'mg_kg' },
    dosesPerDay: '2',
    concMg: { value: '250', unitId: 'mg' },
    concMl: { value: '5', unitId: 'ml' },
    maxDailyMg: { value: '3000', unitId: 'mg' },
  });
  assert.equal(dose.primaryResult.value, 675.0);
  assert.equal(dose.secondaryResults?.[0].formattedValue, '13.50');

  // Cap enforced at 3000 mg/day for 45 kg patient prescribed 90 mg/kg/day
  const capped = pediatricDosingCalculator.calculate({
    weight: { value: '45', unitId: 'kg' },
    doseBasis: 'per_day',
    doseMgKg: { value: '90', unitId: 'mg_kg' },
    dosesPerDay: '2',
    concMg: { value: '', unitId: 'mg' },
    concMl: { value: '5', unitId: 'ml' },
    maxDailyMg: { value: '3000', unitId: 'mg' },
  });
  assert.equal(capped.primaryResult.value, 1500.0);
  assert.equal(capped.severity, 'moderate');
});

test('Pediatric Glasgow, Brighton PEWS, and pSOFA: age-adjusted pediatric acuity', () => {
  const gcsPed = glasgowPediatricCalculator.calculate({ eye: '3', verbal: '3', motor: '4' });
  assert.equal(gcsPed.primaryResult.value, 10);
  assert.equal(gcsPed.severity, 'moderate');

  const pewsHigh = pewsBrightonCalculator.calculate({
    behavior: '2',
    cardiovascular: '2',
    respiratory: '1',
    nebulizers: true,
    postopVomiting: false,
  });
  assert.equal(pewsHigh.primaryResult.value, 7);
  assert.equal(pewsHigh.severity, 'critical');

  // Neonate (<1m) with MAP 42 (<46 => CV +1) and Cr 1.2 (=> Renal +3) + Resp 2 = 6
  const psofaNeonat = psofaCalculator.calculate({
    ageGroup: 'lt1m',
    respiration: '2',
    coagulation: '0',
    liver: '0',
    vasoactive: 'none',
    map: { value: '42', unitId: 'mmhg' },
    cns: '0',
    creatinine: { value: '1.2', unitId: 'mg_dl' },
  });
  assert.equal(psofaNeonat.primaryResult.value, 6);
  assert.equal(psofaNeonat.severity, 'high');
});

test('Gestational Age / FPP: Naegele LMP calculation and ultrasound re-dating', () => {
  // LMP 2026-01-01, Eval 2026-03-12 => 70 days = 10+0 weeks; FPP = +280 days = 2026-10-08 -> 08/10/2026
  const lmpRes = gestationalAgeCalculator.calculate({
    method: 'lmp',
    lmpDate: '2026-01-01',
    cycleDays: { value: '28', unitId: 'days' },
    usgDate: '',
    usgWeeks: { value: '', unitId: 'wk' },
    usgDays: { value: '0', unitId: 'd' },
    evalDate: '2026-03-12',
  });
  assert.equal(lmpRes.primaryResult.formattedValue, '10+0');
  assert.equal(lmpRes.secondaryResults?.[0].formattedValue, '08/10/2026');

  // USG 2026-03-01 at 12+2 weeks; Eval 2026-03-15 (+14 days) => 14+2 weeks
  const usgRes = gestationalAgeCalculator.calculate({
    method: 'usg',
    lmpDate: '',
    cycleDays: { value: '28', unitId: 'days' },
    usgDate: '2026-03-01',
    usgWeeks: { value: '12', unitId: 'wk' },
    usgDays: { value: '2', unitId: 'd' },
    evalDate: '2026-03-15',
  });
  assert.equal(usgRes.primaryResult.formattedValue, '14+2');
});

test('Bishop, Apgar, Silverman-Andersen, Obstetric Shock Index, and MgSO4 Zuspan', () => {
  const bishopFav = bishopCalculator.calculate({
    dilation: '2',
    effacement: '2',
    station: '2',
    consistency: '2',
    position: '1',
  });
  assert.equal(bishopFav.primaryResult.value, 9);
  assert.equal(bishopFav.severity, 'normal');

  const apgarMod = apgarCalculator.calculate({
    appearance: '1',
    pulse: '2',
    grimace: '1',
    activity: '1',
    respiration: '1',
  });
  assert.equal(apgarMod.primaryResult.value, 6);
  assert.equal(apgarMod.severity, 'moderate');

  const silverMod = silvermanAndersenCalculator.calculate({
    thoracoabdominal: '1',
    intercostal: '1',
    xiphoid: '1',
    nasalFlaring: '1',
    grunting: '1',
  });
  assert.equal(silverMod.primaryResult.value, 5);
  assert.equal(silverMod.severity, 'high');

  // OSI: HR 125 / SBP 85 = 1.47 -> critical
  const osi = obstetricShockIndexCalculator.calculate({
    hr: { value: '125', unitId: 'bpm' },
    sbp: { value: '85', unitId: 'mmhg' },
  });
  assert.equal(osi.primaryResult.value, 1.47);
  assert.equal(osi.severity, 'critical');

  // MgSO4 Zuspan: 20g/500mL (40 mg/mL), 1 g/h => 25.0 mL/h; 4 g in 100 mL / 20 min => 300 mL/h
  const mgso4 = obstetricMgso4Calculator.calculate({
    loadingGrams: '4',
    loadingMinutes: '20',
    maintGramsHour: '1',
    bagPrep: '20g_500ml',
  });
  assert.equal(mgso4.primaryResult.value, 25.0);
  assert.equal(mgso4.secondaryResults?.[0].formattedValue, '300 mL/h');
});

test('Catalog: 61 deduplicated tools, cross-specialty tagging, and accent-insensitive search', () => {
  assert.equal(CALCULATOR_CATALOG.length, 61);

  const endoCalcs = getCalculatorsBySpecialty('endocrinologia');
  assert.ok(endoCalcs.some((c) => c.id === 'homa-ir-b'));
  assert.ok(endoCalcs.some((c) => c.id === 'sodium-correction'));

  const cardioCalcs = getCalculatorsBySpecialty('cardiologia');
  assert.ok(cardioCalcs.some((c) => c.id === 'cha2ds2-vasc'));
  assert.ok(cardioCalcs.some((c) => c.id === 'heart-score'));
  assert.ok(cardioCalcs.some((c) => c.id === 'grace-score'));

  const erCalcs = getCalculatorsBySpecialty('urgencias');
  assert.ok(erCalcs.some((c) => c.id === 'news2'));
  assert.ok(erCalcs.some((c) => c.id === 'perc-rule'));
  assert.ok(erCalcs.some((c) => c.id === 'infusion-calculator'));

  const idCalcs = getCalculatorsBySpecialty('infectologia');
  assert.ok(idCalcs.some((c) => c.id === 'centor-mcisaac'));
  assert.ok(idCalcs.some((c) => c.id === 'psi-port'));
  assert.ok(idCalcs.some((c) => c.id === 'dengue-oms'));

  const neuroCalcs = getCalculatorsBySpecialty('neurologia');
  assert.ok(neuroCalcs.some((c) => c.id === 'glasgow'));
  assert.ok(neuroCalcs.some((c) => c.id === 'four-score'));
  assert.ok(neuroCalcs.some((c) => c.id === 'nihss'));
  assert.ok(neuroCalcs.some((c) => c.id === 'ich-score'));

  const surgCalcs = getCalculatorsBySpecialty('cirugia-general');
  assert.ok(surgCalcs.some((c) => c.id === 'alvarado'));
  assert.ok(surgCalcs.some((c) => c.id === 'ripasa'));
  assert.ok(surgCalcs.some((c) => c.id === 'air-score'));
  assert.ok(surgCalcs.some((c) => c.id === 'caprini'));

  const pedCalcs = getCalculatorsBySpecialty('pediatria');
  assert.ok(pedCalcs.some((c) => c.id === 'bsa-mosteller'));
  assert.ok(pedCalcs.some((c) => c.id === 'holliday-segar'));
  assert.ok(pedCalcs.some((c) => c.id === 'pews-brighton'));
  assert.ok(pedCalcs.some((c) => c.id === 'psofa'));

  const obgynCalcs = getCalculatorsBySpecialty('gineco-obstetricia');
  assert.ok(obgynCalcs.some((c) => c.id === 'gestational-age'));
  assert.ok(obgynCalcs.some((c) => c.id === 'bishop'));
  assert.ok(obgynCalcs.some((c) => c.id === 'apgar'));
  assert.ok(obgynCalcs.some((c) => c.id === 'obstetric-shock-index'));

  const byAccentInsensitiveQuery = searchCalculators('neumonia');
  assert.ok(byAccentInsensitiveQuery.some((c) => c.id === 'curb-65'));
  assert.ok(byAccentInsensitiveQuery.some((c) => c.id === 'psi-port'));

  const byAcronym = searchCalculators('tfge');
  assert.equal(byAcronym[0]?.id, 'ckd-epi-2021');
});

test('Phase 6 Audit: every calculator has unique ID, clinical safety metadata, valid fields, and full specialty coverage', () => {
  const seenIds = new Set<string>();

  for (const spec of SPECIALTIES) {
    assert.ok(
      getCalculatorsBySpecialty(spec.id).length > 0,
      `Especialidad sin herramientas: ${spec.id}`,
    );
  }

  for (const calc of CALCULATOR_CATALOG) {
    assert.ok(!seenIds.has(calc.id), `ID duplicado: ${calc.id}`);
    seenIds.add(calc.id);

    assert.ok(calc.name.trim().length > 0, `${calc.id}: falta name`);
    assert.ok(calc.shortName.trim().length > 0, `${calc.id}: falta shortName`);
    assert.ok(calc.description.trim().length > 0, `${calc.id}: falta description`);
    assert.ok(calc.clinicalIndication.trim().length > 0, `${calc.id}: falta clinicalIndication`);
    assert.ok(calc.validatedPopulation.trim().length > 0, `${calc.id}: falta validatedPopulation`);
    assert.ok(calc.version.trim().length > 0, `${calc.id}: falta version`);
    assert.ok(
      !calc.secondarySpecialties.includes(calc.primarySpecialty),
      `${calc.id}: primarySpecialty duplicada en secondarySpecialties`,
    );
    assert.ok(calc.contraindications.length > 0, `${calc.id}: faltan contraindications`);
    assert.ok(calc.limitations.length > 0, `${calc.id}: faltan limitations`);
    assert.ok(calc.references.length > 0, `${calc.id}: faltan references`);
    assert.ok(
      calc.references.every((ref) => ref.citation.trim().length > 10),
      `${calc.id}: referencia vacía o incompleta`,
    );
    assert.ok(calc.keywords.length > 0, `${calc.id}: faltan keywords`);
    assert.ok(calc.fields.length > 0, `${calc.id}: sin fields`);

    const fieldIds = new Set<string>();
    for (const field of calc.fields) {
      assert.ok(!fieldIds.has(field.id), `${calc.id}: campo duplicado ${field.id}`);
      fieldIds.add(field.id);

      if (field.type === 'number') {
        assert.ok(field.units.length > 0, `${calc.id}.${field.id}: sin unidades`);
        assert.ok(
          field.units.some((u) => u.id === field.defaultUnitId),
          `${calc.id}.${field.id}: defaultUnitId inválido`,
        );
      } else if (field.type === 'select') {
        assert.ok(field.options.length >= 2, `${calc.id}.${field.id}: < 2 opciones`);
        if (field.defaultValue !== undefined) {
          assert.ok(
            field.options.some((o) => o.value === field.defaultValue),
            `${calc.id}.${field.id}: defaultValue inválido`,
          );
        }
      }
    }

    const initial = createInitialInputs(calc);
    const validationErrors = validateCalculatorInputs(calc, initial);
    assert.ok(Array.isArray(validationErrors));

    if (validationErrors.length === 0) {
      const output = calc.calculate(initial);
      assert.ok(output.primaryResult.formattedValue.trim().length > 0, `${calc.id}: resultado vacío`);
      assert.ok(output.riskClassification.trim().length > 0, `${calc.id}: sin clasificación`);
      assert.ok(output.clinicalInterpretation.trim().length > 0, `${calc.id}: sin interpretación`);
      assert.ok(output.formulaUsed.trim().length > 0, `${calc.id}: sin formulaUsed`);
    }
  }
});


