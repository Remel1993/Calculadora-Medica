import assert from 'node:assert/strict';
import test from 'node:test';

import { abcd2Calculator } from '../calculators/abcd2.ts';
import { absoluteNeutrophilCountCalculator } from '../calculators/absoluteNeutrophilCount.ts';
import { acidBaseCompensationCalculator } from '../calculators/acidBaseCompensation.ts';
import { acuteDiarrheaPlanCalculator } from '../calculators/acuteDiarrheaPlan.ts';
import { airScoreCalculator } from '../calculators/airScore.ts';
import { alvaradoCalculator } from '../calculators/alvarado.ts';
import { anaphylaxisAdrenalineCalculator } from '../calculators/anaphylaxisAdrenaline.ts';
import { anionGapCalculator } from '../calculators/anionGap.ts';
import { ankleBrachialIndexCalculator } from '../calculators/ankleBrachialIndex.ts';
import { apacheIiCalculator } from '../calculators/apacheIi.ts';
import { apgarCalculator } from '../calculators/apgar.ts';
import { asaStatusCalculator } from '../calculators/asaStatus.ts';
import { asthmaActCalculator } from '../calculators/asthmaAct.ts';
import { asthmaCrisisAdultCalculator } from '../calculators/asthmaCrisisAdult.ts';
import { asthmaPulmonaryScoreCalculator } from '../calculators/asthmaPulmonaryScore.ts';
import { auditCalculator } from '../calculators/audit.ts';
import { bisapCalculator } from '../calculators/bisap.ts';
import { bishopCalculator } from '../calculators/bishop.ts';
import { bodyCompositionCalculator } from '../calculators/bodyComposition.ts';
import { bradenScaleCalculator } from '../calculators/bradenScale.ts';
import { bristolScaleCalculator } from '../calculators/bristolScale.ts';
import { bsaMostellerCalculator } from '../calculators/bsaMosteller.ts';
import { burnsWallaceParklandCalculator } from '../calculators/burnsWallaceParkland.ts';
import { calciumCorrectionCalculator } from '../calculators/calciumCorrection.ts';
import { capriniCalculator } from '../calculators/caprini.ts';
import { capurroNeonatalCalculator } from '../calculators/capurroNeonatal.ts';
import { centorMcisaacCalculator } from '../calculators/centorMcisaac.ts';
import { cervicalTraumaCalculator } from '../calculators/cervicalTrauma.ts';
import { cha2ds2VascCalculator } from '../calculators/cha2ds2Vasc.ts';
import { childPughCalculator } from '../calculators/childPugh.ts';
import { cincinnatiFastCalculator } from '../calculators/cincinnatiFast.ts';
import { ciwaArCalculator } from '../calculators/ciwaAr.ts';
import { ckdEpi2021Calculator } from '../calculators/ckdEpi2021.ts';
import { cockcroftGaultCalculator } from '../calculators/cockcroftGault.ts';
import { copdGoldCalculator } from '../calculators/copdGold.ts';
import { curb65Calculator } from '../calculators/curb65.ts';
import { dengueOmsCalculator } from '../calculators/dengueOms.ts';
import { diabeticFootScalesCalculator } from '../calculators/diabeticFootScales.ts';
import { dn4PainCalculator } from '../calculators/dn4Pain.ts';
import { edinburghEpdsCalculator } from '../calculators/edinburghEpds.ts';
import { epworthCalculator } from '../calculators/epworth.ts';
import { fallRiskCalculator } from '../calculators/fallRisk.ts';
import { fenaFeureaCalculator } from '../calculators/fenaFeurea.ts';
import { fib4Calculator } from '../calculators/fib4.ts';
import { findriscCalculator } from '../calculators/findrisc.ts';
import { fisherModificadaCalculator } from '../calculators/fisherModificada.ts';
import { fourScoreCalculator } from '../calculators/fourScore.ts';
import { framinghamCvdCalculator } from '../calculators/framinghamCvd.ts';
import { freeWaterDeficitCalculator } from '../calculators/freeWaterDeficit.ts';
import { gad7Calculator } from '../calculators/gad7.ts';
import { ganzoniIronDeficitCalculator } from '../calculators/ganzoniIronDeficit.ts';
import { gestationalAgeCalculator } from '../calculators/gestationalAge.ts';
import { glasgowCalculator } from '../calculators/glasgow.ts';
import { glasgowBlatchfordCalculator } from '../calculators/glasgowBlatchford.ts';
import { glasgowPediatricCalculator } from '../calculators/glasgowPediatric.ts';
import { graceScoreCalculator } from '../calculators/graceScore.ts';
import { hamiltonAnxietyCalculator } from '../calculators/hamiltonAnxiety.ts';
import { hasBledCalculator } from '../calculators/hasBled.ts';
import { hba1cEagCalculator } from '../calculators/hba1cEag.ts';
import { heartScoreCalculator } from '../calculators/heartScore.ts';
import { hollidaySegarCalculator } from '../calculators/hollidaySegar.ts';
import { homaIrBCalculator } from '../calculators/homaIrB.ts';
import { huntHessCalculator } from '../calculators/huntHess.ts';
import { hyperglycemicCrisesCalculator } from '../calculators/hyperglycemicCrises.ts';
import { hypertensionClassificationCalculator } from '../calculators/hypertensionClassification.ts';
import { ichScoreCalculator } from '../calculators/ichScore.ts';
import { idealAdjustedWeightCalculator } from '../calculators/idealAdjustedWeight.ts';
import { imcCalculator } from '../calculators/imc.ts';
import { infusionCalculator } from '../calculators/infusionCalculator.ts';
import { inpatientBasalBolusCalculator } from '../calculators/inpatientBasalBolus.ts';
import { insulinProtocolCalculator } from '../calculators/insulinProtocol.ts';
import { ipssProstateCalculator } from '../calculators/ipssProstate.ts';
import { kdigoAkiCalculator } from '../calculators/kdigoAki.ts';
import { kdigoCkdCalculator } from '../calculators/kdigoCkd.ts';
import { killipKimballCalculator } from '../calculators/killipKimball.ts';
import { ldlNonHdlCalculator } from '../calculators/ldlNonHdl.ts';
import { lrinecScoreCalculator } from '../calculators/lrinecScore.ts';
import { maddreyDfCalculator } from '../calculators/maddreyDf.ts';
import { mallampatiCalculator } from '../calculators/mallampati.ts';
import { mapPamCalculator } from '../calculators/mapPam.ts';
import { meldNaCalculator } from '../calculators/meldNa.ts';
import { mentzerIndexCalculator } from '../calculators/mentzerIndex.ts';
import { metabolicSyndromeCalculator } from '../calculators/metabolicSyndrome.ts';
import { miniCogCalculator } from '../calculators/miniCog.ts';
import { minorHeadTraumaCalculator } from '../calculators/minorHeadTrauma.ts';
import { mocaTestCalculator } from '../calculators/mocaTest.ts';
import { moriskyGreenCalculator } from '../calculators/moriskyGreen.ts';
import { neonatalJaundiceKramerCalculator } from '../calculators/neonatalJaundiceKramer.ts';
import { news2Calculator } from '../calculators/news2.ts';
import { nihssCalculator } from '../calculators/nihss.ts';
import { nyhaCalculator } from '../calculators/nyha.ts';
import { obstetricMgso4Calculator } from '../calculators/obstetricMgso4.ts';
import { obstetricShockIndexCalculator } from '../calculators/obstetricShockIndex.ts';
import { ottawaAnkleKneeCalculator } from '../calculators/ottawaAnkleKnee.ts';
import { oxygenationPafiSafiAaCalculator } from '../calculators/oxygenationPafiSafiAa.ts';
import { pediatricDehydrationCalculator } from '../calculators/pediatricDehydration.ts';
import { pediatricDosingCalculator } from '../calculators/pediatricDosing.ts';
import { percRuleCalculator } from '../calculators/percRule.ts';
import { pewsBrightonCalculator } from '../calculators/pewsBrighton.ts';
import { phq9Calculator } from '../calculators/phq9.ts';
import { plasmaOsmolarityCalculator } from '../calculators/plasmaOsmolarity.ts';
import { psiPortCalculator } from '../calculators/psiPort.ts';
import { psofaCalculator } from '../calculators/psofa.ts';
import { qsofaCalculator } from '../calculators/qsofa.ts';
import { qtcCalculator } from '../calculators/qtc.ts';
import { ransonCalculator } from '../calculators/ranson.ts';
import { ripasaCalculator } from '../calculators/ripasa.ts';
import { rockallCalculator } from '../calculators/rockall.ts';
import { sadPersonsCalculator } from '../calculators/sadPersons.ts';
import { sanFranciscoSyncopeCalculator } from '../calculators/sanFranciscoSyncope.ts';
import { shockIndexCalculator } from '../calculators/shockIndex.ts';
import { silvermanAndersenCalculator } from '../calculators/silvermanAndersen.ts';
import { smokingFagerstromCalculator } from '../calculators/smokingFagerstrom.ts';
import { sodiumCorrectionCalculator } from '../calculators/sodiumCorrection.ts';
import { sofaCalculator } from '../calculators/sofa.ts';
import { stopBangCalculator } from '../calculators/stopBang.ts';
import { tannerStagesCalculator } from '../calculators/tannerStages.ts';
import { timiRiskCalculator } from '../calculators/timiRisk.ts';
import { tokyoGuidelinesCalculator } from '../calculators/tokyoGuidelines.ts';
import { twistScoreCalculator } from '../calculators/twistScore.ts';
import { wellsTepCalculator } from '../calculators/wellsTep.ts';
import { wellsTvpCalculator } from '../calculators/wellsTvp.ts';
import { westleyCroupCalculator } from '../calculators/westleyCroup.ts';
import { whoGrowthCalculator } from '../calculators/whoGrowth.ts';
import { woodDownesFerresCalculator } from '../calculators/woodDownesFerres.ts';
import { woodSmokeExposureCalculator } from '../calculators/woodSmokeExposure.ts';
import {
  createInitialInputs,
  roundClinical,
  validateCalculatorInputs,
} from '../math/precision.ts';
import {
  evaluateWhoIndicator,
  getWhoReferenceTableRows,
} from '../math/whoLms.ts';
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

test('STOP-BANG, Epworth (ESS), Mallampati, and Hamilton Anxiety (HAM-A)', () => {
  // STOP-BANG: 2 STOP + male = 3 -> upgraded to high risk per Chung 2016
  const sbUpgraded = stopBangCalculator.calculate({
    snoring: true,
    tired: true,
    observed: false,
    pressure: false,
    bmi35: false,
    age50: false,
    neck40: false,
    male: true,
  });
  assert.equal(sbUpgraded.primaryResult.value, 3);
  assert.equal(sbUpgraded.severity, 'high');

  // Epworth: 8 * 2 = 16 -> severe excessive daytime sleepiness
  const essHigh = epworthCalculator.calculate({
    sittingReading: '2',
    watchingTv: '2',
    publicInactive: '2',
    carPassenger: '2',
    lyingAfternoon: '2',
    sittingTalking: '2',
    afterLunch: '2',
    carTraffic: '2',
  });
  assert.equal(essHigh.primaryResult.value, 16);
  assert.equal(essHigh.severity, 'critical');

  // Mallampati Class IV
  const mal4 = mallampatiCalculator.calculate({ mallampatiClass: '4' });
  assert.equal(mal4.primaryResult.formattedValue, 'Clase IV');
  assert.equal(mal4.severity, 'critical');

  // Hamilton Anxiety: psychic = 14, somatic = 14 -> total 28 (high)
  const hama = hamiltonAnxietyCalculator.calculate({
    anxiousMood: '2',
    tension: '2',
    fears: '2',
    insomnia: '2',
    intellectual: '2',
    depressedMood: '2',
    somaticMuscular: '2',
    somaticSensory: '2',
    cardiovascular: '2',
    respiratory: '2',
    gastrointestinal: '2',
    genitourinary: '2',
    autonomic: '2',
    behavior: '2',
  });
  assert.equal(hama.primaryResult.value, 28);
  assert.equal(hama.severity, 'high');
  assert.equal(hama.secondaryResults?.[0].formattedValue, '14 / 28');
  assert.equal(hama.secondaryResults?.[1].formattedValue, '14 / 28');
});

test('Asthma scales: ACT, Pulmonary Score (with GEMA SpO2 override), and Adult Crisis (GINA)', () => {
  const actUncontrolled = asthmaActCalculator.calculate({
    activity: '3',
    dyspnea: '3',
    nocturnal: '3',
    rescue: '3',
    selfRating: '3',
  });
  assert.equal(actUncontrolled.primaryResult.value, 15);
  assert.equal(actUncontrolled.severity, 'high');

  // Pulmonary Score 2 (Leve) overridden to Grave by SpO2 < 91%
  const psOverride = asthmaPulmonaryScoreCalculator.calculate({
    ageGroup: 'lt6',
    rrLt6: '1',
    rrGe6: '0',
    wheezing: '1',
    accessory: '0',
    spo2Band: 'lt91',
  });
  assert.equal(psOverride.primaryResult.value, 2);
  assert.equal(psOverride.severity, 'critical');

  // Adult Asthma Crisis: severe feature -> Grave
  const adultSevere = asthmaCrisisAdultCalculator.calculate({
    alteredMental: false,
    speech: 'words',
    respRate: 'gt30',
    heartRate: '100_120',
    spo2: '90_95',
    pef: 'gt50',
  });
  assert.equal(adultSevere.primaryResult.formattedValue, 'Grave');
  assert.equal(adultSevere.severity, 'high');
});

test('Mental Health & Addictions (Group 1): PHQ-9, GAD-7, SAD PERSONS, AUDIT, CIWA-Ar, Mini-Cog', () => {
  const phqAlert = phq9Calculator.calculate({
    q1: '1', q2: '1', q3: '0', q4: '1', q5: '0', q6: '0', q7: '0', q8: '0', q9: '1',
  });
  assert.equal(phqAlert.primaryResult.value, 4);
  assert.equal(phqAlert.severity, 'high');

  const gadMod = gad7Calculator.calculate({
    g1: '2', g2: '2', g3: '2', g4: '1', g5: '1', g6: '1', g7: '1',
  });
  assert.equal(gadMod.primaryResult.value, 10);
  assert.equal(gadMod.severity, 'moderate');

  const sadPlan = sadPersonsCalculator.calculate({
    sex: true, age: false, depression: false, previousAttempt: false, ethanol: false,
    rationalLoss: false, socialSupport: false, organizedPlan: true, noSpouse: false, sickness: false,
  });
  assert.equal(sadPlan.primaryResult.value, 2);
  assert.equal(sadPlan.severity, 'high');

  const auditRes = auditCalculator.calculate({
    q1: '3', q2: '2', q3: '2', q4: '1', q5: '1', q6: '0', q7: '1', q8: '1', q9: '2', q10: '4',
  });
  assert.equal(auditRes.primaryResult.value, 17);
  assert.equal(auditRes.severity, 'high');

  const ciwaSevere = ciwaArCalculator.calculate({
    nausea: '3', tremor: '4', sweats: '3', anxiety: '3', agitation: '3',
    tactile: '1', auditory: '1', visual: '1', headache: '2', orientation: '0',
  });
  assert.equal(ciwaSevere.primaryResult.value, 21);
  assert.equal(ciwaSevere.severity, 'critical');

  const miniPos = miniCogCalculator.calculate({ wordRecall: '2', clockDraw: '0' });
  assert.equal(miniPos.primaryResult.value, 2);
  assert.equal(miniPos.severity, 'high');
});

test('Gastroenterology & Hepatology (Group 2): GBS, Rockall, FIB-4, Child-Pugh, MELD-Na, Maddrey, Bristol', () => {
  const gbsLow = glasgowBlatchfordCalculator.calculate({
    sex: 'male',
    hemoglobin: { value: '14.2', unitId: 'g_dl' },
    bun: { value: '14', unitId: 'bun_mg_dl' },
    sbp: { value: '124', unitId: 'mmhg' },
    hr: { value: '82', unitId: 'bpm' },
    melena: false, syncope: false, liverDisease: false, heartFailure: false,
  });
  assert.equal(gbsLow.primaryResult.value, 0);
  assert.equal(gbsLow.severity, 'low');

  const rockallRes = rockallCalculator.calculate({
    mode: 'complete', age: '1', shock: '2', comorbidity: '2', diagnosis: '1', stigmata: '2',
  });
  assert.equal(rockallRes.primaryResult.value, 8);
  assert.equal(rockallRes.severity, 'critical');

  // FIB-4 = (54 * 48) / (190 * sqrt(42)) = 2592 / 1231.34 = 2.11
  const fib4Res = fib4Calculator.calculate({
    age: { value: '54', unitId: 'years' },
    ast: { value: '48', unitId: 'u_l' },
    alt: { value: '42', unitId: 'u_l' },
    platelets: { value: '190', unitId: '10e9_l' },
  });
  assert.equal(fib4Res.primaryResult.value, 2.11);
  assert.equal(fib4Res.severity, 'moderate');

  const cpRes = childPughCalculator.calculate({
    bilirubin: { value: '2.5', unitId: 'mg_dl' },
    albumin: { value: '3.0', unitId: 'g_dl' },
    inr: { value: '1.8', unitId: 'inr' },
    ascites: '2',
    encephalopathy: '2',
  });
  assert.equal(cpRes.primaryResult.value, 10);
  assert.equal(cpRes.severity, 'critical');

  const meldRes = meldNaCalculator.calculate({
    bilirubin: { value: '3.0', unitId: 'mg_dl' },
    inr: { value: '1.8', unitId: 'inr' },
    creatinine: { value: '1.5', unitId: 'mg_dl' },
    sodium: { value: '128', unitId: 'meq_l' },
    dialysis: false,
  });
  assert.ok(meldRes.primaryResult.value >= 20);

  // Maddrey DF = 4.6 * (20 - 12) + 8 = 44.8
  const maddreyRes = maddreyDfCalculator.calculate({
    ptPatient: { value: '20', unitId: 'sec' },
    ptControl: { value: '12', unitId: 'sec' },
    bilirubin: { value: '8', unitId: 'mg_dl' },
  });
  assert.equal(maddreyRes.primaryResult.value, 44.8);
  assert.equal(maddreyRes.severity, 'high');

  const bristolRes = bristolScaleCalculator.calculate({ bristolType: '4' });
  assert.equal(bristolRes.primaryResult.value, 4);
  assert.equal(bristolRes.severity, 'normal');
});

test('Pulmonology & Oxygenation (Group 3): GOLD ABE, Smoking/Fagerstrom, PaFi/SaFi/A-a', () => {
  const goldE = copdGoldCalculator.calculate({
    exacerbations: 'high',
    mmrc: '2',
    catScore: { value: '18', unitId: 'pts' },
    fev1Percent: { value: '45', unitId: 'pct' },
  });
  assert.equal(goldE.primaryResult.formattedValue, 'Grupo E');
  assert.equal(goldE.severity, 'high');

  const smokeRes = smokingFagerstromCalculator.calculate({
    cigsPerDay: { value: '20', unitId: 'cigs' },
    yearsSmoking: { value: '25', unitId: 'years' },
    q1: '3', q2: '1', q3: '1', q4: '1', q5: '1', q6: '0',
  });
  assert.equal(smokeRes.primaryResult.value, 25);
  assert.equal(smokeRes.severity, 'high');

  // FiO2 0.21, Patm 760, PaCO2 40 -> PAO2 = 0.21*(713) - 50 = 99.7; PaO2=70 -> PaFi=333, A-a=29.7
  const oxyRes = oxygenationPafiSafiAaCalculator.calculate({
    pao2: { value: '70', unitId: 'mmhg' },
    fio2: { value: '21', unitId: 'percent' },
    paco2: { value: '40', unitId: 'mmhg' },
    age: { value: '40', unitId: 'years' },
    spo2: { value: '93', unitId: 'pct' },
    patm: { value: '760', unitId: 'mmhg' },
  });
  assert.equal(oxyRes.primaryResult.value, 333);
});

test('Endocrinology & Nutrition (Group 4): FINDRISC, c-LDL Sampson/Friedewald, HbA1c/eAG, MetSyn, Devine/Mifflin', () => {
  const findRes = findriscCalculator.calculate({
    age: '3', bmi: '3', waist: '4', activity: '2', diet: '1', bpMeds: '2', highGlucose: '5', familyHx: '5',
  });
  assert.equal(findRes.primaryResult.value, 25);
  assert.equal(findRes.severity, 'critical');

  const ldlRes = ldlNonHdlCalculator.calculate({
    tc: { value: '220', unitId: 'mg_dl' },
    hdl: { value: '45', unitId: 'mg_dl' },
    tg: { value: '150', unitId: 'mg_dl' },
  });
  // Friedewald = 220 - 45 - 30 = 145.0; Sampson close to 147
  assert.ok(ldlRes.primaryResult.value > 140 && ldlRes.primaryResult.value < 155);

  // ADAG: 28.7 * 7.0 - 46.7 = 154.2 -> 154 mg/dL
  const a1cRes = hba1cEagCalculator.calculate({
    mode: 'a1c_to_eag',
    hba1c: { value: '7.0', unitId: 'pct' },
    eag: { value: '', unitId: 'mg_dl' },
  });
  assert.equal(a1cRes.primaryResult.value, 154);

  const metRes = metabolicSyndromeCalculator.calculate({
    waist: true, triglycerides: true, lowHdl: false, bloodPressure: true, glucose: false,
  });
  assert.equal(metRes.primaryResult.value, 3);
  assert.equal(metRes.severity, 'moderate');

  const weightRes = idealAdjustedWeightCalculator.calculate({
    sex: 'male',
    height: { value: '175', unitId: 'cm' },
    weight: { value: '110', unitId: 'kg' },
    age: { value: '40', unitId: 'years' },
    waist: { value: '105', unitId: 'cm' },
  });
  assert.ok(weightRes.primaryResult.value > 68 && weightRes.primaryResult.value < 73);
});

test('Trauma, Pain & Geriatrics (Group 5): Ottawa, CCTHR/PECARN, NEXUS/CCR, DN4, Braden, Morse/Downton', () => {
  const ottNeg = ottawaAnkleKneeCalculator.calculate({
    region: 'ankle_foot', anklePain: false, midfootPain: false, ankleUnableSteps: false,
  });
  assert.equal(ottNeg.primaryResult.formattedValue, 'Sin Rx');

  const pecarnPos = minorHeadTraumaCalculator.calculate({
    population: 'ped_lt2', pecarnLt2Ams: false, pecarnLt2PalpableFx: false,
    pecarnLt2Hematoma: true, pecarnLt2Loc5: false, pecarnLt2Mech: false, pecarnLt2AbnormalParent: false,
  });
  assert.equal(pecarnPos.primaryResult.formattedValue, 'Observación vs TAC');
  assert.equal(pecarnPos.severity, 'moderate');

  const nexusClear = cervicalTraumaCalculator.calculate({
    rule: 'nexus', nexusMidline: false, nexusNeuro: false, nexusAltered: false, nexusIntox: false, nexusDistracting: false,
  });
  assert.equal(nexusClear.primaryResult.formattedValue, 'Despeje clínico');

  const dn4Pos = dn4PainCalculator.calculate({
    q1: true, q2: false, q3: true, q4: true, q5: false, q6: false, q7: false, q8: true, q9: false, q10: false,
  });
  assert.equal(dn4Pos.primaryResult.value, 4);
  assert.equal(dn4Pos.severity, 'moderate');

  const bradenHigh = bradenScaleCalculator.calculate({
    sensory: '2', moisture: '2', activity: '1', mobility: '2', nutrition: '2', friction: '1',
  });
  assert.equal(bradenHigh.primaryResult.value, 10);
  assert.equal(bradenHigh.severity, 'high');

  const morseHigh = fallRiskCalculator.calculate({
    scale: 'morse', morseHistory: '25', morseSecondaryDx: '15', morseAid: '15', morseIv: '20', morseGait: '10', morseMental: '0',
  });
  assert.equal(morseHigh.primaryResult.value, 85);
  assert.equal(morseHigh.severity, 'high');
});

test('Pediatrics & Neonatology (Group 6): Westley, Wood-Downes-Ferres, Kramer, WHO Growth, Capurro', () => {
  const westleyMod = westleyCroupCalculator.calculate({
    consciousness: '0', cyanosis: '0', stridor: '2', airEntry: '1', retractions: '2',
  });
  assert.equal(westleyMod.primaryResult.value, 5);
  assert.equal(westleyMod.severity, 'moderate');

  const wdfMod = woodDownesFerresCalculator.calculate({
    wheezing: '2', retractions: '2', respRate: '2', heartRate: '1', ventilation: '0', cyanosis: '0',
  });
  assert.equal(wdfMod.primaryResult.value, 7);
  assert.equal(wdfMod.severity, 'moderate');

  const kramerEarly = neonatalJaundiceKramerCalculator.calculate({
    kramerZone: '2', hoursOfLife: { value: '14', unitId: 'hours' }, gestationalAge: 'term38', neuroRisk: false,
  });
  assert.equal(kramerEarly.severity, 'critical');

  const whoRes = whoGrowthCalculator.calculate({
    ageMonths: { value: '36', unitId: 'months' },
    sex: 'male',
    weight: { value: '14.5', unitId: 'kg' },
    height: { value: '96', unitId: 'cm' },
    zIndicator: 'bmifa',
    zScore: { value: '-2.5', unitId: 'z' },
  });
  assert.equal(whoRes.severity, 'high');

  // Automatic WHO LMS calculation (36 months boy at P50 median: ~14.3 kg, ~96.1 cm)
  const whoAuto = whoGrowthCalculator.calculate({
    ageMonths: { value: '36', unitId: 'months' },
    sex: 'male',
    weight: { value: '14.3', unitId: 'kg' },
    height: { value: '96.1', unitId: 'cm' },
    headCircumference: { value: '49.5', unitId: 'cm' },
    zIndicator: 'bmifa',
    zScore: { value: '', unitId: 'z' },
  });
  assert.equal(whoAuto.severity, 'normal');
  assert.ok(whoAuto.primaryResult.value !== null && whoAuto.primaryResult.value >= 40 && whoAuto.primaryResult.value <= 65);
  assert.ok(whoAuto.secondaryResults && whoAuto.secondaryResults.length >= 4);

  // Exact WHO LMS reference spot-check: newborn boy weight P50 = 3.3 kg, newborn girl weight P50 = 3.2 kg
  const newbornBoy = evaluateWhoIndicator('wfa', 'male', 0, 3.3464);
  assert.ok(newbornBoy && Math.abs(newbornBoy.zScore) < 0.05 && Math.round(newbornBoy.percentile) === 50);
  const wfaRows = getWhoReferenceTableRows('wfa', 'female');
  assert.equal(wfaRows[0].ageMonths, 0);
  assert.equal(wfaRows[0].p50, 3.2);
  const lhfaRows = getWhoReferenceTableRows('lhfa', 'male');
  assert.equal(lhfaRows[lhfaRows.length - 1].ageMonths, 228);

  // Capurro: 204 + (16+10+10+10+15) = 265 días = 37 sem 6 días
  const capRes = capurroNeonatalCalculator.calculate({
    earShape: '16', breastSize: '10', nipple: '10', skinTexture: '10', plantarCreases: '15',
  });
  assert.equal(capRes.primaryResult.formattedValue, '37 sem 6 d');
});

test('Hematology & Acid-Base (Group 7): Ganzoni, Mentzer, Winter/Acid-Base, ANC/RAN', () => {
  // Ganzoni: 70 * (15 - 9) * 2.4 + 500 = 1008 + 500 = 1508 mg
  const ganzRes = ganzoniIronDeficitCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    hbActual: { value: '9', unitId: 'g_dl' },
    hbTarget: { value: '15', unitId: 'g_dl' },
    storesMode: 'standard',
  });
  assert.equal(ganzRes.primaryResult.value, 1508);

  const mentzerThal = mentzerIndexCalculator.calculate({
    mcv: { value: '64', unitId: 'fl' },
    rbc: { value: '6.0', unitId: '10e6_ul' },
  });
  assert.ok(mentzerThal.primaryResult.value < 13);

  // Winter: HCO3 = 10 -> expected PaCO2 = 1.5*10 + 8 = 23 ± 2 (21-25)
  const winterRes = acidBaseCompensationCalculator.calculate({
    ph: { value: '7.22', unitId: 'ph' },
    paco2: { value: '23', unitId: 'mmhg' },
    hco3: { value: '10', unitId: 'meq_l' },
    respTiming: 'acute',
  });
  assert.equal(winterRes.primaryResult.value, 23);

  // ANC: 2.0 * 1000 * (20 + 0) / 100 = 400 -> Neutropenia grave (< 500)
  const ancRes = absoluteNeutrophilCountCalculator.calculate({
    wbc: { value: '2.0', unitId: '10e3_ul' },
    segsPercent: { value: '20', unitId: 'pct' },
    bandsPercent: { value: '0', unitId: 'pct' },
  });
  assert.equal(ancRes.primaryResult.value, 400);
  assert.equal(ancRes.severity, 'high');
});

test('Cardio, Vascular & Urology (Group 8): ABI/ITB, HTN ESH/ACC, San Francisco Syncope, IPSS, TWIST', () => {
  const abiRes = ankleBrachialIndexCalculator.calculate({
    brachialRight: { value: '140', unitId: 'mmhg' },
    brachialLeft: { value: '132', unitId: 'mmhg' },
    dorsalisPedis: { value: '84', unitId: 'mmhg' },
    posteriorTibial: { value: '98', unitId: 'mmhg' },
  });
  assert.equal(abiRes.primaryResult.value, 0.7);

  const htnRes = hypertensionClassificationCalculator.calculate({
    sbp: { value: '134', unitId: 'mmhg' },
    dbp: { value: '84', unitId: 'mmhg' },
    targetOrganSymptoms: false,
  });
  assert.equal(htnRes.severity, 'low');

  const sfPos = sanFranciscoSyncopeCalculator.calculate({
    chf: false, hctLt30: false, abnormalEcg: true, shortnessOfBreath: false, sbpLt90: false,
  });
  assert.equal(sfPos.primaryResult.value, 1);
  assert.equal(sfPos.severity, 'high');

  const ipssMod = ipssProstateCalculator.calculate({
    q1: '2', q2: '2', q3: '1', q4: '2', q5: '2', q6: '1', q7: '2', qol: '3',
  });
  assert.equal(ipssMod.primaryResult.value, 12);
  assert.equal(ipssMod.severity, 'moderate');

  const twistHigh = twistScoreCalculator.calculate({
    swelling: true, hardTesticle: true, absentCremaster: true, nauseaVomiting: false, highRiding: true,
  });
  assert.equal(twistHigh.primaryResult.value, 6);
  assert.equal(twistHigh.severity, 'critical');
});

test('Burns, Anaphylaxis & Soft Tissue (Group 9): Wallace/Parkland, Anaphylaxis/Adrenaline IM, LRINEC', () => {
  // 70 kg, 18% + 9% = 27% TBSA -> 4 * 70 * 27 = 7560 mL
  const burnRes = burnsWallaceParklandCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    hoursElapsed: { value: '0', unitId: 'h' },
    head: '0', antTrunk: '18', postTrunk: '0', rightArm: '9', leftArm: '0', rightLeg: '0', leftLeg: '0', perineum: '0',
  });
  assert.equal(burnRes.primaryResult.value, 7560);
  assert.equal(burnRes.severity, 'high');

  const anaphRes = anaphylaxisAdrenalineCalculator.calculate({
    weight: { value: '60', unitId: 'kg' },
    criterion1: true, criterion2: false, criterion3: false,
  });
  assert.equal(anaphRes.primaryResult.value, 0.5);
  assert.equal(anaphRes.severity, 'critical');

  const lrinecHigh = lrinecScoreCalculator.calculate({
    crp: { value: '200', unitId: 'mg_l' },
    wbc: { value: '26', unitId: '10e3_ul' },
    hb: { value: '10.2', unitId: 'g_dl' },
    sodium: { value: '130', unitId: 'meq_l' },
    creatinine: { value: '1.9', unitId: 'mg_dl' },
    glucose: { value: '210', unitId: 'mg_dl' },
  });
  assert.equal(lrinecHigh.primaryResult.value, 13);
  assert.equal(lrinecHigh.severity, 'critical');
});

test('Specialized Clinical Scales (Group 10): EPDS, Tanner, Tokyo TG18, KDIGO CKD, Killip-Kimball, MoCA, Wagner/PEDIS/WIfI, Morisky-Green', () => {
  // EPDS: low score with positive item 10 triggers critical safety alert
  const epdsSelfHarm = edinburghEpdsCalculator.calculate({
    q1: '0', q2: '0', q3: '0', q4: '0', q5: '0',
    q6: '0', q7: '0', q8: '0', q9: '0', q10: '1',
  });
  assert.equal(epdsSelfHarm.primaryResult.value, 1);
  assert.equal(epdsSelfHarm.severity, 'critical');

  const epdsHigh = edinburghEpdsCalculator.calculate({
    q1: '2', q2: '2', q3: '2', q4: '2', q5: '1',
    q6: '2', q7: '1', q8: '2', q9: '1', q10: '0',
  });
  assert.equal(epdsHigh.primaryResult.value, 15);
  assert.equal(epdsHigh.severity, 'high');

  // Tanner: precocious puberty flag in 7-year-old girl with B2
  const tannerPrecocious = tannerStagesCalculator.calculate({
    sex: 'female',
    age: { value: '7', unitId: 'years' },
    breastStage: '2',
    genitalStage: '1',
    pubicHairStage: '1',
  });
  assert.equal(tannerPrecocious.primaryResult.formattedValue, 'B2 P1');
  assert.equal(tannerPrecocious.severity, 'high');

  // Tokyo TG18: Grade II Cholangitis (>=2/5 criteria) & Grade III Cholecystitis
  const tokyoCholangitisII = tokyoGuidelinesCalculator.calculate({
    syndrome: 'cholangitis',
    cholanSystemic: true, cholanCholestasis: true, cholanImaging: true,
    cholanWbc: true, cholanFever39: true, cholanAge75: false, cholanBili5: false, cholanAlbumin: false,
    orgCv: false, orgNeuro: false, orgResp: false, orgRenal: false, orgHepatic: false, orgHema: false,
  });
  assert.equal(tokyoCholangitisII.primaryResult.value, 2);
  assert.equal(tokyoCholangitisII.severity, 'high');

  // KDIGO CKD: G3b + A2 (150 mg/g) -> Very High Risk (Red)
  const ckdRes = kdigoCkdCalculator.calculate({
    egfr: { value: '38', unitId: 'ml_min' },
    albuminuriaMode: 'acr',
    acr: { value: '150', unitId: 'mg_g' },
    aCategory: 'A1',
  });
  assert.equal(ckdRes.primaryResult.formattedValue, 'G3b-A2');
  assert.equal(ckdRes.severity, 'critical');

  // Killip-Kimball Class IV
  const killipRes = killipKimballCalculator.calculate({ killipClass: '4' });
  assert.equal(killipRes.primaryResult.formattedValue, 'Clase IV');
  assert.equal(killipRes.severity, 'critical');

  // MoCA: raw 25 + 1 education bonus (<=12 yrs) = 26 (Normal)
  const mocaRes = mocaTestCalculator.calculate({
    visuospatial: { value: '4', unitId: 'pts' },
    naming: { value: '3', unitId: 'pts' },
    attention: { value: '5', unitId: 'pts' },
    language: { value: '2', unitId: 'pts' },
    abstraction: { value: '2', unitId: 'pts' },
    recall: { value: '3', unitId: 'pts' },
    orientation: { value: '6', unitId: 'pts' },
    lowEducation: true,
  });
  assert.equal(mocaRes.primaryResult.value, 26);
  assert.equal(mocaRes.severity, 'normal');

  // Diabetic foot: W0-I3-fI0 (Stage 2 in Mills 2014) and W2-I2-fI2 (Stage 4)
  const wifiRestPain = diabeticFootScalesCalculator.calculate({
    scaleMode: 'wifi',
    wagnerGrade: '1',
    pedisPerfusion: '1',
    pedisInfection: '1',
    wifiWound: '0',
    wifiIschemia: '3',
    wifiInfection: '0',
  });
  assert.equal(wifiRestPain.primaryResult.value, 2);

  const wifiSevere = diabeticFootScalesCalculator.calculate({
    scaleMode: 'wifi',
    wagnerGrade: '1',
    pedisPerfusion: '1',
    pedisInfection: '1',
    wifiWound: '2',
    wifiIschemia: '2',
    wifiInfection: '2',
  });
  assert.equal(wifiSevere.primaryResult.value, 4);
  assert.equal(wifiSevere.severity, 'critical');

  // Morisky-Green: 4/4 compliant vs 3/4 non-compliant
  const moriskyOk = moriskyGreenCalculator.calculate({
    q1: 'adherent', q2: 'adherent', q3: 'adherent', q4: 'adherent',
  });
  assert.equal(moriskyOk.primaryResult.value, 4);
  assert.equal(moriskyOk.severity, 'normal');

  const moriskyFail = moriskyGreenCalculator.calculate({
    q1: 'non_adherent', q2: 'adherent', q3: 'adherent', q4: 'adherent',
  });
  assert.equal(moriskyFail.primaryResult.value, 3);
  assert.equal(moriskyFail.severity, 'moderate');
});

test('Diabetes Emergency/Inpatient & Stroke Triage: ADA 2024 DKA/HHS, RABBIT-2 Basal-Bolus, Cincinnati/FAST', () => {
  // DKA with hypokalemia (<3.5): blocks insulin IV infusion
  const dkaHypoK = hyperglycemicCrisesCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    glucose: { value: '420', unitId: 'mg_dl' },
    priorDiabetes: true,
    ph: { value: '7.15', unitId: 'ph' },
    hco3: { value: '11', unitId: 'meq_l' },
    ketones: 'positive',
    sodium: { value: '132', unitId: 'meq_l' },
    potassium: { value: '3.1', unitId: 'meq_l' },
    mentalStatus: 'alert',
  });
  assert.equal(dkaHypoK.primaryResult.value, 0);
  assert.equal(dkaHypoK.severity, 'critical');

  // DKA with safe K+ (4.2): 0.1 U/kg/h = 7.0 U/h
  const dkaSafeK = hyperglycemicCrisesCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    glucose: { value: '380', unitId: 'mg_dl' },
    priorDiabetes: true,
    ph: { value: '7.20', unitId: 'ph' },
    hco3: { value: '14', unitId: 'meq_l' },
    ketones: 'positive',
    sodium: { value: '134', unitId: 'meq_l' },
    potassium: { value: '4.2', unitId: 'meq_l' },
    mentalStatus: 'alert',
  });
  assert.equal(dkaSafeK.primaryResult.value, 7);

  // RABBIT-2: 80 kg with glucose 240 -> 0.5 U/kg/day = 40 U/day (20 basal + ~7x3 prandial = 41)
  const rabbitEating = inpatientBasalBolusCalculator.calculate({
    weight: { value: '80', unitId: 'kg' },
    glucose: { value: '240', unitId: 'mg_dl' },
    clinicalProfile: 'auto',
    oralIntake: 'eating',
  });
  assert.equal(rabbitEating.primaryResult.value, 41);

  // Hypoglycemia safety lock (<70 mg/dL)
  const rabbitHypo = inpatientBasalBolusCalculator.calculate({
    weight: { value: '80', unitId: 'kg' },
    glucose: { value: '62', unitId: 'mg_dl' },
    clinicalProfile: 'auto',
    oralIntake: 'eating',
  });
  assert.equal(rabbitHypo.primaryResult.value, 0);
  assert.equal(rabbitHypo.severity, 'critical');

  // Cincinnati/FAST: 2/3 positive
  const fastPos = cincinnatiFastCalculator.calculate({
    facialDroop: true,
    armDrift: true,
    speechAbnormal: false,
    timeWindow: 'lt_4_5h',
  });
  assert.equal(fastPos.primaryResult.value, 2);
  assert.equal(fastPos.severity, 'critical');

  // EDA Plan A (no dehydration, 10 kg, 14 months)
  const edaPlanA = acuteDiarrheaPlanCalculator.calculate({
    ageMonths: { value: '14', unitId: 'months' },
    weight: { value: '10', unitId: 'kg' },
    generalState: 'normal',
    eyes: 'normal',
    thirst: 'normal',
    skinPinch: 'fast',
    mucousMembranes: 'moist',
    tears: 'present',
    stoolType: 'watery',
    persistentVomiting: false,
    highFeverSepsis: false,
    severeMalnutrition: false,
  });
  assert.equal(edaPlanA.primaryResult.formattedValue, 'Plan A');
  assert.equal(edaPlanA.severity, 'normal');

  // EDA Plan B (some dehydration, 12 kg -> 75 * 12 = 900 mL SRO in 4h, CDS = 4)
  const edaPlanB = acuteDiarrheaPlanCalculator.calculate({
    ageMonths: { value: '24', unitId: 'months' },
    weight: { value: '12', unitId: 'kg' },
    generalState: 'irritable',
    eyes: 'sunken',
    thirst: 'eager',
    skinPinch: 'slow',
    mucousMembranes: 'sticky',
    tears: 'decreased',
    stoolType: 'watery',
    persistentVomiting: false,
    highFeverSepsis: false,
    severeMalnutrition: false,
  });
  assert.equal(edaPlanB.primaryResult.formattedValue, 'Plan B');
  assert.equal(edaPlanB.severity, 'moderate');
  assert.ok(edaPlanB.secondaryResults?.some((r) => r.formattedValue === '900'));
  assert.ok(edaPlanB.secondaryResults?.some((r) => r.formattedValue === '4/8'));

  // EDA Plan C (< 12 months infant, 8 kg -> 240 mL in 1h + 560 mL in 5h)
  const edaPlanC = acuteDiarrheaPlanCalculator.calculate({
    ageMonths: { value: '8', unitId: 'months' },
    weight: { value: '8', unitId: 'kg' },
    generalState: 'lethargic',
    eyes: 'deeply_sunken',
    thirst: 'poor',
    skinPinch: 'very_slow',
    mucousMembranes: 'dry',
    tears: 'absent',
    stoolType: 'dysentery',
    persistentVomiting: true,
    highFeverSepsis: true,
    severeMalnutrition: false,
  });
  assert.equal(edaPlanC.primaryResult.formattedValue, 'Plan C');
  assert.equal(edaPlanC.severity, 'critical');
  assert.ok(edaPlanC.secondaryResults?.some((r) => r.formattedValue === '240'));
  assert.ok(edaPlanC.secondaryResults?.some((r) => r.formattedValue === '560'));

  // EDA Plan C with severe acute malnutrition safety override
  const edaSam = acuteDiarrheaPlanCalculator.calculate({
    ageMonths: { value: '10', unitId: 'months' },
    weight: { value: '6', unitId: 'kg' },
    generalState: 'lethargic',
    eyes: 'deeply_sunken',
    thirst: 'poor',
    skinPinch: 'very_slow',
    mucousMembranes: 'dry',
    tears: 'absent',
    stoolType: 'watery',
    persistentVomiting: false,
    highFeverSepsis: false,
    severeMalnutrition: true,
  });
  assert.equal(edaSam.severity, 'critical');
  assert.ok(edaSam.riskClassification.includes('desnutrición aguda grave'));
});

test('Body Composition / Índice de Biomasa (FFMI, Deurenberg %Grasa, Boer LBM y criterio GLIM)', () => {
  // Hombre 35 años, 72 kg, 175 cm -> IMC = 23.51, %Grasa = 1.2*23.5102 + 0.23*35 - 10.8 - 5.4 = 20.06 -> 20.1%
  // Fat mass = 72 * 0.201 = 14.47 -> 14.5 kg; FFM = 72 - 14.5 = 57.5 kg; FFMI = 57.5 / 1.75^2 = 18.8 kg/m²
  const normalMale = bodyCompositionCalculator.calculate({
    sex: 'male',
    age: { value: '35', unitId: 'years' },
    weight: { value: '72', unitId: 'kg' },
    height: { value: '175', unitId: 'cm' },
  });
  assert.equal(normalMale.primaryResult.value, 18.8);
  assert.equal(normalMale.severity, 'normal');
  assert.equal(
    normalMale.secondaryResults?.find((r) => r.label.includes('IMC'))?.formattedValue,
    '23.5',
  );
  assert.equal(
    normalMale.secondaryResults?.find((r) => r.label.includes('Porcentaje de Grasa'))?.formattedValue,
    '20.1',
  );
  assert.equal(
    normalMale.secondaryResults?.find((r) => r.label.includes('Masa Libre de Grasa'))?.formattedValue,
    '57.5',
  );

  // Mujer 74 años, 46 kg, 165 cm -> IMC = 16.9, %Grasa = 1.2*16.896 + 0.23*74 - 5.4 = 31.9%
  // Fat mass = 46 * 0.319 = 14.7 kg; FFM = 31.3 kg; FFMI = 31.3 / 1.65^2 = 11.5 kg/m² (< 15.0 GLIM)
  const lowFfmFemale = bodyCompositionCalculator.calculate({
    sex: 'female',
    age: { value: '74', unitId: 'years' },
    weight: { value: '46', unitId: 'kg' },
    height: { value: '1.65', unitId: 'm' },
  });
  assert.ok(lowFfmFemale.primaryResult.value < 15.0);
  assert.equal(lowFfmFemale.severity, 'high');
  assert.ok(lowFfmFemale.riskClassification.includes('GLIM'));
});

test('Wood Smoke Exposure Index: horas-año cutoffs (100 / 200), concomitant smoking, and low exposure', () => {
  const highExposure = woodSmokeExposureCalculator.calculate({
    hoursPerDay: { value: '6', unitId: 'h_day' },
    yearsExposed: { value: '35', unitId: 'years' },
    ventilation: 'closed',
    concomitantSmoking: false,
  });
  assert.equal(highExposure.primaryResult.value, 210);
  assert.equal(highExposure.severity, 'high');
  assert.ok(highExposure.riskClassification.includes('≥ 200'));

  const moderateThreshold = woodSmokeExposureCalculator.calculate({
    hoursPerDay: { value: '4', unitId: 'h_day' },
    yearsExposed: { value: '25', unitId: 'years' },
    ventilation: 'partial',
    concomitantSmoking: false,
  });
  assert.equal(moderateThreshold.primaryResult.value, 100);
  assert.equal(moderateThreshold.severity, 'moderate');

  const mixedExposure = woodSmokeExposureCalculator.calculate({
    hoursPerDay: { value: '4', unitId: 'h_day' },
    yearsExposed: { value: '25', unitId: 'years' },
    ventilation: 'closed',
    concomitantSmoking: true,
  });
  assert.equal(mixedExposure.severity, 'high');

  const lowExposure = woodSmokeExposureCalculator.calculate({
    hoursPerDay: { value: '2', unitId: 'h_day' },
    yearsExposed: { value: '8', unitId: 'years' },
    ventilation: 'outdoor',
    concomitantSmoking: false,
  });
  assert.equal(lowExposure.primaryResult.value, 16);
  assert.equal(lowExposure.severity, 'low');
});

test('Catalog: 126 deduplicated tools, cross-specialty tagging, and accent-insensitive search', () => {
  assert.equal(CALCULATOR_CATALOG.length, 126);

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
  assert.ok(pedCalcs.some((c) => c.id === 'silverman-andersen'));
  assert.ok(pedCalcs.some((c) => c.id === 'tanner-stages'));

  const obgynCalcs = getCalculatorsBySpecialty('gineco-obstetricia');
  assert.ok(obgynCalcs.some((c) => c.id === 'gestational-age'));
  assert.ok(obgynCalcs.some((c) => c.id === 'bishop'));
  assert.ok(obgynCalcs.some((c) => c.id === 'apgar'));
  assert.ok(obgynCalcs.some((c) => c.id === 'obstetric-shock-index'));

  const psychCalcs = getCalculatorsBySpecialty('psiquiatria');
  assert.ok(psychCalcs.some((c) => c.id === 'sad-persons'));
  assert.ok(psychCalcs.some((c) => c.id === 'gad-7'));
  assert.ok(psychCalcs.some((c) => c.id === 'hamilton-anxiety'));
  assert.ok(psychCalcs.some((c) => c.id === 'phq-9'));
  assert.ok(!neuroCalcs.some((c) => c.id === 'gad-7'));
  assert.ok(!neuroCalcs.some((c) => c.id === 'hamilton-anxiety'));
  assert.ok(!neuroCalcs.some((c) => c.id === 'phq-9'));

  const gastroCalcs = getCalculatorsBySpecialty('gastroenterologia');
  assert.ok(gastroCalcs.some((c) => c.id === 'child-pugh'));
  assert.ok(gastroCalcs.some((c) => c.id === 'glasgow-blatchford'));
  assert.ok(gastroCalcs.some((c) => c.id === 'bristol-scale'));

  const pneumoCalcs = getCalculatorsBySpecialty('neumologia');
  assert.ok(pneumoCalcs.some((c) => c.id === 'copd-gold'));
  assert.ok(pneumoCalcs.some((c) => c.id === 'stop-bang'));
  assert.ok(pneumoCalcs.some((c) => c.id === 'asthma-act'));

  const traumaCalcs = getCalculatorsBySpecialty('traumatologia');
  assert.ok(traumaCalcs.some((c) => c.id === 'ottawa-ankle-knee'));
  assert.ok(traumaCalcs.some((c) => c.id === 'cervical-trauma'));

  const hemaCalcs = getCalculatorsBySpecialty('hematologia');
  assert.ok(hemaCalcs.some((c) => c.id === 'ganzoni-iron'));
  assert.ok(hemaCalcs.some((c) => c.id === 'mentzer-index'));

  const uroCalcs = getCalculatorsBySpecialty('urologia');
  assert.ok(uroCalcs.some((c) => c.id === 'ipss-prostate'));
  assert.ok(uroCalcs.some((c) => c.id === 'twist-score'));
  assert.ok(!surgCalcs.some((c) => c.id === 'ipss-prostate'));

  const geriatricsCalcs = getCalculatorsBySpecialty('geriatria');
  assert.ok(geriatricsCalcs.some((c) => c.id === 'mini-cog'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'braden-scale'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'fall-risk'));

  const dermCalcs = getCalculatorsBySpecialty('dermatologia');
  assert.ok(dermCalcs.some((c) => c.id === 'burns-parkland'));
  assert.ok(dermCalcs.some((c) => c.id === 'lrinec-score'));

  const byAccentInsensitiveQuery = searchCalculators('neumonia');
  assert.ok(byAccentInsensitiveQuery.some((c) => c.id === 'curb-65'));
  assert.ok(byAccentInsensitiveQuery.some((c) => c.id === 'psi-port'));

  const byAcronym = searchCalculators('tfge');
  assert.equal(byAcronym[0]?.id, 'ckd-epi-2021');

  const byBiomass = searchCalculators('biomasa');
  assert.ok(byBiomass.some((c) => c.id === 'body-composition-ffmi'));
  assert.ok(byBiomass.some((c) => c.id === 'imc'));
  assert.ok(byBiomass.some((c) => c.id === 'wood-smoke-exposure'));

  const byWoodSmoke = searchCalculators('humo de lena');
  assert.equal(byWoodSmoke[0]?.id, 'wood-smoke-exposure');

  for (let i = 1; i < CALCULATOR_CATALOG.length; i += 1) {
    const prev = CALCULATOR_CATALOG[i - 1];
    const curr = CALCULATOR_CATALOG[i];
    assert.ok(
      prev.name.localeCompare(curr.name, 'es', { sensitivity: 'base' }) <= 0,
      `Orden alfabético inválido: "${prev.name}" antes de "${curr.name}"`,
    );
  }
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


