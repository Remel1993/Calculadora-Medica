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
import { headacheRedFlagsCalculator } from '../calculators/headacheRedFlags.ts';
import { hba1cEagCalculator } from '../calculators/hba1cEag.ts';
import { heartScoreCalculator } from '../calculators/heartScore.ts';
import { hollidaySegarCalculator } from '../calculators/hollidaySegar.ts';
import { homaIrBCalculator } from '../calculators/homaIrB.ts';
import { huntHessCalculator } from '../calculators/huntHess.ts';
import { hyperglycemicCrisesCalculator } from '../calculators/hyperglycemicCrises.ts';
import { hypertensionClassificationCalculator } from '../calculators/hypertensionClassification.ts';
import { ichScoreCalculator } from '../calculators/ichScore.ts';
import { ichd3HeadacheCalculator } from '../calculators/ichd3Headache.ts';
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
import { mrcNeurologicalWeaknessCalculator } from '../calculators/mrcNeurologicalWeakness.ts';
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
  getCatalogForScope,
  getCalculatorsBySpecialty,
  searchCalculators,
  searchCalculatorsForScope,
  searchCalculatorsInSpecialty,
} from '../registries/catalog.ts';
import {
  isDualCalculator,
  isDualTable,
  isTableVisibleForScope,
  resolveCalculatorForGuideline,
  resolveTableForGuideline,
} from '../registries/guidelineRegistry.ts';
import { SPECIALTIES } from '../registries/specialties.ts';
import { dripRateIvCalculator } from '../calculators/dripRateIv.ts';
import { nursingDilutionCalculator } from '../calculators/nursingDilution.ts';
import { acrTiradsCalculator } from '../calculators/acrTirads.ts';
import { radsInterpreterCalculator } from '../calculators/radsInterpreter.ts';
import { cervicalPapBethesdaCalculator } from '../calculators/cervicalPapBethesda.ts';
import { ovarianRmiRomaCalculator } from '../calculators/ovarianRmiRoma.ts';
import { ecogKarnofskyCalculator } from '../calculators/ecogKarnofsky.ts';
import { masccFebrileNeutropeniaCalculator } from '../calculators/masccFebrileNeutropenia.ts';
import { calvertCarboplatinCalculator } from '../calculators/calvertCarboplatin.ts';
import { hivCdcCd4ProphylaxisCalculator } from '../calculators/hivCdcCd4Prophylaxis.ts';
import { hivPepPrepCalculator } from '../calculators/hivPepPrep.ts';
import { hivOpportunisticArtTimingCalculator } from '../calculators/hivOpportunisticArtTiming.ts';
import { immunizationMinsaNicaraguaCalculator } from '../calculators/immunizationMinsaNicaragua.ts';
import { malariaLeptospirosisMinsaCalculator } from '../calculators/malariaLeptospirosisMinsa.ts';
import { pediatricBroselowResuscitationCalculator } from '../calculators/pediatricBroselowResuscitation.ts';
import { neonatalPhototherapyExchangeAap2022Calculator } from '../calculators/neonatalPhototherapyExchangeAap2022.ts';
import { dailyDrugConvertersCalculator } from '../calculators/dailyDrugConverters.ts';
import {
  computeHadlockEfw1985,
  evaluateFetalWeight,
  evaluateMaternalWeightGain,
  getHadlockFetalPercentilesAtGa,
} from '../data/obstetricWeightStandards.ts';
import { fetalBiophysicalProfileCalculator } from '../calculators/fetalBiophysicalProfile.ts';
import { gestationalDiabetesCalculator } from '../calculators/gestationalDiabetes.ts';
import { obstetricSepsisMeowsCalculator } from '../calculators/obstetricSepsisMeows.ts';
import { obstetricWeightGainCalculator } from '../calculators/obstetricWeightGain.ts';
import { preeclampsiaHellpCalculator } from '../calculators/preeclampsiaHellp.ts';
import { barthelIndexCalculator } from '../calculators/barthelIndex.ts';
import { charlsonComorbidityCalculator } from '../calculators/charlsonComorbidity.ts';
import { clinicalFrailtyScaleCalculator } from '../calculators/clinicalFrailtyScale.ts';
import { pediatricSchwartzCalculator } from '../calculators/pediatricSchwartz.ts';
import { bicarbonateDeficitCalculator } from '../calculators/bicarbonateDeficit.ts';
import { fourTsHitCalculator } from '../calculators/fourTsHit.ts';
import { isthDicCalculator } from '../calculators/isthDic.ts';
import { spesiPeCalculator } from '../calculators/spesiPe.ts';
import { stoneScoreCalculator } from '../calculators/stoneScore.ts';
import { psaDensityCalculator } from '../calculators/psaDensity.ts';
import { gustiloAndersonCalculator } from '../calculators/gustiloAnderson.ts';
import { messScoreCalculator } from '../calculators/messScore.ts';
import { scortenScoreCalculator } from '../calculators/scortenScore.ts';
import { uas7UrticariaCalculator } from '../calculators/uas7Urticaria.ts';
import { lawtonBrodyCalculator } from '../calculators/lawtonBrody.ts';
import { anticholinergicBurdenCalculator } from '../calculators/anticholinergicBurden.ts';
import { mnaSfCalculator } from '../calculators/mnaSf.ts';
import { sarcFCalculator } from '../calculators/sarcF.ts';
import { yesavageGds15Calculator } from '../calculators/yesavageGds15.ts';
import { score2CvdCalculator } from '../calculators/score2Cvd.ts';
import { dutchLipidClinicCalculator } from '../calculators/dutchLipidClinic.ts';
import { masldApriNfsCalculator } from '../calculators/masldApriNfs.ts';
import { osteoporosisOstaWhoCalculator } from '../calculators/osteoporosisOstaWho.ts';
import { fibromyalgiaAcr2016Calculator } from '../calculators/fibromyalgiaAcr2016.ts';
import { das28RaCalculator } from '../calculators/das28Ra.ts';
import { romeIvBowelCalculator } from '../calculators/romeIvBowel.ts';
import { acuteRhinosinusitisCalculator } from '../calculators/acuteRhinosinusitis.ts';
import { menopauseMrsCalculator } from '../calculators/menopauseMrs.ts';
import { pcosRotterdamCalculator } from '../calculators/pcosRotterdam.ts';
import { pediatricBloodPressureCalculator } from '../calculators/pediatricBloodPressure.ts';
import { targetHeightVelocityCalculator } from '../calculators/targetHeightVelocity.ts';
import { mchatRCalculator } from '../calculators/mchatR.ts';
import { hintsPlusVertigoCalculator } from '../calculators/hintsPlusVertigo.ts';
import { vppbManipulationCalculator } from '../calculators/vppbManipulation.ts';
import { CLINICAL_REFERENCE_TABLES } from '../registries/clinicalTables.ts';
import { getCalculatorFormulaReference } from '../registries/formulaReference.ts';

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

  // Adult Asthma Crisis: separate Leve vs Moderada vs Grave vs Riesgo vital
  const adultMild = asthmaCrisisAdultCalculator.calculate({
    alteredMental: false,
    speech: 'paragraphs',
    respRate: 'lt20',
    heartRate: 'lt100',
    spo2: 'gt95',
    pef: 'gt70',
  });
  assert.equal(adultMild.primaryResult.formattedValue, 'Leve');
  assert.equal(adultMild.severity, 'low');

  const adultModerate = asthmaCrisisAdultCalculator.calculate({
    alteredMental: false,
    speech: 'paragraphs',
    respRate: '20_30',
    heartRate: 'lt100',
    spo2: 'gt95',
    pef: 'gt70',
  });
  assert.equal(adultModerate.primaryResult.formattedValue, 'Moderada');
  assert.equal(adultModerate.severity, 'moderate');

  const adultSevere = asthmaCrisisAdultCalculator.calculate({
    alteredMental: false,
    speech: 'words',
    respRate: 'gt30',
    heartRate: '100_120',
    spo2: '90_95',
    pef: 'gt70',
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
  assert.equal(wfaRows[wfaRows.length - 1].ageMonths, 120);
  const lhfaRows = getWhoReferenceTableRows('lhfa', 'male');
  assert.equal(lhfaRows[lhfaRows.length - 1].ageMonths, 228);

  // Boundary P2.3-P3 (-2.00 <= Z < -1.88): never claim "entre P3 y P97" when percentile is P2
  const lhfaBorderLow = evaluateWhoIndicator('lhfa', 'male', 36, 88.75);
  assert.ok(lhfaBorderLow);
  assert.ok(lhfaBorderLow.zScore >= -2 && lhfaBorderLow.zScore < -1.88);
  assert.ok(lhfaBorderLow.percentile < 3);
  assert.ok(!lhfaBorderLow.parentExplanation.includes('entre P3 y P97'));
  assert.ok(lhfaBorderLow.classification.includes('límite inferior'));

  // Boundary P97-P97.7 (+1.88 < Z <= +2.00): never claim "entre P3 y P97" when percentile is P98
  const lhfaBorderHigh = evaluateWhoIndicator('lhfa', 'male', 36, 103.5);
  assert.ok(lhfaBorderHigh);
  assert.ok(lhfaBorderHigh.zScore > 1.88 && lhfaBorderHigh.zScore <= 2);
  assert.ok(lhfaBorderHigh.percentile > 97);
  assert.ok(!lhfaBorderHigh.parentExplanation.includes('entre P3 y P97'));
  assert.ok(lhfaBorderHigh.classification.includes('límite superior'));

  // Manual Z-score with zIndicator = 'hfa' and 'wfa' returns height / weight as primaryResult (not BMI)
  const whoManualHfa = whoGrowthCalculator.calculate({
    ageMonths: { value: '36', unitId: 'months' },
    sex: 'female',
    weight: { value: '13.9', unitId: 'kg' },
    height: { value: '86', unitId: 'cm' },
    zIndicator: 'hfa',
    zScore: { value: '-2.3', unitId: 'z' },
  });
  assert.equal(whoManualHfa.primaryResult.value, 86);
  assert.equal(whoManualHfa.primaryResult.unit, 'cm');
  assert.ok(whoManualHfa.primaryResult.label.includes('Talla'));

  const whoManualWfa = whoGrowthCalculator.calculate({
    ageMonths: { value: '36', unitId: 'months' },
    sex: 'female',
    weight: { value: '18.5', unitId: 'kg' },
    height: { value: '95', unitId: 'cm' },
    zIndicator: 'wfa',
    zScore: { value: '2.2', unitId: 'z' },
  });
  assert.equal(whoManualWfa.primaryResult.value, 18.5);
  assert.equal(whoManualWfa.primaryResult.unit, 'kg');
  assert.equal(whoManualWfa.severity, 'moderate');

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

test('ICHD-3 Migraine & Primary Headaches, SNNOOP10 Red Flags, and MRC Neurological Weakness', () => {
  // ICHD-3 1.1 Migraine without aura
  const migraineNoAura = ichd3HeadacheCalculator.calculate({
    syndrome: 'migraine_without_aura',
    redFlagsPresent: false,
    attackCount: 'ge5',
    duration4to72h: true,
    cUnilateral: true,
    cPulsatile: true,
    cModerateSevere: true,
    cAggravatedActivity: false,
    dNauseaVomiting: true,
    dPhotoPhono: false,
    chronicFrequency: false,
    medicationOveruse: false,
  });
  assert.equal(migraineNoAura.primaryResult.formattedValue, 'ICHD-3 1.1');
  assert.equal(migraineNoAura.severity, 'moderate');

  // ICHD-3 1.3 Chronic Migraine + 8.2 Medication Overuse
  const chronicMigraine = ichd3HeadacheCalculator.calculate({
    syndrome: 'migraine_without_aura',
    redFlagsPresent: false,
    attackCount: 'ge5',
    duration4to72h: true,
    cUnilateral: true,
    cPulsatile: false,
    cModerateSevere: true,
    cAggravatedActivity: true,
    dNauseaVomiting: false,
    dPhotoPhono: true,
    chronicFrequency: true,
    medicationOveruse: true,
  });
  assert.equal(chronicMigraine.primaryResult.formattedValue, 'ICHD-3 1.3');
  assert.equal(chronicMigraine.severity, 'high');

  // ICHD-3 1.5.1 Probable migraine when >= 5 attacks, B, C met, but D missing (e.g. photophobia only, no nausea)
  const probableMigraineMissingD = ichd3HeadacheCalculator.calculate({
    syndrome: 'migraine_without_aura',
    redFlagsPresent: false,
    attackCount: 'ge5',
    duration4to72h: true,
    cUnilateral: true,
    cPulsatile: true,
    cModerateSevere: true,
    cAggravatedActivity: false,
    dNauseaVomiting: false,
    dPhotoPhono: false,
    chronicFrequency: false,
    medicationOveruse: false,
  });
  assert.equal(probableMigraineMissingD.primaryResult.formattedValue, 'ICHD-3 1.5.1');
  assert.equal(probableMigraineMissingD.severity, 'low');

  // ICHD-3 1.2.3 Hemiplegic migraine: first/atypical motor weakness triggers critical stroke warning
  const hemiplegicFirst = ichd3HeadacheCalculator.calculate({
    syndrome: 'migraine_with_aura',
    redFlagsPresent: false,
    auraAttacks: '1',
    auraVisual: true,
    auraSensory: false,
    auraSpeech: false,
    auraMotor: true,
    familyHemiplegic: false,
    motorAtypicalOrFirst: true,
    auraBrainstem: false,
    auraRetinal: false,
    acGradual5: true,
    acSuccession: true,
    acDuration60: true,
    acUnilateral: true,
    acPositive: false,
    acHeadache60: true,
    chronicFrequency: false,
    medicationOveruse: false,
  });
  assert.equal(hemiplegicFirst.severity, 'critical');

  // ICHD-3 1.5.2 Probable migraine with aura (2 attacks with visual aura, 2/6 C criteria)
  const probableAura = ichd3HeadacheCalculator.calculate({
    syndrome: 'migraine_with_aura',
    redFlagsPresent: false,
    auraAttacks: 'ge2',
    auraVisual: true,
    auraSensory: false,
    auraSpeech: false,
    auraMotor: false,
    auraBrainstem: false,
    auraRetinal: false,
    acGradual5: true,
    acSuccession: false,
    acDuration60: true,
    acUnilateral: false,
    acPositive: false,
    acHeadache60: false,
    chronicFrequency: false,
    medicationOveruse: false,
  });
  assert.equal(probableAura.primaryResult.formattedValue, 'ICHD-3 1.5.2');

  // ICHD-3 2.4 Probable tension headache (< 10 episodes but B, C, D fulfilled)
  const probableTth = ichd3HeadacheCalculator.calculate({
    syndrome: 'tension_headache',
    redFlagsPresent: false,
    tthFrequency: 'lt10',
    tthDuration: true,
    tthBilateral: true,
    tthPressing: true,
    tthMildMod: true,
    tthNoAggravation: true,
    tthNoNausea: true,
    tthPhotoPhonoMaxOne: true,
    medicationOveruse: false,
  });
  assert.equal(probableTth.primaryResult.formattedValue, 'ICHD-3 2.4');

  // ICHD-3 3.1 Cluster Headache & 3.5.1 Probable Cluster (< 5 attacks)
  const clusterRes = ichd3HeadacheCalculator.calculate({
    syndrome: 'cluster_headache',
    redFlagsPresent: false,
    clusterAttacks: true,
    clusterPain: true,
    clusterAutonomic: true,
    clusterRestlessness: true,
    clusterFreq: true,
  });
  assert.equal(clusterRes.primaryResult.formattedValue, 'ICHD-3 3.1');
  assert.equal(clusterRes.severity, 'high');

  const probableCluster = ichd3HeadacheCalculator.calculate({
    syndrome: 'cluster_headache',
    redFlagsPresent: false,
    clusterAttacks: false,
    clusterPain: true,
    clusterAutonomic: true,
    clusterRestlessness: false,
    clusterFreq: true,
  });
  assert.equal(probableCluster.primaryResult.formattedValue, 'ICHD-3 3.5.1');

  // SNNOOP10 Red Flags: thunderclap + neuro deficit -> critical
  const snnoopCrit = headacheRedFlagsCalculator.calculate({
    sSystemic: false,
    nNeoplasm: false,
    nNeuroDeficit: true,
    oOnsetSudden: true,
    oOlderAge: false,
    p1PatternChange: false,
    p2Positional: false,
    p3Precipitated: false,
    p4Papilledema: false,
    p5Progressive: false,
    p6Pregnancy: false,
    p7PainfulEye: false,
    p8Posttraumatic: false,
    p9PathologyImmune: false,
    p10PainkillerOveruse: false,
  });
  assert.equal(snnoopCrit.primaryResult.value, 2);
  assert.equal(snnoopCrit.severity, 'critical');

  // SNNOOP10: isolated medication overuse -> moderate orange flag
  const snnoopOveruse = headacheRedFlagsCalculator.calculate({
    sSystemic: false,
    nNeoplasm: false,
    nNeuroDeficit: false,
    oOnsetSudden: false,
    oOlderAge: false,
    p1PatternChange: false,
    p2Positional: false,
    p3Precipitated: false,
    p4Papilledema: false,
    p5Progressive: false,
    p6Pregnancy: false,
    p7PainfulEye: false,
    p8Posttraumatic: false,
    p9PathologyImmune: false,
    p10PainkillerOveruse: true,
  });
  assert.equal(snnoopOveruse.primaryResult.value, 1);
  assert.equal(snnoopOveruse.severity, 'moderate');

  // MRC Neurological Weakness: hyperacute right hemiparesis -> critical + right hemiparesis detection
  const mrcHemiparesis = mrcNeurologicalWeaknessCalculator.calculate({
    onsetTempo: 'hyperacute',
    neuroPattern: 'umn',
    rShoulder: '2',
    lShoulder: '5',
    rElbow: '2',
    lElbow: '5',
    rWrist: '1',
    lWrist: '5',
    rHip: '3',
    lHip: '5',
    rKnee: '3',
    lKnee: '5',
    rAnkle: '3',
    lAnkle: '5',
  });
  assert.equal(mrcHemiparesis.primaryResult.value, 44);
  assert.equal(mrcHemiparesis.severity, 'critical');
  assert.ok(mrcHemiparesis.riskClassification.includes('Hemiparesia DERECHA'));

  // MRC Neurological Weakness: ICU-acquired weakness < 48 (42/60)
  const mrcIcuaw = mrcNeurologicalWeaknessCalculator.calculate({
    onsetTempo: 'icu_critical',
    neuroPattern: 'lmn',
    rShoulder: '3',
    lShoulder: '3',
    rElbow: '4',
    lElbow: '4',
    rWrist: '4',
    lWrist: '4',
    rHip: '3',
    lHip: '3',
    rKnee: '4',
    lKnee: '4',
    rAnkle: '3',
    lAnkle: '3',
  });
  assert.equal(mrcIcuaw.primaryResult.value, 42);
  assert.equal(mrcIcuaw.severity, 'high');
  assert.ok(mrcIcuaw.riskClassification.includes('ICUAW'));
});

test('Obstetrics expansion: IOM/Hadlock weight gain & fetal curves, Preeclampsia/HELLP, GDM, BPP, SOS/MEOWS', () => {
  // 1. Hadlock 1991 standard matches exact published P50 = 3619 g (P10 = 3004 g, P90 = 4234 g) at 40 weeks
  const bands40 = getHadlockFetalPercentilesAtGa(40)!;
  assert.equal(bands40.p50, 3619);
  assert.equal(bands40.p10, 3004);
  assert.equal(bands40.p90, 4234);

  // Hadlock 1985 4-parameter biometry EFW sanity check (~1210 g around 28w)
  const biometryEfw = computeHadlockEfw1985({
    bpdMm: 71,
    hcMm: 263,
    acMm: 240,
    flMm: 53,
  });
  assert.ok(biometryEfw > 1100 && biometryEfw < 1300);

  // Maternal weight gain IOM 2009: normal BMI (62 kg, 1.62 m -> 23.6), +8.0 kg at 28 sem -> within band
  const matOk = evaluateMaternalWeightGain({
    preWeightKg: 62,
    currentWeightKg: 70,
    heightM: 1.62,
    weeks: 28,
    plurality: 'singleton',
  });
  assert.equal(matOk.bmiCategory, 'normal');
  assert.equal(matOk.status, 'within');
  assert.equal(matOk.severity, 'normal');

  // SGA (< P3) detection at 34 weeks (1700 g < P3 ~1784 g)
  const fetSga = evaluateFetalWeight(1700, 34)!;
  assert.equal(fetSga.severity, 'high');
  assert.ok(fetSga.classification.includes('< P3'));

  // Full calculator execution in biometry mode
  const obGainRes = obstetricWeightGainCalculator.calculate({
    gestationalWeeks: { value: '32', unitId: 'weeks' },
    plurality: 'singleton',
    preWeight: { value: '58', unitId: 'kg' },
    height: { value: '160', unitId: 'cm' },
    currentWeight: { value: '68', unitId: 'kg' },
    fetalInputMode: 'biometry',
    bpdMm: { value: '81', unitId: 'mm' },
    hcMm: { value: '295', unitId: 'mm' },
    acMm: { value: '280', unitId: 'mm' },
    flMm: { value: '62', unitId: 'mm' },
  });
  assert.equal(obGainRes.primaryResult.value, 10);
  assert.ok((obGainRes.secondaryResults?.length ?? 0) >= 4);

  // 2. Preeclampsia / HELLP: Complete Tennessee HELLP -> critical
  const hellpRes = preeclampsiaHellpCalculator.calculate({
    gestationalContext: 'ge20_new',
    sbp: { value: '154', unitId: 'mmhg' },
    dbp: { value: '98', unitId: 'mmhg' },
    proteinuria: 'positive',
    platelets: { value: '68', unitId: 'k_ul' },
    astAltMax: { value: '145', unitId: 'ul' },
    ldh: { value: '780', unitId: 'ul' },
    creatinine: { value: '1.0', unitId: 'mg_dl' },
    creatinineDoubled: false,
    hemolysisEvidence: true,
    neuroVisualSymptoms: false,
    epigastricPain: true,
    pulmonaryEdema: false,
    eclampsiaSeizures: false,
  });
  assert.equal(hellpRes.severity, 'critical');
  assert.equal(hellpRes.primaryResult.formattedValue, 'HELLP Completo');

  // Preeclampsia without severe features
  const mildPeRes = preeclampsiaHellpCalculator.calculate({
    gestationalContext: 'ge20_new',
    sbp: { value: '146', unitId: 'mmhg' },
    dbp: { value: '94', unitId: 'mmhg' },
    proteinuria: 'positive',
    platelets: { value: '210', unitId: 'k_ul' },
    astAltMax: { value: '24', unitId: 'ul' },
    ldh: { value: '220', unitId: 'ul' },
    creatinine: { value: '0.7', unitId: 'mg_dl' },
    creatinineDoubled: false,
    hemolysisEvidence: false,
    neuroVisualSymptoms: false,
    epigastricPain: false,
    pulmonaryEdema: false,
    eclampsiaSeizures: false,
  });
  assert.equal(mildPeRes.primaryResult.formattedValue, 'Preeclampsia');
  assert.equal(mildPeRes.severity, 'high');

  // 3. Gestational Diabetes: IADPSG 75 g (1 altered value = GDM) & Carpenter-Coustan 100 g (1 vs 2 altered)
  const iadpsgDmg = gestationalDiabetesCalculator.calculate({
    protocol: 'iadpsg_75g',
    fastingGlucose: { value: '94', unitId: 'mg_dl' },
    glucose1h: { value: '170', unitId: 'mg_dl' },
    glucose2h: { value: '140', unitId: 'mg_dl' },
  });
  assert.equal(iadpsgDmg.primaryResult.formattedValue, 'DMG (+)');
  assert.equal(iadpsgDmg.severity, 'moderate');

  const ccSingle = gestationalDiabetesCalculator.calculate({
    protocol: 'carpenter_coustan_100g',
    fastingGlucose: { value: '90', unitId: 'mg_dl' },
    glucose1h: { value: '185', unitId: 'mg_dl' },
    glucose2h: { value: '140', unitId: 'mg_dl' },
    glucose3h: { value: '120', unitId: 'mg_dl' },
  });
  assert.equal(ccSingle.primaryResult.formattedValue, '1 Valor Alterado');
  assert.equal(ccSingle.severity, 'low');

  // 4. Manning Biophysical Profile: 8/10 with oligohydramnios -> high alert
  const bppOligo = fetalBiophysicalProfileCalculator.calculate({
    nstReactive: true,
    fetalBreathing: true,
    fetalMovements: true,
    fetalTone: true,
    amnioticMethod: 'sdp',
    sdpCm: { value: '1.6', unitId: 'cm' },
  });
  assert.equal(bppOligo.primaryResult.value, 8);
  assert.equal(bppOligo.severity, 'high');
  assert.ok(bppOligo.riskClassification.includes('Oligohidramnios'));

  // 5. Obstetric Sepsis (SOS): Albright >= 6 -> critical
  const sosHigh = obstetricSepsisMeowsCalculator.calculate({
    temperature: { value: '39.4', unitId: 'c' }, // +3
    sbp: { value: '86', unitId: 'mmhg' }, // +2
    heartRate: { value: '132', unitId: 'bpm' }, // +2
    respiratoryRate: { value: '26', unitId: 'rpm' }, // +2 (Albright 2014: 25–34)
    spo2: { value: '95', unitId: 'pct' }, // 0
    wbc: { value: '19.2', unitId: 'k_ul' }, // +2 (Albright 2014: 17.0–24.9)
    immatureNeutrophilsPct: { value: '14', unitId: 'pct' }, // +2
    lactate: { value: '2.5', unitId: 'mmol_l' }, // 0
    neuroAltered: false,
    oliguria: false,
  });
  assert.equal(sosHigh.primaryResult.value, 13);
  assert.equal(sosHigh.severity, 'critical');
});

test('Specialty Gaps Expansion: Geriatrics, Nephrology, Hematology, Urology, Trauma & Dermatology', () => {
  // 1. Barthel Index (Geriatrics): 100 = independent, 20 = critical dependence
  const barthelFull = barthelIndexCalculator.calculate({
    feeding: '10', bathing: '5', grooming: '5', dressing: '10', bowels: '10',
    bladder: '10', toilet: '10', transfers: '15', mobility: '15', stairs: '10',
  });
  assert.equal(barthelFull.primaryResult.value, 100);
  assert.equal(barthelFull.severity, 'normal');

  const barthelDep = barthelIndexCalculator.calculate({
    feeding: '5', bathing: '0', grooming: '0', dressing: '5', bowels: '5',
    bladder: '5', toilet: '0', transfers: '0', mobility: '0', stairs: '0',
  });
  assert.equal(barthelDep.primaryResult.value, 20);
  assert.equal(barthelDep.severity, 'critical');

  // 2. Charlson Comorbidity Index: Age 72 (+3) + CHF (+1) + DM w/ organ damage (+2) + CKD (+2) = 8
  const charlsonRes = charlsonComorbidityCalculator.calculate({
    age: { value: '72', unitId: 'years' },
    mi: false, chf: true, pvd: false, cva: false, dementia: false, copd: false,
    ctd: false, pud: false, hemiplegia: false, ckd: true,
    diabetes: '2', liver: '0', tumor: '0', leukemia: false, lymphoma: false, aids: false,
  });
  assert.equal(charlsonRes.primaryResult.value, 8);
  assert.equal(charlsonRes.severity, 'critical');

  // 3. Clinical Frailty Scale (Rockwood 2.0): level 6 moderate, level 9 terminal
  const cfsMod = clinicalFrailtyScaleCalculator.calculate({ cfsLevel: '6' });
  assert.equal(cfsMod.primaryResult.value, 6);
  assert.equal(cfsMod.severity, 'moderate');
  assert.equal(clinicalFrailtyScaleCalculator.calculate({ cfsLevel: '9' }).severity, 'critical');

  // 4. Pediatric Schwartz CKiD (2009): 0.413 * 100 / 0.50 = 82.6 -> G2 low
  const schwartzRes = pediatricSchwartzCalculator.calculate({
    heightCm: { value: '100', unitId: 'cm' },
    creatinine: { value: '0.50', unitId: 'mg_dl' },
    ageYears: { value: '4', unitId: 'years' },
  });
  assert.equal(schwartzRes.primaryResult.value, 82.6);
  assert.equal(schwartzRes.severity, 'low');

  // 5. Bicarbonate Deficit: 0.5 * 70 * (16 - 10) = 210 mEq total, 105 mEq initial 50%
  const hco3Res = bicarbonateDeficitCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    currentHco3: { value: '10', unitId: 'meq_l' },
    targetHco3: { value: '16', unitId: 'meq_l' },
    vdFactor: '0.5',
  });
  assert.equal(hco3Res.primaryResult.value, 210);
  assert.equal(hco3Res.severity, 'high');
  assert.ok(hco3Res.secondaryResults?.[0].formattedValue.includes('105'));

  // 6. 4Ts HIT Score: 2+2+1+2 = 7 -> high/critical probability
  const hitHigh = fourTsHitCalculator.calculate({
    thrombocytopenia: '2', timing: '2', thrombosis: '1', otherCauses: '2',
  });
  assert.equal(hitHigh.primaryResult.value, 7);
  assert.equal(hitHigh.severity, 'critical');

  // 7. ISTH Overt DIC: Plt <50 (+2) + D-dimer mod (+2) + PT 3-6 (+1) + Fbg <100 (+1) = 6 -> critical
  const dicOvert = isthDicCalculator.calculate({
    hasUnderlyingDisorder: true, platelets: '2', fibrinMarkers: '2', ptProlongation: '1', fibrinogen: '1',
  });
  assert.equal(dicOvert.primaryResult.value, 6);
  assert.equal(dicOvert.severity, 'critical');

  // 8. sPESI: 0 = low, >=1 = high/critical
  const spesiLow = spesiPeCalculator.calculate({
    age80: false, cancer: false, cardiopulmonary: false, hr110: false, sbp100: false, spo290: false,
  });
  assert.equal(spesiLow.primaryResult.value, 0);
  assert.equal(spesiLow.severity, 'low');

  const spesiUnstable = spesiPeCalculator.calculate({
    age80: true, cancer: false, cardiopulmonary: false, hr110: true, sbp100: true, spo290: false,
  });
  assert.equal(spesiUnstable.primaryResult.value, 3);
  assert.equal(spesiUnstable.severity, 'critical');

  // 9. STONE Score: Male(+2) + <6h(+3) + NonBlack(+3) + Vomiting(+2) + RBC(+3) = 13 -> high
  const stoneHigh = stoneScoreCalculator.calculate({
    sex: '2', timing: '3', origin: '3', nausea: '2', erythrocytes: true,
  });
  assert.equal(stoneHigh.primaryResult.value, 13);
  assert.equal(stoneHigh.severity, 'high');

  // 10. PSA Density: 7.5 / 30 = 0.25 -> critical (>=0.20) + 12% free PSA
  const psadHigh = psaDensityCalculator.calculate({
    totalPsa: { value: '7.5', unitId: 'ng_ml' },
    prostateVolume: { value: '30', unitId: 'cm3' },
    freePsa: { value: '0.9', unitId: 'ng_ml' },
  });
  assert.equal(psadHigh.primaryResult.value, 0.25);
  assert.equal(psadHigh.severity, 'critical');

  // 11. Gustilo-Anderson: Grade I wound + farm contamination -> upgraded to Tipo IIIA
  const gaUpgraded = gustiloAndersonCalculator.calculate({
    woundGrade: '1', specialContamination: true,
  });
  assert.equal(gaUpgraded.primaryResult.formattedValue, 'Tipo IIIA');
  assert.equal(gaUpgraded.severity, 'high');

  // 12. MESS Score: High energy(3) + Moderate ischemia(2 * 2 if >6h = 4) + Shock(1) + Age 35(1) = 9
  const messRes = messScoreCalculator.calculate({
    skeletalSoftTissue: '3', ischemia: '2', ischemiaGt6h: true, shock: '1', age: '1',
  });
  assert.equal(messRes.primaryResult.value, 9);
  assert.equal(messRes.severity, 'critical');

  // 13. SCORTEN: Age 52(+1) + Malignancy(+1) + HR 128(+1) + BSA 25%(+1) + Urea 12 mmol/L(+1) + HCO3 17(+1) + Glucose 280(+1) = 7
  const scortenMax = scortenScoreCalculator.calculate({
    age: { value: '52', unitId: 'years' },
    malignancy: true,
    hr: { value: '128', unitId: 'bpm' },
    bsaDetached: { value: '25', unitId: 'pct' },
    bun: { value: '12', unitId: 'mmol_l' },
    hco3: { value: '17', unitId: 'meq_l' },
    glucose: { value: '280', unitId: 'mg_dl' },
  });
  assert.equal(scortenMax.primaryResult.value, 7);
  assert.equal(scortenMax.severity, 'critical');

  // 14. UAS7: weekly 15 + 16 = 31 -> severe (28-42)
  const uas7High = uas7UrticariaCalculator.calculate({
    mode: 'weekly',
    weeklyWheals: { value: '15', unitId: 'pts' },
    weeklyItch: { value: '16', unitId: 'pts' },
    dailyWheals: '2',
    dailyItch: '2',
  });
  assert.equal(uas7High.primaryResult.value, 31);
  assert.equal(uas7High.severity, 'critical');
});

test('Consulta Externa Expansion (18 tools): Geriatrics, Cardio/Lipids, Hepato/GI, Rheum/Bone, ENT, Gyn & Well-Child Pediatrics', () => {
  // 1. Lawton & Brody IADL: 8/8 normal vs 5/8 moderate with medication/finances flagged
  const lawtonFull = lawtonBrodyCalculator.calculate({
    telephone: '1', shopping: '1', foodPrep: '1', housekeeping: '1',
    laundry: '1', transport: '1', medication: '1', finances: '1',
  });
  assert.equal(lawtonFull.primaryResult.value, 8);
  assert.equal(lawtonFull.severity, 'normal');

  const lawtonMod = lawtonBrodyCalculator.calculate({
    telephone: '1', shopping: '0', foodPrep: '1', housekeeping: '1',
    laundry: '1', transport: '1', medication: '0', finances: '0',
  });
  assert.equal(lawtonMod.primaryResult.value, 5);
  assert.equal(lawtonMod.severity, 'moderate');
  assert.ok(lawtonMod.secondaryResults?.[0].formattedValue.includes('Medicación'));

  // 2. Anticholinergic Burden (ACB): Amitriptilina (+3) + Carbamazepina (+2) + Furosemida (+1) = 6 -> critical
  const acbHigh = anticholinergicBurdenCalculator.calculate({
    ...createInitialInputs(anticholinergicBurdenCalculator),
    acb3_amitriptilina: true,
    acb2_carbamazepina: true,
    acb1_furosemida: true,
  });
  assert.equal(acbHigh.primaryResult.value, 6);
  assert.equal(acbHigh.severity, 'critical');

  // 3. MNA-SF: 14 normal, 10 moderate risk, 5 high malnutrition
  const mnaRisk = mnaSfCalculator.calculate({
    intake: '1', weightLoss: '2', mobility: '2', acuteStress: '2', neuropsych: '1', bmiOrCalf: '2',
  });
  assert.equal(mnaRisk.primaryResult.value, 10);
  assert.equal(mnaRisk.severity, 'moderate');

  const mnaMal = mnaSfCalculator.calculate({
    intake: '0', weightLoss: '0', mobility: '1', acuteStress: '0', neuropsych: '2', bmiOrCalf: '1',
  });
  assert.equal(mnaMal.primaryResult.value, 4);
  assert.equal(mnaMal.severity, 'high');

  // 4. SARC-F: cutoff >= 4 positive
  const sarcPos = sarcFCalculator.calculate({
    strength: '1', assistance: '1', riseChair: '1', climbStairs: '1', falls: '0',
  });
  assert.equal(sarcPos.primaryResult.value, 4);
  assert.equal(sarcPos.severity, 'high');

  // 5. Yesavage GDS-15: reverse-scored items q1, q5, q7, q11, q13 (No = +1)
  const gdsInit = createInitialInputs(yesavageGds15Calculator);
  const gdsNormal = yesavageGds15Calculator.calculate(gdsInit);
  assert.equal(gdsNormal.primaryResult.value, 0);
  assert.equal(gdsNormal.severity, 'normal');

  const gdsMod = yesavageGds15Calculator.calculate({
    ...gdsInit,
    q1: false, // +1 (reverse)
    q5: false, // +1 (reverse)
    q2: true,  // +1
    q3: true,  // +1
    q12: true, // +1
    q14: true, // +1
  });
  assert.equal(gdsMod.primaryResult.value, 6);
  assert.equal(gdsMod.severity, 'moderate');

  // 6. SCORE2 (ESC 2021): high-risk region older male smoker has much higher risk than low-risk young female non-smoker
  const score2LowYoungFemale = score2CvdCalculator.calculate({
    region: 'low',
    sex: 'female',
    age: { value: '45', unitId: 'years' },
    smoker: false,
    sbp: { value: '115', unitId: 'mmhg' },
    totalChol: { value: '180', unitId: 'mg_dl' },
    hdlChol: { value: '60', unitId: 'mg_dl' },
  });
  assert.equal(score2LowYoungFemale.severity, 'low');
  assert.ok(score2LowYoungFemale.primaryResult.value! < 2.5);

  const score2VeryHighMale = score2CvdCalculator.calculate({
    region: 'very_high',
    sex: 'male',
    age: { value: '65', unitId: 'years' },
    smoker: true,
    sbp: { value: '165', unitId: 'mmhg' },
    totalChol: { value: '270', unitId: 'mg_dl' },
    hdlChol: { value: '35', unitId: 'mg_dl' },
  });
  assert.equal(score2VeryHighMale.severity, 'critical');
  assert.ok(score2VeryHighMale.primaryResult.value! >= 10);

  // 7. Dutch Lipid Clinic Network (DLCN): 2 + 2 + 6 + 5 + 0 = 15 -> Definitive (> 8)
  const dlcnDef = dutchLipidClinicCalculator.calculate({
    familyHistory: '2', clinicalHistory: '2', physicalExam: '6', ldlBaseline: '5', genetics: '0',
  });
  assert.equal(dlcnDef.primaryResult.value, 15);
  assert.equal(dlcnDef.severity, 'critical');

  // 8. MASLD / APRI + NFS: low-risk young vs high-risk older cirrhotic
  const nfsLow = masldApriNfsCalculator.calculate({
    age: { value: '35', unitId: 'years' },
    bmi: { value: '26', unitId: 'kg_m2' },
    diabetesOrIfg: false,
    ast: { value: '24', unitId: 'u_l' },
    astUln: { value: '40', unitId: 'u_l' },
    alt: { value: '32', unitId: 'u_l' },
    platelets: { value: '270', unitId: '10e9_l' },
    albumin: { value: '4.5', unitId: 'g_dl' },
  });
  assert.ok(nfsLow.primaryResult.value! < -1.455);
  assert.equal(nfsLow.severity, 'low');

  const nfsHigh = masldApriNfsCalculator.calculate({
    age: { value: '68', unitId: 'years' },
    bmi: { value: '34', unitId: 'kg_m2' },
    diabetesOrIfg: true,
    ast: { value: '88', unitId: 'u_l' },
    astUln: { value: '40', unitId: 'u_l' },
    alt: { value: '55', unitId: 'u_l' },
    platelets: { value: '105', unitId: '10e9_l' },
    albumin: { value: '3.2', unitId: 'g_dl' },
  });
  assert.ok(nfsHigh.primaryResult.value! > 0.676);
  assert.equal(nfsHigh.severity, 'high');

  // 9. Osteoporosis OMS/ISCD & OSTA: T-score -2.7 + fracture = critical; Z-score -2.3 young = moderate; OSTA 0.2*(50-75) = -5 -> high
  const osteoCrit = osteoporosisOstaWhoCalculator.calculate({
    mode: 'who_dxa',
    population: 'postmeno_ge50',
    tScore: { value: '-2.7', unitId: 'sd' },
    zScore: { value: '-1.0', unitId: 'sd' },
    fragilityFracture: true,
    weight: { value: '54', unitId: 'kg' },
    age: { value: '68', unitId: 'years' },
  });
  assert.equal(osteoCrit.severity, 'critical');

  const osteoYoung = osteoporosisOstaWhoCalculator.calculate({
    mode: 'who_dxa',
    population: 'premeno_lt50',
    tScore: { value: '-2.1', unitId: 'sd' },
    zScore: { value: '-2.3', unitId: 'sd' },
    fragilityFracture: false,
    weight: { value: '54', unitId: 'kg' },
    age: { value: '38', unitId: 'years' },
  });
  assert.equal(osteoYoung.severity, 'moderate');

  const ostaHigh = osteoporosisOstaWhoCalculator.calculate({
    mode: 'osta',
    population: 'postmeno_ge50',
    tScore: { value: '-2.1', unitId: 'sd' },
    zScore: { value: '-1.8', unitId: 'sd' },
    fragilityFracture: false,
    weight: { value: '50', unitId: 'kg' },
    age: { value: '75', unitId: 'years' },
  });
  assert.equal(ostaHigh.primaryResult.value, -5);
  assert.equal(ostaHigh.severity, 'high');

  // 10. Fibromyalgia ACR 2016: WPI 9 + SSS 7 = FS 16 + >=4/5 regions + >=3m -> Cumple criterios
  const fibroPos = fibromyalgiaAcr2016Calculator.calculate({
    wpi: { value: '9', unitId: 'areas' },
    fatigue: '2', wakingUnrefreshed: '2', cognitive: '1',
    headache: true, abdominalPain: false, depression: true,
    generalizedRegions: true, duration3Months: true,
  });
  assert.equal(fibroPos.primaryResult.formattedValue, 'Cumple criterios');
  assert.equal(fibroPos.primaryResult.value, 16);

  // 11. DAS28-ESR & DAS28-CRP
  const dasEsrRemission = das28RaCalculator.calculate({
    variant: 'esr',
    tjc: { value: '0', unitId: 'joints' },
    sjc: { value: '0', unitId: 'joints' },
    gh: { value: '15', unitId: 'mm' },
    esr: { value: '14', unitId: 'mm_h' },
    crp: { value: '4', unitId: 'mg_l' },
  });
  assert.ok(dasEsrRemission.primaryResult.value! < 2.6);
  assert.equal(dasEsrRemission.severity, 'normal');

  const dasCrpHigh = das28RaCalculator.calculate({
    variant: 'crp',
    tjc: { value: '12', unitId: 'joints' },
    sjc: { value: '8', unitId: 'joints' },
    gh: { value: '70', unitId: 'mm' },
    esr: { value: '40', unitId: 'mm_h' },
    crp: { value: '35', unitId: 'mg_l' },
  });
  assert.ok(dasCrpHigh.primaryResult.value! > 5.1);
  assert.equal(dasCrpHigh.severity, 'critical');

  // 12. Rome IV IBS & Functional Constipation + Alarm override
  const romeIbs = romeIvBowelCalculator.calculate({
    ...createInitialInputs(romeIvBowelCalculator),
    syndrome: 'ibs',
    chronicity: true,
    alarmFlags: false,
    ibsPainFreq: true,
    ibsDefecation: true,
    ibsFreqChange: true,
    ibsFormChange: false,
  });
  assert.equal(romeIbs.primaryResult.formattedValue, 'Cumple Roma IV');
  assert.equal(romeIbs.severity, 'moderate');

  const romeAlarm = romeIvBowelCalculator.calculate({
    ...createInitialInputs(romeIvBowelCalculator),
    syndrome: 'constipation',
    alarmFlags: true,
  });
  assert.equal(romeAlarm.severity, 'critical');

  // 13. Acute Rhinosinusitis IDSA/EPOS: Viral vs Bacterial vs Alarm
  const sinusViral = acuteRhinosinusitisCalculator.calculate({
    persistent10d: false, severeOnset: false, doubleSickening: false, redFlags: false,
  });
  assert.equal(sinusViral.primaryResult.formattedValue, 'Viral');
  assert.equal(sinusViral.severity, 'low');

  const sinusBact = acuteRhinosinusitisCalculator.calculate({
    persistent10d: true, severeOnset: false, doubleSickening: false, redFlags: false,
  });
  assert.equal(sinusBact.primaryResult.formattedValue, 'Bacteriana');
  assert.equal(sinusBact.severity, 'high');

  const sinusAlarm = acuteRhinosinusitisCalculator.calculate({
    persistent10d: false, severeOnset: false, doubleSickening: false, redFlags: true,
  });
  assert.equal(sinusAlarm.severity, 'critical');

  // 14. Menopause Rating Scale (MRS): sum across 11 items -> >= 16 severe
  const mrsSevere = menopauseMrsCalculator.calculate({
    m1: '3', m2: '1', m3: '3', m4: '2', m5: '2', m6: '1', m7: '2', m8: '1', m9: '1', m10: '2', m11: '2',
  });
  assert.equal(mrsSevere.primaryResult.value, 20);
  assert.equal(mrsSevere.severity, 'high');

  // 15. PCOS Rotterdam 2023: Phenotype B (OD + HA, excluded=true) vs pending exclusion
  const pcosPhenB = pcosRotterdamCalculator.calculate({
    ovulatoryDysfunction: true, hyperandrogenism: true, pcomOrAmh: false, mimickersExcluded: true,
  });
  assert.equal(pcosPhenB.primaryResult.formattedValue, 'Fenotipo B');
  assert.equal(pcosPhenB.severity, 'moderate');

  const pcosPending = pcosRotterdamCalculator.calculate({
    ovulatoryDysfunction: true, hyperandrogenism: true, pcomOrAmh: true, mimickersExcluded: false,
  });
  assert.equal(pcosPending.severity, 'high');

  // 16. Pediatric BP AAP 2017: 1y girl 96/52 normal (< 98/54), 1y girl 96/54 positive (>= 54 DBP), 15y teen 132/82 Stage 1
  const pedBp1yNorm = pediatricBloodPressureCalculator.calculate({
    sex: 'female', ageYears: { value: '1', unitId: 'years' }, sbp: { value: '96', unitId: 'mmhg' }, dbp: { value: '52', unitId: 'mmhg' },
  });
  assert.equal(pedBp1yNorm.severity, 'normal');

  const pedBp1yPos = pediatricBloodPressureCalculator.calculate({
    sex: 'female', ageYears: { value: '1', unitId: 'years' }, sbp: { value: '96', unitId: 'mmhg' }, dbp: { value: '54', unitId: 'mmhg' },
  });
  assert.equal(pedBp1yPos.severity, 'high');

  const teenStage1 = pediatricBloodPressureCalculator.calculate({
    sex: 'male', ageYears: { value: '15', unitId: 'years' }, sbp: { value: '132', unitId: 'mmhg' }, dbp: { value: '82', unitId: 'mmhg' },
  });
  assert.equal(teenStage1.severity, 'high');

  // 17. Target Height (Tanner) & Growth Velocity: boy (160+174+13)/2 = 173.5 cm; velocity (117.5-112)/12*12 = 5.5 cm/yr
  const targetRes = targetHeightVelocityCalculator.calculate({
    sex: 'male',
    motherHeight: { value: '160', unitId: 'cm' },
    fatherHeight: { value: '174', unitId: 'cm' },
    prevHeight: { value: '112.0', unitId: 'cm' },
    currHeight: { value: '117.5', unitId: 'cm' },
    intervalMonths: { value: '12', unitId: 'months' },
  });
  assert.equal(targetRes.primaryResult.value, 173.5);
  assert.equal(targetRes.severity, 'normal');
  assert.ok(targetRes.secondaryResults?.some((r) => r.formattedValue === '5.5'));

  // 18. M-CHAT-R: default all pass = 0; reverse items m2=true (+1), m5=true (+1), m12=true (+1) + m6=false (+1) = 4 moderate
  const mchatInit = createInitialInputs(mchatRCalculator);
  const mchatLow = mchatRCalculator.calculate(mchatInit);
  assert.equal(mchatLow.primaryResult.value, 0);
  assert.equal(mchatLow.severity, 'normal');

  const mchatMod = mchatRCalculator.calculate({
    ...mchatInit,
    m2: true,  // +1 reverse
    m5: true,  // +1 reverse
    m12: true, // +1 reverse
    m6: false, // +1 normal
  });
  assert.equal(mchatMod.primaryResult.value, 4);
  assert.equal(mchatMod.severity, 'moderate');
});

test('Catalog: 195 deduplicated tools, cross-specialty tagging, and accent-insensitive search', () => {
  assert.equal(CALCULATOR_CATALOG.length, 195);

  const oncoCalcs = getCalculatorsBySpecialty('oncologia');
  assert.ok(oncoCalcs.some((c) => c.id === 'acr-tirads-thyroid'));
  assert.ok(oncoCalcs.some((c) => c.id === 'rads-imaging-interpreter'));
  assert.ok(oncoCalcs.some((c) => c.id === 'cervical-pap-asccp'));
  assert.ok(oncoCalcs.some((c) => c.id === 'ovarian-roma-rmi'));
  assert.ok(oncoCalcs.some((c) => c.id === 'oncology-ecog-karnofsky'));
  assert.ok(oncoCalcs.some((c) => c.id === 'mascc-febrile-neutropenia'));
  assert.ok(oncoCalcs.some((c) => c.id === 'calvert-carboplatin-auc'));
  assert.ok(oncoCalcs.some((c) => c.id === 'anc-ran'));
  assert.ok(oncoCalcs.some((c) => c.id === 'bsa-mosteller'));
  assert.ok(oncoCalcs.some((c) => c.id === 'psa-density'));

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
  assert.ok(idCalcs.some((c) => c.id === 'hiv-cdc-cd4-prophylaxis'));
  assert.ok(idCalcs.some((c) => c.id === 'hiv-pep-prep'));
  assert.ok(idCalcs.some((c) => c.id === 'hiv-opportunistic-art-timing'));

  const neuroCalcs = getCalculatorsBySpecialty('neurologia');
  assert.ok(neuroCalcs.some((c) => c.id === 'glasgow'));
  assert.ok(neuroCalcs.some((c) => c.id === 'four-score'));
  assert.ok(neuroCalcs.some((c) => c.id === 'nihss'));
  assert.ok(neuroCalcs.some((c) => c.id === 'ich-score'));
  assert.ok(neuroCalcs.some((c) => c.id === 'ichd3-migraine-headache'));
  assert.ok(neuroCalcs.some((c) => c.id === 'headache-red-flags-snnoop10'));
  assert.ok(neuroCalcs.some((c) => c.id === 'mrc-neurological-weakness'));
  assert.ok(neuroCalcs.some((c) => c.id === 'hints-plus-vertigo'));
  assert.ok(neuroCalcs.some((c) => c.id === 'vppb-dix-hallpike-epley'));

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
  assert.ok(pedCalcs.some((c) => c.id === 'pediatric-bp-aap'));
  assert.ok(pedCalcs.some((c) => c.id === 'target-height-velocity'));
  assert.ok(pedCalcs.some((c) => c.id === 'mchat-r'));

  const obgynCalcs = getCalculatorsBySpecialty('gineco-obstetricia');
  assert.ok(obgynCalcs.some((c) => c.id === 'gestational-age'));
  assert.ok(obgynCalcs.some((c) => c.id === 'bishop'));
  assert.ok(obgynCalcs.some((c) => c.id === 'apgar'));
  assert.ok(obgynCalcs.some((c) => c.id === 'obstetric-shock-index'));
  assert.ok(obgynCalcs.some((c) => c.id === 'obstetric-weight-gain'));
  assert.ok(obgynCalcs.some((c) => c.id === 'preeclampsia-hellp'));
  assert.ok(obgynCalcs.some((c) => c.id === 'gestational-diabetes'));
  assert.ok(obgynCalcs.some((c) => c.id === 'fetal-biophysical-profile'));
  assert.ok(obgynCalcs.some((c) => c.id === 'obstetric-sepsis-meows'));
  assert.ok(obgynCalcs.some((c) => c.id === 'menopause-mrs'));
  assert.ok(obgynCalcs.some((c) => c.id === 'pcos-rotterdam'));

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
  assert.ok(gastroCalcs.some((c) => c.id === 'masld-apri-nfs'));
  assert.ok(gastroCalcs.some((c) => c.id === 'rome-iv-bowel'));

  const pneumoCalcs = getCalculatorsBySpecialty('neumologia');
  assert.ok(pneumoCalcs.some((c) => c.id === 'copd-gold'));
  assert.ok(pneumoCalcs.some((c) => c.id === 'stop-bang'));
  assert.ok(pneumoCalcs.some((c) => c.id === 'asthma-act'));

  const traumaCalcs = getCalculatorsBySpecialty('traumatologia');
  assert.ok(traumaCalcs.some((c) => c.id === 'ottawa-ankle-knee'));
  assert.ok(traumaCalcs.some((c) => c.id === 'cervical-trauma'));
  assert.ok(traumaCalcs.some((c) => c.id === 'gustilo-anderson'));
  assert.ok(traumaCalcs.some((c) => c.id === 'mess-extremity'));

  const hemaCalcs = getCalculatorsBySpecialty('hematologia');
  assert.ok(hemaCalcs.some((c) => c.id === 'ganzoni-iron'));
  assert.ok(hemaCalcs.some((c) => c.id === 'mentzer-index'));
  assert.ok(hemaCalcs.some((c) => c.id === 'four-ts-hit'));
  assert.ok(hemaCalcs.some((c) => c.id === 'isth-dic'));
  assert.ok(hemaCalcs.some((c) => c.id === 'spesi-tep'));

  const uroCalcs = getCalculatorsBySpecialty('urologia');
  assert.ok(uroCalcs.some((c) => c.id === 'ipss-prostate'));
  assert.ok(uroCalcs.some((c) => c.id === 'twist-score'));
  assert.ok(uroCalcs.some((c) => c.id === 'stone-score'));
  assert.ok(uroCalcs.some((c) => c.id === 'psa-density'));
  assert.ok(!surgCalcs.some((c) => c.id === 'ipss-prostate'));

  const geriatricsCalcs = getCalculatorsBySpecialty('geriatria');
  assert.ok(geriatricsCalcs.some((c) => c.id === 'mini-cog'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'braden-scale'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'fall-risk'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'barthel-index'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'charlson-comorbidity'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'clinical-frailty-scale'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'lawton-brody'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'anticholinergic-acb'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'mna-sf'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'sarc-f'));
  assert.ok(geriatricsCalcs.some((c) => c.id === 'yesavage-gds15'));

  assert.ok(cardioCalcs.some((c) => c.id === 'score2-cvd'));
  assert.ok(endoCalcs.some((c) => c.id === 'dutch-lipid-clinic'));
  assert.ok(idCalcs.some((c) => c.id === 'acute-rhinosinusitis'));
  const imCalcs = getCalculatorsBySpecialty('medicina-interna');
  assert.ok(imCalcs.some((c) => c.id === 'osteoporosis-osta-who'));
  assert.ok(imCalcs.some((c) => c.id === 'fibromyalgia-acr-2016'));
  assert.ok(imCalcs.some((c) => c.id === 'das28-ra'));

  const dermCalcs = getCalculatorsBySpecialty('dermatologia');
  assert.ok(dermCalcs.some((c) => c.id === 'burns-parkland'));
  assert.ok(dermCalcs.some((c) => c.id === 'lrinec-score'));
  assert.ok(dermCalcs.some((c) => c.id === 'scorten-sjs-ten'));
  assert.ok(dermCalcs.some((c) => c.id === 'uas7-urticaria'));

  const nephroCalcs = getCalculatorsBySpecialty('nefrologia');
  assert.ok(nephroCalcs.some((c) => c.id === 'pediatric-schwartz'));
  assert.ok(nephroCalcs.some((c) => c.id === 'bicarbonate-deficit'));

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

  const byMigraine = searchCalculators('migrana');
  assert.ok(byMigraine.some((c) => c.id === 'ichd3-migraine-headache'));
  assert.ok(byMigraine.some((c) => c.id === 'headache-red-flags-snnoop10'));

  const byWeakness = searchCalculators('debilidad neurologica');
  assert.equal(byWeakness[0]?.id, 'mrc-neurological-weakness');

  // Specialty-scoped search strictly filters to tools inside the selected specialty
  const obgynPreeclampsia = searchCalculatorsInSpecialty('gineco-obstetricia', 'preeclampsia');
  assert.ok(obgynPreeclampsia.some((c) => c.id === 'preeclampsia-hellp'));
  assert.ok(obgynPreeclampsia.some((c) => c.id === 'obstetric-mgso4'));
  assert.equal(searchCalculatorsInSpecialty('gineco-obstetricia', 'heart').length, 0);
  assert.equal(searchCalculatorsInSpecialty('gineco-obstetricia', 'glasgow').length, 0);
  assert.equal(searchCalculatorsInSpecialty('gineco-obstetricia', 'psiquiatria').length, 0);
  assert.equal(searchCalculatorsInSpecialty('cardiologia', 'migrana').length, 0);
  assert.ok(
    searchCalculatorsInSpecialty('cardiologia', 'heart').some((c) => c.id === 'heart-score'),
  );
  assert.equal(
    searchCalculatorsInSpecialty('cardiologia', '').length,
    getCalculatorsBySpecialty('cardiologia').length,
  );

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

test('Logic Audit Regressions: unit-aware validation bounds, clinical dehydration grades, decimal boundaries & cross-field guards', () => {
  // 1. Unit-aware validation error messages must match field bounds in the active unit
  const cgWeightErrKg = validateCalculatorInputs(cockcroftGaultCalculator, {
    age: { value: '55', unitId: 'years' },
    weight: { value: '20', unitId: 'kg' },
    creatinine: { value: '1.0', unitId: 'mg_dl' },
    sex: 'male',
  });
  assert.equal(cgWeightErrKg.length, 1);
  assert.ok(cgWeightErrKg[0].message.includes('25 y 350 kg'), cgWeightErrKg[0].message);

  const cgWeightErrLb = validateCalculatorInputs(cockcroftGaultCalculator, {
    age: { value: '55', unitId: 'years' },
    weight: { value: '40', unitId: 'lb' },
    creatinine: { value: '1.0', unitId: 'mg_dl' },
    sex: 'male',
  });
  assert.equal(cgWeightErrLb.length, 1);
  const lbBoundsMatch = cgWeightErrLb[0].message.match(/entre ([\d.]+) y ([\d.]+) lb/);
  assert.ok(lbBoundsMatch, cgWeightErrLb[0].message);
  // Any value equal to printed min/max in lb must pass validation cleanly
  assert.equal(
    validateCalculatorInputs(cockcroftGaultCalculator, {
      age: { value: '55', unitId: 'years' },
      weight: { value: lbBoundsMatch[1], unitId: 'lb' },
      creatinine: { value: '1.0', unitId: 'mg_dl' },
      sex: 'male',
    }).length,
    0,
  );
  assert.equal(
    validateCalculatorInputs(cockcroftGaultCalculator, {
      age: { value: '55', unitId: 'years' },
      weight: { value: lbBoundsMatch[2], unitId: 'lb' },
      creatinine: { value: '1.0', unitId: 'mg_dl' },
      sex: 'male',
    }).length,
    0,
  );

  const obHeightErr = validateCalculatorInputs(obstetricWeightGainCalculator, {
    gestationalWeeks: { value: '28', unitId: 'weeks' },
    plurality: 'singleton',
    preWeight: { value: '60', unitId: 'kg' },
    height: { value: '100', unitId: 'cm' },
    currentWeight: { value: '68', unitId: 'kg' },
    fetalInputMode: 'none',
  });
  assert.equal(obHeightErr.length, 1);
  assert.ok(obHeightErr[0].message.includes('110 y 220 cm'), obHeightErr[0].message);

  const ldlTcErr = validateCalculatorInputs(ldlNonHdlCalculator, {
    tc: { value: '850', unitId: 'mg_dl' },
    hdl: { value: '45', unitId: 'mg_dl' },
    tg: { value: '150', unitId: 'mg_dl' },
  });
  assert.equal(ldlTcErr.length, 1);
  assert.ok(ldlTcErr[0].message.includes('40 y 800 mg/dL'), ldlTcErr[0].message);

  // 2. Pediatric Dehydration clinical mode respects clinicalGrade regardless of ageGroup %
  const infantMild = pediatricDehydrationCalculator.calculate({
    mode: 'clinical',
    ageGroup: 'infant',
    clinicalGrade: 'mild',
    currentWeight: { value: '10', unitId: 'kg' },
    bolusGiven: { value: '0', unitId: 'ml' },
  });
  assert.equal(infantMild.severity, 'low');
  assert.ok(infantMild.riskClassification.includes('leve'));

  const infantModerate = pediatricDehydrationCalculator.calculate({
    mode: 'clinical',
    ageGroup: 'infant',
    clinicalGrade: 'moderate',
    currentWeight: { value: '10', unitId: 'kg' },
    bolusGiven: { value: '0', unitId: 'ml' },
  });
  assert.equal(infantModerate.severity, 'moderate');
  assert.ok(infantModerate.riskClassification.includes('moderada'));

  const olderSevere = pediatricDehydrationCalculator.calculate({
    mode: 'clinical',
    ageGroup: 'older',
    clinicalGrade: 'severe',
    currentWeight: { value: '30', unitId: 'kg' },
    bolusGiven: { value: '0', unitId: 'ml' },
  });
  assert.equal(olderSevere.severity, 'critical');
  assert.ok(olderSevere.riskClassification.includes('grave'));

  // 3. APACHE II continuous decimal boundaries (no fall-through to 0 pts)
  const apacheDecimalPh = apacheIiCalculator.calculate({
    temp: { value: '40.95', unitId: 'c' }, // +3
    map: { value: '129.5', unitId: 'mmhg' }, // +2
    hr: { value: '80', unitId: 'bpm' }, // 0
    rr: { value: '16', unitId: 'rpm' }, // 0
    oxygenation: '0',
    acidBaseSource: 'ph',
    ph: { value: '7.695', unitId: 'ph' }, // +3
    sodium: { value: '140', unitId: 'meq_l' }, // 0
    potassium: { value: '5.95', unitId: 'meq_l' }, // +1
    creatinine: { value: '1.0', unitId: 'mg_dl' }, // 0
    acuteRenalFailure: false,
    hematocrit: { value: '59.95', unitId: 'pct' }, // +2
    wbc: { value: '39.95', unitId: 'k_ul' }, // +2
    gcs: { value: '15', unitId: 'pts' }, // 0
    age: { value: '30', unitId: 'years' }, // 0
    chronicHealth: '0',
  });
  assert.equal(apacheDecimalPh.primaryResult.value, 13);

  const apacheDecimalHco3 = apacheIiCalculator.calculate({
    temp: { value: '29.95', unitId: 'c' }, // +4
    map: { value: '85', unitId: 'mmhg' }, // 0
    hr: { value: '80', unitId: 'bpm' }, // 0
    rr: { value: '16', unitId: 'rpm' }, // 0
    oxygenation: '0',
    acidBaseSource: 'hco3',
    hco3: { value: '51.95', unitId: 'meq_l' }, // +3
    sodium: { value: '140', unitId: 'meq_l' }, // 0
    potassium: { value: '4.0', unitId: 'meq_l' }, // 0
    creatinine: { value: '1.0', unitId: 'mg_dl' }, // 0
    acuteRenalFailure: false,
    hematocrit: { value: '40', unitId: 'pct' }, // 0
    wbc: { value: '8', unitId: 'k_ul' }, // 0
    gcs: { value: '15', unitId: 'pts' }, // 0
    age: { value: '30', unitId: 'years' }, // 0
    chronicHealth: '0',
  });
  assert.equal(apacheDecimalHco3.primaryResult.value, 7);

  // 4. Obstetric SOS continuous decimal boundaries
  const sosDecimals = obstetricSepsisMeowsCalculator.calculate({
    temperature: { value: '31.95', unitId: 'c' }, // +3
    sbp: { value: '110', unitId: 'mmhg' }, // 0
    heartRate: { value: '90', unitId: 'bpm' }, // 0
    respiratoryRate: { value: '9.5', unitId: 'rpm' }, // +2
    spo2: { value: '98', unitId: 'pct' }, // 0
    wbc: { value: '2.95', unitId: 'k_ul' }, // +2
    immatureNeutrophilsPct: { value: '2', unitId: 'pct' }, // 0
    lactate: { value: '1.2', unitId: 'mmol_l' }, // 0
    neuroAltered: false,
    oliguria: false,
  });
  assert.equal(sosDecimals.primaryResult.value, 7);

  // 5. Framingham rejects HDL >= Total Cholesterol
  assert.throws(
    () =>
      framinghamCvdCalculator.calculate({
        age: { value: '50', unitId: 'years' },
        sex: 'male',
        totalChol: { value: '140', unitId: 'mg_dl' },
        hdlChol: { value: '145', unitId: 'mg_dl' },
        sbp: { value: '120', unitId: 'mmhg' },
        treatedBp: false,
        smoker: false,
        diabetes: false,
      }),
    /HDL/,
  );

  // 6. Target Height & Velocity notifies when only one height is entered
  const partialVelocity = targetHeightVelocityCalculator.calculate({
    sex: 'male',
    motherHeight: { value: '160', unitId: 'cm' },
    fatherHeight: { value: '174', unitId: 'cm' },
    prevHeight: { value: '110', unitId: 'cm' },
    currHeight: { value: '', unitId: 'cm' },
    intervalMonths: { value: '12', unitId: 'months' },
  });
  assert.equal(partialVelocity.primaryResult.value, 173.5);
  assert.ok(
    partialVelocity.secondaryResults?.some((r) => r.formattedValue === 'Pendiente'),
  );
});

test('HINTS / HINTS Plus: peripheral AVS, INFARCT central stroke alerts, AICA hearing loss & eligibility guards', () => {
  const peripheral = hintsPlusVertigoCalculator.calculate({
    avsStatus: 'eligible',
    headImpulse: 'abnormal_catchup',
    nystagmus: 'unidirectional_horizontal',
    testOfSkew: 'absent',
    acuteHearingLoss: 'absent',
  });
  assert.equal(peripheral.primaryResult.formattedValue, 'Periférico');
  assert.equal(peripheral.primaryResult.value, 0);
  assert.equal(peripheral.severity, 'low');

  const centralNormalHit = hintsPlusVertigoCalculator.calculate({
    avsStatus: 'eligible',
    headImpulse: 'normal_no_saccade',
    nystagmus: 'unidirectional_horizontal',
    testOfSkew: 'absent',
    acuteHearingLoss: 'absent',
  });
  assert.equal(centralNormalHit.primaryResult.formattedValue, 'CENTRAL (+)');
  assert.equal(centralNormalHit.primaryResult.value, 1);
  assert.equal(centralNormalHit.severity, 'critical');

  const hintsPlusAica = hintsPlusVertigoCalculator.calculate({
    avsStatus: 'eligible',
    headImpulse: 'abnormal_catchup',
    nystagmus: 'unidirectional_horizontal',
    testOfSkew: 'absent',
    acuteHearingLoss: 'present_acute',
  });
  assert.equal(hintsPlusAica.primaryResult.formattedValue, 'CENTRAL (+)');
  assert.equal(hintsPlusAica.severity, 'critical');
  assert.ok(hintsPlusAica.clinicalInterpretation.includes('AICA'));

  const notAvs = hintsPlusVertigoCalculator.calculate({
    avsStatus: 'episodic_no_nystagmus',
  });
  assert.equal(notAvs.primaryResult.formattedValue, 'No aplicable');
  assert.equal(notAvs.severity, 'info');

  const focalCns = hintsPlusVertigoCalculator.calculate({
    avsStatus: 'focal_cns',
  });
  assert.equal(focalCns.primaryResult.formattedValue, 'CENTRAL');
  assert.equal(focalCns.severity, 'critical');
});

test('VPPB (Dix-Hallpike / Roll Test): posterior Epley, horizontal geotropic/apogeotropic lateralization & central red flags', () => {
  const rightPost = vppbManipulationCalculator.calculate({
    centralFlags: false,
    maneuver: 'dix_hallpike_right',
    cervicalPrecaution: false,
  });
  assert.equal(rightPost.primaryResult.formattedValue, 'Epley Derecho');
  assert.equal(rightPost.severity, 'low');

  const horizGeo = vppbManipulationCalculator.calculate({
    centralFlags: false,
    maneuver: 'roll_geotropic',
    strongerSide: 'left',
    cervicalPrecaution: false,
  });
  assert.ok(horizGeo.primaryResult.formattedValue.includes('Izquierdo'));
  assert.equal(horizGeo.severity, 'low');

  // Apogeotropic horizontal BPPV: affected ear is opposite to the stronger nystagmus side
  const horizApogeo = vppbManipulationCalculator.calculate({
    centralFlags: false,
    maneuver: 'roll_apogeotropic',
    strongerSide: 'right',
    cervicalPrecaution: false,
  });
  assert.ok(horizApogeo.primaryResult.formattedValue.includes('Izquierdo'));
  assert.ok(horizApogeo.riskClassification.includes('Apogeotrópico'));

  const centralAlert = vppbManipulationCalculator.calculate({
    centralFlags: true,
  });
  assert.equal(centralAlert.primaryResult.formattedValue, 'CENTRAL / Atípico');
  assert.equal(centralAlert.severity, 'critical');
});

test('Clinical Reference Tables & Formula Verification: valid tables for outpatient/emergency settings and formula metadata for all 168 tools', () => {
  assert.ok(CLINICAL_REFERENCE_TABLES.length >= 16);
  const tableIds = new Set<string>();
  const specialtyIds = new Set(SPECIALTIES.map((s) => s.id));

  let hasOutpatient = false;
  let hasEmergency = false;

  for (const table of CLINICAL_REFERENCE_TABLES) {
    assert.ok(!tableIds.has(table.id), `ID de tabla duplicado: ${table.id}`);
    tableIds.add(table.id);
    assert.ok(specialtyIds.has(table.specialty), `Especialidad inválida en tabla: ${table.id}`);
    assert.ok(table.columns.length >= 3, `${table.id}: columnas insuficientes`);
    assert.ok(table.rows.length >= 3, `${table.id}: filas insuficientes`);
    for (const row of table.rows) {
      assert.equal(
        row.length,
        table.columns.length,
        `${table.id}: longitud de fila no coincide con columnas`,
      );
    }
    assert.ok(table.references.length > 0, `${table.id}: sin referencias`);
    if (table.setting === 'consulta-externa' || table.setting === 'ambos') hasOutpatient = true;
    if (table.setting === 'urgencias' || table.setting === 'ambos') hasEmergency = true;
  }

  assert.ok(hasOutpatient && hasEmergency);

  for (const calc of CALCULATOR_CATALOG) {
    const info = getCalculatorFormulaReference(calc);
    assert.ok(info.formulaUsed.trim().length > 0, `${calc.id}: formulaUsed vacío`);
    assert.ok(
      !info.formulaUsed.includes('evaluación clínica estructurada sobre'),
      `${calc.id}: cayó en fallback de fórmula (${info.formulaUsed})`,
    );
    assert.equal(
      info.variables.length,
      calc.fields.length,
      `${calc.id}: número de variables en referencia no coincide`,
    );
  }
});

test('Medical Safety & Iatrogenesis Prevention Audit: edge cases across emergency, OB/Gyn, pediatrics & internal medicine', () => {
  // 1. Anaphylaxis Adrenaline: prepubertal 40 kg capped at 0.30 mg vs adult 60 kg capped at 0.50 mg
  const anaphPed = anaphylaxisAdrenalineCalculator.calculate({
    patientGroup: 'pediatric',
    weight: { value: '40', unitId: 'kg' },
    criterion1: true,
    criterion2: false,
    criterion3: false,
  });
  assert.equal(anaphPed.primaryResult.value, 0.3);
  assert.equal(anaphPed.severity, 'critical');

  // 2. Inpatient Basal-Bolus: frail 45 kg sensitive patient avoids forced +1/+2/+3 U floor & normoglycemia warns against empirical start
  const frailInsulin = inpatientBasalBolusCalculator.calculate({
    weight: { value: '45', unitId: 'kg' },
    glucose: { value: '122', unitId: 'mg_dl' },
    clinicalProfile: 'very_sensitive',
    oralIntake: 'eating',
  });
  assert.ok(frailInsulin.riskClassification.includes('Normoglucemia'));
  assert.ok(frailInsulin.guidance?.some((g) => g.includes('NO iniciar')));
  const fsiNote = frailInsulin.secondaryResults?.find((r) => r.label.includes('sensibilidad'))?.note ?? '';
  assert.ok(fsiNote.includes('Sensibilidad alta'));
  assert.ok(!fsiNote.includes('+3 U (>280)'));

  // 3. Burns Parkland: late arrival at 7.5 h triggers fluid-overload / fluid-creep warning
  const lateBurn = burnsWallaceParklandCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    hoursElapsed: { value: '7.5', unitId: 'h' },
    head: '0',
    antTrunk: '18',
    postTrunk: '9',
    rightArm: '0',
    leftArm: '0',
    rightLeg: '0',
    leftLeg: '0',
    perineum: '0',
  });
  assert.ok(lateBurn.guidance?.some((g) => g.includes('SOBRECARGA HÍDRICA')));

  // 4. Infusion Calculator: extreme pump rate (> 250 mL/h or < 0.5 mL/h) triggers high-severity verification alert
  const extremeInfusion = infusionCalculator.calculate({
    direction: 'dose_to_rate',
    doseUnit: 'mcg_kg_min',
    drugAmountMg: { value: '200', unitId: 'mcg' }, // 200 mcg vs 200 mg mismatch -> 525 mL/h!
    volumeMl: { value: '250', unitId: 'ml' },
    weight: { value: '70', unitId: 'kg' },
    desiredDose: { value: '0.1', unitId: 'dose' },
    pumpRate: { value: '', unitId: 'ml_h' },
  });
  assert.equal(extremeInfusion.severity, 'high');
  assert.ok(extremeInfusion.guidance?.some((g) => g.includes('DOBLE VERIFICACIÓN')));

  // 5. Hyperglycemic Crises: mixed DKA + vomiting alkalosis (pH 7.36, HCO3 22, positive ketones, gluc 650) is NOT treated as pure HHS
  const mixedAlkalosis = hyperglycemicCrisesCalculator.calculate({
    weight: { value: '70', unitId: 'kg' },
    glucose: { value: '650', unitId: 'mg_dl' },
    priorDiabetes: true,
    ph: { value: '7.36', unitId: 'ph' },
    hco3: { value: '22', unitId: 'meq_l' },
    ketones: 'positive',
    sodium: { value: '132', unitId: 'meq_l' },
    potassium: { value: '4.1', unitId: 'meq_l' },
    mentalStatus: 'alert',
  });
  assert.equal(mixedAlkalosis.primaryResult.value, 7); // 0.1 U/kg/h, NOT 0.05 U/kg/h
  assert.equal(mixedAlkalosis.severity, 'critical');
  assert.ok(mixedAlkalosis.riskClassification.includes('Mixto'));
  assert.ok(mixedAlkalosis.guidance?.some((g) => g.includes('vía periférica')));

  // 6. Hypertension: target-organ damage with BP 148/94 (< 160/100) still escalates to critical urgent evaluation
  const htnTodModerateBp = hypertensionClassificationCalculator.calculate({
    sbp: { value: '148', unitId: 'mmhg' },
    dbp: { value: '94', unitId: 'mmhg' },
    targetOrganSymptoms: true,
  });
  assert.equal(htnTodModerateBp.severity, 'critical');
  assert.ok(htnTodModerateBp.riskClassification.includes('DAÑO AGUDO A ÓRGANO DIANA'));

  // 7. Oxygenation: impossible PaO2 = 220 mmHg at FiO2 = 21% throws FiO2 verification error
  assert.throws(() => {
    oxygenationPafiSafiAaCalculator.calculate({
      pao2: { value: '220', unitId: 'mmhg' },
      fio2: { value: '21', unitId: 'percent' },
      paco2: { value: '40', unitId: 'mmhg' },
      age: { value: '45', unitId: 'years' },
      spo2: { value: '', unitId: 'pct' },
      patm: { value: '760', unitId: 'mmhg' },
    });
  }, /Inconsistencia fisiológica/);

  // 8. Ganzoni Iron Deficit: Hb >= target warns against empirical IV iron without ferritin confirmation
  const ganzNoHbDeficit = ganzoniIronDeficitCalculator.calculate({
    weight: { value: '65', unitId: 'kg' },
    hbActual: { value: '14.2', unitId: 'g_dl' },
    hbTarget: { value: '13.5', unitId: 'g_dl' },
    storesMode: 'standard',
  });
  assert.ok(ganzNoHbDeficit.riskClassification.includes('Hb en meta'));
  assert.ok(ganzNoHbDeficit.clinicalInterpretation.includes('ferritina'));

  // 9. PSA Density: 0.149 displays as 0.149 (3 decimals) under < 0.150 tier
  const psadBorderline = psaDensityCalculator.calculate({
    totalPsa: { value: '5.96', unitId: 'ng_ml' },
    prostateVolume: { value: '40', unitId: 'cm3' },
    freePsa: { value: '', unitId: 'ng_ml' },
  });
  assert.equal(psadBorderline.primaryResult.value, 0.149);
  assert.equal(psadBorderline.primaryResult.formattedValue, '0.149');
  assert.equal(psadBorderline.severity, 'moderate');

  // 10. Preeclampsia/HELLP: normotensive pregnant patient with pulmonary edema or plt 70 escalates (never normal)
  const normotensiveOrganPe = preeclampsiaHellpCalculator.calculate({
    gestationalContext: 'ge20_new',
    sbp: { value: '126', unitId: 'mmhg' },
    dbp: { value: '78', unitId: 'mmhg' },
    proteinuria: 'negative',
    platelets: { value: '185', unitId: 'k_ul' },
    astAltMax: { value: '30', unitId: 'ul' },
    ldh: { value: '240', unitId: 'ul' },
    creatinine: { value: '0.7', unitId: 'mg_dl' },
    creatinineDoubled: false,
    hemolysisEvidence: false,
    neuroVisualSymptoms: false,
    epigastricPain: false,
    pulmonaryEdema: true,
    eclampsiaSeizures: false,
  });
  assert.equal(normotensiveOrganPe.severity, 'high');
  assert.equal(normotensiveOrganPe.primaryResult.formattedValue, 'Disfunción Orgánica');

  // 11. Gestational Diabetes: Carpenter-Coustan 100 g with fasting >= 126 gives overt diabetes guidance even if only 1 value elevated
  const ccOvert = gestationalDiabetesCalculator.calculate({
    protocol: 'carpenter_coustan_100g',
    fastingGlucose: { value: '134', unitId: 'mg_dl' },
    glucose1h: { value: '165', unitId: 'mg_dl' },
    glucose2h: { value: '138', unitId: 'mg_dl' },
    glucose3h: { value: '115', unitId: 'mg_dl' },
  });
  assert.equal(ccOvert.primaryResult.formattedValue, 'DM Manifiesta');
  assert.equal(ccOvert.severity, 'high');
  assert.ok(ccOvert.clinicalInterpretation.includes('diabetes manifiesta'));
  assert.ok(ccOvert.guidance?.some((g) => g.includes('HbA1c')));

  // 12. Pediatric Dehydration: weight loss < 3% yields 0 mL deficit and normal severity
  const noDeh = pediatricDehydrationCalculator.calculate({
    mode: 'weight_loss',
    ageGroup: 'infant',
    clinicalGrade: 'mild',
    currentWeight: { value: '9.9', unitId: 'kg' },
    previousWeight: { value: '10.0', unitId: 'kg' },
    bolusGiven: { value: '0', unitId: 'ml' },
  });
  assert.equal(noDeh.primaryResult.value, 0);
  assert.equal(noDeh.severity, 'normal');

  // 13. Acute Diarrhea Plan C in adult >= 50 kg / >= 15 years warns about cardiorenal fluid overload
  const adultPlanC = acuteDiarrheaPlanCalculator.calculate({
    ageMonths: { value: '420', unitId: 'months' },
    weight: { value: '75', unitId: 'kg' },
    generalState: 'lethargic',
    eyes: 'deeply_sunken',
    thirst: 'poor',
    skinPinch: 'very_slow',
    mucousMembranes: 'dry',
    tears: 'absent',
    stoolType: 'watery',
    persistentVomiting: true,
    highFeverSepsis: false,
    severeMalnutrition: false,
  });
  assert.equal(adultPlanC.primaryResult.formattedValue, 'Plan C');
  assert.ok(adultPlanC.guidance?.some((g) => g.includes('ADOLESCENTES/ADULTOS')));

  // 14. Wood-Downes-Ferres boundary labels are continuous
  const rrOpts = woodDownesFerresCalculator.fields.find((f) => f.id === 'respRate');
  const hrOpts = woodDownesFerresCalculator.fields.find((f) => f.id === 'heartRate');
  assert.ok(rrOpts?.type === 'select' && rrOpts.options[0].label.includes('≤ 30'));
  assert.ok(hrOpts?.type === 'select' && hrOpts.options[0].label.includes('≤ 120'));
});

test('Nursing IV Drip/Microdrip & Drug Dilution (Rule of Three): exact drop rates, duration, dilutions & safety alerts', () => {
  // 1. Macrodrip 20 gts/mL: 1000 mL over 8 hours = 125 mL/h = 41.67 -> 42 drops/min
  const macro = dripRateIvCalculator.calculate({
    mode: 'vol_time_to_drops',
    dropFactor: '20',
    volumeMl: { value: '1000', unitId: 'ml' },
    infusionTime: { value: '8', unitId: 'h' },
  });
  assert.equal(macro.primaryResult.value, 42);
  assert.equal(macro.primaryResult.unit, 'gotas/min');
  assert.equal(macro.severity, 'info');

  // 2. Microdrip 60 mcgts/mL: 250 mL over 5 hours = 50 mL/h = 50 microdrops/min
  const micro = dripRateIvCalculator.calculate({
    mode: 'vol_time_to_drops',
    dropFactor: '60',
    volumeMl: { value: '250', unitId: 'ml' },
    infusionTime: { value: '5', unitId: 'h' },
  });
  assert.equal(micro.primaryResult.value, 50);
  assert.equal(micro.primaryResult.unit, 'microgotas/min');

  // 3. Drops to time: 500 mL at 25 drops/min (20 gts/mL) = 400 min = 6 h 40 min
  const duration = dripRateIvCalculator.calculate({
    mode: 'drops_to_time',
    dropFactor: '20',
    volumeMl: { value: '500', unitId: 'ml' },
    dropsPerMin: { value: '25', unitId: 'gts_min' },
  });
  assert.equal(duration.primaryResult.formattedValue, '6 h 40 min');
  assert.equal(duration.primaryResult.value, 6.67);

  // 4. Slow macrodrip (< 5 drops/min) triggers moderate microdrip/pump recommendation
  const slowDrip = dripRateIvCalculator.calculate({
    mode: 'rate_to_drops',
    dropFactor: '20',
    pumpRateMlH: { value: '10', unitId: 'ml_h' },
  });
  assert.equal(slowDrip.primaryResult.value, 3);
  assert.equal(slowDrip.severity, 'moderate');

  // 5. Rule of three (mass): 750 mg from 1 g in 10 mL -> 7.5 mL, diluted to 100 mL
  const massDilution = nursingDilutionCalculator.calculate({
    unitFamily: 'mass',
    prescribedMass: { value: '750', unitId: 'mg' },
    vialAmountMass: { value: '1', unitId: 'g' },
    vialVolumeMl: { value: '10', unitId: 'ml' },
    finalDilutionMl: { value: '100', unitId: 'ml' },
  });
  assert.equal(massDilution.primaryResult.value, 7.5);
  assert.equal(massDilution.primaryResult.formattedValue, '7.50');
  assert.ok(massDilution.secondaryResults?.some((r) => r.label.includes('Diluyente adicional') && r.formattedValue === '92.5'));

  // 6. Rule of three (UI): 5000 UI from 25000 UI in 5 mL -> 1.00 mL
  const uiDilution = nursingDilutionCalculator.calculate({
    unitFamily: 'iu',
    prescribedIu: { value: '5000', unitId: 'ui' },
    vialAmountIu: { value: '25000', unitId: 'ui' },
    vialVolumeMl: { value: '5', unitId: 'ml' },
    finalDilutionMl: { value: '', unitId: 'ml' },
  });
  assert.equal(uiDilution.primaryResult.value, 1);

  // 7. Tiny draw volume (< 0.1 mL) raises high precision alert
  const tinyDraw = nursingDilutionCalculator.calculate({
    unitFamily: 'mass',
    prescribedMass: { value: '0.2', unitId: 'mg' },
    vialAmountMass: { value: '10', unitId: 'mg' },
    vialVolumeMl: { value: '2', unitId: 'ml' },
    finalDilutionMl: { value: '', unitId: 'ml' },
  });
  assert.equal(tinyDraw.primaryResult.value, 0.04);
  assert.equal(tinyDraw.severity, 'high');

  // 8. Final dilution smaller than draw volume throws clear error
  assert.throws(
    () =>
      nursingDilutionCalculator.calculate({
        unitFamily: 'mass',
        prescribedMass: { value: '500', unitId: 'mg' },
        vialAmountMass: { value: '500', unitId: 'mg' },
        vialVolumeMl: { value: '10', unitId: 'ml' },
        finalDilutionMl: { value: '5', unitId: 'ml' },
      }),
    /no puede ser menor que el volumen a cargar/,
  );
});

test('Oncology & Gyneco-Oncology: ACR TI-RADS, RADS systems, abnormal Pap/ASCCP, RMI/ROMA, ECOG, MASCC, Calvert AUC & tables', () => {
  // 1. ACR TI-RADS: spongiform nodule forces TR1 (0 pts) regardless of size; solid+hypoechoic+taller+punctate = 2+2+3+3 = 10 (TR5) >= 10mm -> FNA
  const spongiformTr1 = acrTiradsCalculator.calculate({
    composition: 'spongiform',
    echogenicity: 'hypoechoic',
    shape: 'wider',
    margin: 'smooth',
    fociMacro: false,
    fociRim: false,
    fociPunctate: true,
    noduleSizeMm: { value: '32', unitId: 'mm' },
  });
  assert.equal(spongiformTr1.primaryResult.value, 0);
  assert.ok(spongiformTr1.primaryResult.formattedValue.startsWith('TR1'));
  assert.equal(spongiformTr1.severity, 'normal');

  const tr5Fna = acrTiradsCalculator.calculate({
    composition: 'solid',
    echogenicity: 'hypoechoic',
    shape: 'taller',
    margin: 'smooth',
    fociMacro: false,
    fociRim: false,
    fociPunctate: true,
    noduleSizeMm: { value: '12', unitId: 'mm' },
  });
  assert.equal(tr5Fna.primaryResult.value, 10);
  assert.ok(tr5Fna.primaryResult.formattedValue.startsWith('TR5'));
  assert.equal(tr5Fna.severity, 'critical');
  assert.ok(tr5Fna.clinicalInterpretation.includes('PAAF'));

  const tr4Follow = acrTiradsCalculator.calculate({
    composition: 'solid',
    echogenicity: 'hypoechoic',
    shape: 'wider',
    margin: 'smooth',
    fociMacro: false,
    fociRim: false,
    fociPunctate: false,
    noduleSizeMm: { value: '1.2', unitId: 'cm' }, // 12 mm -> 4 pts TR4 follow-up
  });
  assert.equal(tr4Follow.primaryResult.value, 4);
  assert.ok(tr4Follow.primaryResult.formattedValue.startsWith('TR4'));
  assert.equal(tr4Follow.severity, 'moderate');

  // 2. RADS Interpreter: BI-RADS 5, O-RADS 4, LI-RADS LR-5
  const birads5 = radsInterpreterCalculator.calculate({
    ...createInitialInputs(radsInterpreterCalculator),
    radsSystem: 'birads',
    biradsCat: '5',
  });
  assert.equal(birads5.primaryResult.formattedValue, 'BI-RADS 5');
  assert.equal(birads5.severity, 'critical');

  const orads4 = radsInterpreterCalculator.calculate({
    ...createInitialInputs(radsInterpreterCalculator),
    radsSystem: 'orads',
    oradsCat: '4',
  });
  assert.equal(orads4.primaryResult.formattedValue, 'O-RADS 4');
  assert.equal(orads4.severity, 'high');

  const lirads5 = radsInterpreterCalculator.calculate({
    ...createInitialInputs(radsInterpreterCalculator),
    radsSystem: 'lirads',
    liradsCat: 'LR-5',
  });
  assert.equal(lirads5.primaryResult.formattedValue, 'LI-RADS 5');
  assert.equal(lirads5.severity, 'critical');

  // 3. Abnormal PAP (Bethesda + HPV + Pregnancy guard)
  const agcPregnant = cervicalPapBethesdaCalculator.calculate({
    ageGroup: '30_65',
    cytology: 'agc',
    hpvStatus: 'unknown',
    isPregnant: true,
    immunosuppressed: false,
  });
  assert.equal(agcPregnant.severity, 'critical');
  assert.ok(agcPregnant.guidance?.some((g) => g.includes('CONTRAINDICADO el legrado endocervical')));

  const lsilYoung = cervicalPapBethesdaCalculator.calculate({
    ageGroup: 'lt25',
    cytology: 'lsil',
    hpvStatus: 'other_hr',
    isPregnant: false,
    immunosuppressed: false,
  });
  assert.ok(lsilYoung.primaryResult.formattedValue.includes('12 meses'));
  assert.equal(lsilYoung.severity, 'moderate');

  const nilmHpv16 = cervicalPapBethesdaCalculator.calculate({
    ageGroup: '30_65',
    cytology: 'nilm',
    hpvStatus: 'hpv16_18',
    isPregnant: false,
    immunosuppressed: false,
  });
  assert.ok(nilmHpv16.primaryResult.formattedValue.includes('Colposcopia'));
  assert.equal(nilmHpv16.severity, 'high');

  // 4. Ovarian RMI I & ROMA
  const rmiHigh = ovarianRmiRomaCalculator.calculate({
    mode: 'rmi',
    menopausalStatus: 'post',
    ultrasoundFeatures: '3',
    ca125: { value: '50', unitId: 'u_ml' },
    he4: { value: '95', unitId: 'pmol_l' },
  });
  // 3 * 3 * 50 = 450 >= 200
  assert.equal(rmiHigh.primaryResult.value, 450);
  assert.equal(rmiHigh.severity, 'critical');

  const romaPost = ovarianRmiRomaCalculator.calculate({
    mode: 'roma',
    menopausalStatus: 'post',
    ultrasoundFeatures: '3',
    ca125: { value: '120', unitId: 'u_ml' },
    he4: { value: '210', unitId: 'pmol_l' },
  });
  assert.ok(romaPost.primaryResult.value > 50);
  assert.equal(romaPost.severity, 'high');

  // 5. ECOG / Karnofsky
  const ecog3 = ecogKarnofskyCalculator.calculate({ ecogGrade: '3' });
  assert.equal(ecog3.primaryResult.formattedValue, 'ECOG 3');
  assert.equal(ecog3.severity, 'high');
  assert.ok(ecog3.secondaryResults?.some((r) => r.formattedValue.includes('40 %')));

  // 6. MASCC Febrile Neutropenia: max = 26 (low risk) vs < 21 (high risk)
  const masccLow = masccFebrileNeutropeniaCalculator.calculate(
    createInitialInputs(masccFebrileNeutropeniaCalculator),
  );
  assert.equal(masccLow.primaryResult.value, 26);
  assert.equal(masccLow.severity, 'moderate');

  const masccHigh = masccFebrileNeutropeniaCalculator.calculate({
    diseaseBurden: 'moderate', // 3
    noHypotension: false,     // 0
    noCopd: true,             // 4
    solidOrNoFungal: true,    // 4
    noDehydration: false,     // 0
    outpatientOnset: true,    // 3
    ageUnder60: false,        // 0 => 14 < 21
  });
  assert.equal(masccHigh.primaryResult.value, 14);
  assert.equal(masccHigh.severity, 'critical');

  // 7. Calvert Carboplatin AUC: GFR 85, AUC 5 -> 5*(85+25) = 550 mg; GFR 160 capped at 125 -> 5*(125+25) = 750 mg
  const calvertStd = calvertCarboplatinCalculator.calculate({
    targetAuc: { value: '5', unitId: 'auc' },
    gfr: { value: '85', unitId: 'ml_min' },
  });
  assert.equal(calvertStd.primaryResult.value, 550);

  const calvertCapped = calvertCarboplatinCalculator.calculate({
    targetAuc: { value: '5', unitId: 'auc' },
    gfr: { value: '160', unitId: 'ml_min' },
  });
  assert.equal(calvertCapped.primaryResult.value, 750);
  assert.equal(calvertCapped.severity, 'high');
  assert.ok(calvertCapped.clinicalInterpretation.includes('125 mL/min'));

  // 8. Reference tables include all 4 Oncology & Gyneco-Oncology tables
  const oncoTables = CLINICAL_REFERENCE_TABLES.filter(
    (t) => t.specialty === 'oncologia' || t.secondarySpecialties?.includes('oncologia'),
  );
  assert.ok(oncoTables.some((t) => t.id === 'rads-classifications-table'));
  assert.ok(oncoTables.some((t) => t.id === 'cervical-pap-asccp-table'));
  assert.ok(oncoTables.some((t) => t.id === 'gynecologic-oncology-figo-screening-table'));
  assert.ok(oncoTables.some((t) => t.id === 'oncologic-emergencies-table'));
});

test('HIV/AIDS (VIH/SIDA): CDC staging & OI prophylaxis, PEP/PrEP, ART timing/IRIS & reference tables', () => {
  // 1. CDC Stage 3 with CD4 45 -> critical, PCP + Toxo + CrAg + MAC/CMV guidance
  const stage3Low = hivCdcCd4ProphylaxisCalculator.calculate({
    cd4Count: { value: '45', unitId: 'cells_ul' },
    cd4Percent: { value: '', unitId: 'pct' },
    hasStage3Oi: false,
    sulfaAllergy: false,
    isPregnant: false,
  });
  assert.equal(stage3Low.primaryResult.value, 3);
  assert.equal(stage3Low.severity, 'critical');
  assert.ok(stage3Low.guidance?.some((g) => g.includes('TMP-SMX 160/800')));
  assert.ok(stage3Low.guidance?.some((g) => g.includes('CrAg')));
  assert.ok(stage3Low.guidance?.some((g) => g.includes('MAC')));

  // Stage 3 due to defining OI even if CD4 350; sulfa allergy triggers Dapsona/Atovacuona
  const stage3Oi = hivCdcCd4ProphylaxisCalculator.calculate({
    cd4Count: { value: '180', unitId: 'cells_ul' },
    cd4Percent: { value: '', unitId: 'pct' },
    hasStage3Oi: true,
    sulfaAllergy: true,
    isPregnant: true,
  });
  assert.equal(stage3Oi.primaryResult.value, 3);
  assert.ok(stage3Oi.guidance?.some((g) => g.includes('Dapsona')));
  assert.ok(stage3Oi.guidance?.some((g) => g.includes('EMBARAZO')));

  // 2. PEP <= 72h vs > 72h vs U=U vs PrEP
  const pepUrgent = hivPepPrepCalculator.calculate({
    mode: 'pep',
    hoursSinceExposure: { value: '18', unitId: 'h' },
    exposureRisk: 'high',
    prepProfile: 'daily_general',
    prepHivNegConfirmed: true,
    renalCrCl: { value: '95', unitId: 'ml_min' },
  });
  assert.equal(pepUrgent.primaryResult.formattedValue, 'INICIAR PEP URGENTE');
  assert.equal(pepUrgent.severity, 'critical');

  const pepExpired = hivPepPrepCalculator.calculate({
    mode: 'pep',
    hoursSinceExposure: { value: '80', unitId: 'h' },
    exposureRisk: 'high',
    prepProfile: 'daily_general',
    prepHivNegConfirmed: true,
    renalCrCl: { value: '95', unitId: 'ml_min' },
  });
  assert.ok(pepExpired.primaryResult.formattedValue.includes('> 72 h'));

  const pepUu = hivPepPrepCalculator.calculate({
    mode: 'pep',
    hoursSinceExposure: { value: '6', unitId: 'h' },
    exposureRisk: 'u_equals_u',
    prepProfile: 'daily_general',
    prepHivNegConfirmed: true,
    renalCrCl: { value: '95', unitId: 'ml_min' },
  });
  assert.equal(pepUu.primaryResult.formattedValue, 'NO indicada PEP');
  assert.equal(pepUu.severity, 'normal');

  const prepBlocked = hivPepPrepCalculator.calculate({
    mode: 'prep',
    hoursSinceExposure: { value: '12', unitId: 'h' },
    exposureRisk: 'high',
    prepProfile: 'daily_general',
    prepHivNegConfirmed: false,
    renalCrCl: { value: '95', unitId: 'ml_min' },
  });
  assert.ok(prepBlocked.primaryResult.formattedValue.includes('DIFERIR PrEP'));
  assert.equal(prepBlocked.severity, 'critical');

  // 3. ART Timing & IRIS: Cryptococcal meningitis defers 4-6 weeks; TB non-meningeal CD4 < 50 <= 2 weeks + DTG 50 mg c/12 h
  const cryptoTiming = hivOpportunisticArtTimingCalculator.calculate({
    clinicalScenario: 'cryptococcal_meningitis',
    onRifampin: false,
  });
  assert.ok(cryptoTiming.primaryResult.formattedValue.includes('4–6 semanas'));
  assert.equal(cryptoTiming.severity, 'critical');

  const tbLowCd4 = hivOpportunisticArtTimingCalculator.calculate({
    clinicalScenario: 'tb_pulmonary_low_cd4',
    onRifampin: true,
  });
  assert.ok(tbLowCd4.primaryResult.formattedValue.includes('≤ 2 semanas'));
  assert.ok(tbLowCd4.guidance?.some((g) => g.includes('50 mg cada 12 horas')));

  // 4. All 4 HIV/AIDS clinical reference tables present
  const hivTableIds = [
    'hiv-diagnosis-cdc-staging-table',
    'hiv-art-regimens-interactions-table',
    'hiv-opportunistic-infections-table',
    'hiv-pep-prep-prevention-table',
  ];
  for (const id of hivTableIds) {
    assert.ok(
      CLINICAL_REFERENCE_TABLES.some((t) => t.id === id),
      `Falta tabla clínica de VIH/SIDA: ${id}`,
    );
  }
});

test('MINSA Nicaragua Immunization, Broselow PALS, AAP 2022 Phototherapy/Exchange & Daily Drug Converters', () => {
  // 1. MINSA Nicaragua Immunization: RN < 2000 g defers BCG; 2m > 15 sem alerts Rotavirus; dirty wound <3 doses -> dT + TIG; Cat III rabies -> RIG
  const rnLowWeight = immunizationMinsaNicaraguaCalculator.calculate({
    ...createInitialInputs(immunizationMinsaNicaraguaCalculator),
    mode: 'esquema_edad',
    ageGroup: 'rn',
    newbornWeightG: { value: '1850', unitId: 'g' },
  });
  assert.ok(rnLowWeight.primaryResult.formattedValue.includes('DIFERIR BCG'));
  assert.equal(rnLowWeight.severity, 'high');

  const rotaLate = immunizationMinsaNicaraguaCalculator.calculate({
    ...createInitialInputs(immunizationMinsaNicaraguaCalculator),
    mode: 'esquema_edad',
    ageGroup: '2_meses',
    infantAgeWeeks: { value: '17', unitId: 'sem' },
  });
  assert.ok(rotaLate.guidance?.some((g) => g.includes('ALERTA ROTAVIRUS')));

  const tetanusDirty = immunizationMinsaNicaraguaCalculator.calculate({
    ...createInitialInputs(immunizationMinsaNicaraguaCalculator),
    mode: 'tetanos_herida',
    woundType: 'dirty',
    tetanusDoses: 'unknown_lt3',
  });
  assert.ok(tetanusDirty.primaryResult.formattedValue.includes('TIG'));
  assert.equal(tetanusDirty.severity, 'critical');

  const rabiesCat3 = immunizationMinsaNicaraguaCalculator.calculate({
    ...createInitialInputs(immunizationMinsaNicaraguaCalculator),
    mode: 'rabia_exposicion',
    rabiesCategory: 'cat3',
    animalStatus: 'unobservable',
    priorRabiesPrep: false,
  });
  assert.ok(rabiesCat3.primaryResult.formattedValue.includes('RIG'));
  assert.equal(rabiesCat3.severity, 'critical');

  // 2. Broselow Pediatric Resuscitation: 88 cm -> Amarillo (13 kg), 26 -> 52 J, 1.3 mL Epi 1:10,000
  const broselowYellow = pediatricBroselowResuscitationCalculator.calculate({
    ...createInitialInputs(pediatricBroselowResuscitationCalculator),
    method: 'by_length',
    lengthCm: { value: '88', unitId: 'cm' },
  });
  assert.ok(broselowYellow.primaryResult.formattedValue.includes('Amarillo'));
  assert.equal(broselowYellow.primaryResult.value, 13);
  assert.ok(broselowYellow.secondaryResults?.some((r) => r.formattedValue.includes('4.0 mm')));
  assert.ok(broselowYellow.secondaryResults?.some((r) => r.formattedValue.includes('1.3 mL')));

  // 3. AAP 2022 Neonatal Hyperbilirubinemia: 38w @ 48h
  // No risk: photo = 16.0, exchange = 24.0 (escalation >= 22.0)
  // With risk: photo = 14.0, exchange = 20.1 (escalation >= 18.1)
  const photoYes = neonatalPhototherapyExchangeAap2022Calculator.calculate({
    gestationalAgeWeeks: '38',
    hoursOfLife: { value: '48', unitId: 'h' },
    tsb: { value: '19.0', unitId: 'mg_dl' },
    albumin: { value: '3.5', unitId: 'g_dl' },
    hasNeuroRiskFactors: false,
    hasAbeSigns: false,
  });
  assert.ok(photoYes.riskClassification.includes('FOTOTERAPIA INDICADA'));

  const escalationNoRisk = neonatalPhototherapyExchangeAap2022Calculator.calculate({
    gestationalAgeWeeks: '38',
    hoursOfLife: { value: '48', unitId: 'h' },
    tsb: { value: '22.5', unitId: 'mg_dl' },
    albumin: { value: '3.5', unitId: 'g_dl' },
    hasNeuroRiskFactors: false,
    hasAbeSigns: false,
  });
  assert.ok(escalationNoRisk.riskClassification.includes('ESCALADA DE CUIDADOS'));
  assert.equal(escalationNoRisk.severity, 'critical');

  const escalationWithRisk = neonatalPhototherapyExchangeAap2022Calculator.calculate({
    gestationalAgeWeeks: '38',
    hoursOfLife: { value: '48', unitId: 'h' },
    tsb: { value: '19.0', unitId: 'mg_dl' },
    albumin: { value: '3.5', unitId: 'g_dl' },
    hasNeuroRiskFactors: true,
    hasAbeSigns: false,
  });
  assert.ok(escalationWithRisk.riskClassification.includes('ESCALADA DE CUIDADOS'));
  assert.equal(escalationWithRisk.severity, 'critical');

  const abeEmergency = neonatalPhototherapyExchangeAap2022Calculator.calculate({
    gestationalAgeWeeks: '38',
    hoursOfLife: { value: '48', unitId: 'h' },
    tsb: { value: '14.0', unitId: 'mg_dl' },
    albumin: { value: '', unitId: 'g_dl' },
    hasNeuroRiskFactors: false,
    hasAbeSigns: true,
  });
  assert.ok(abeEmergency.riskClassification.includes('EXANGUINOTRANSFUSIÓN INMEDIATA'));

  // 4. Daily Drug Converters: 40 mg Prednisone -> 6 mg Dexamethasone; 200 mg Tramadol -> 40 MME (CDC 2022 0.2) -> 28 mg Morphine (-30%)
  const steroidConv = dailyDrugConvertersCalculator.calculate({
    ...createInitialInputs(dailyDrugConvertersCalculator),
    converterMode: 'corticoides',
    sourceSteroid: 'prednisone',
    targetSteroid: 'dexamethasone',
    steroidDoseMg: { value: '40', unitId: 'mg' },
  });
  assert.equal(steroidConv.primaryResult.value, 6);

  const opioidConv = dailyDrugConvertersCalculator.calculate({
    ...createInitialInputs(dailyDrugConvertersCalculator),
    converterMode: 'opioides',
    sourceOpioid: 'tramadol_po',
    opioidDailyDoseMg: { value: '200', unitId: 'mg_d' },
    targetOpioid: 'morphine_po',
    crossTolerancePct: '30',
  });
  assert.equal(opioidConv.primaryResult.value, 28);
  assert.ok(opioidConv.secondaryResults?.some((r) => r.formattedValue.includes('40.0 MME')));

  // 5. All 4 new reference tables registered (44 total)
  const newTableIds = [
    'minsa-nicaragua-immunization-table',
    'pediatric-broselow-pals-table',
    'neonatal-hyperbilirubinemia-aap2022-table',
    'daily-pharmacology-converters-table',
  ];
  for (const id of newTableIds) {
    assert.ok(
      CLINICAL_REFERENCE_TABLES.some((t) => t.id === id),
      `Falta tabla clínica nueva: ${id}`,
    );
  }
  assert.equal(CLINICAL_REFERENCE_TABLES.length, 52);
});

test('Regression audit fixes: SOS Table 1, SCORE2 smoking, SVS WIfI IVb, HbA1c rounding, Broselow decimals, ICHD-3 mixed aura, Hadlock 4000 g', async () => {
  const { obstetricSepsisMeowsCalculator } = await import('../calculators/obstetricSepsisMeows.ts');
  const { score2CvdCalculator } = await import('../calculators/score2Cvd.ts');
  const { diabeticFootScalesCalculator } = await import('../calculators/diabeticFootScales.ts');
  const { hba1cEagCalculator } = await import('../calculators/hba1cEag.ts');
  const { ichd3HeadacheCalculator } = await import('../calculators/ichd3Headache.ts');
  const { evaluateFetalWeight } = await import('../data/obstetricWeightStandards.ts');

  // 1. Obstetric SOS (Albright 2014 Table 1): RR 28 (+2), SpO2 88% (+3), WBC 26 (+3) => total 8
  const sos = obstetricSepsisMeowsCalculator.calculate({
    ...createInitialInputs(obstetricSepsisMeowsCalculator),
    respiratoryRate: { value: '28', unitId: 'rpm' },
    spo2: { value: '88', unitId: 'pct' },
    wbc: { value: '26', unitId: 'k_ul' },
  });
  assert.equal(sos.primaryResult.value, 8);
  assert.equal(sos.secondaryResults?.[0].formattedValue, '0 / 0 / 0 / 2 / 3 / 3 / 0 / 0');

  // WBC 19 => +2 (total 2)
  const sosWbc19 = obstetricSepsisMeowsCalculator.calculate({
    ...createInitialInputs(obstetricSepsisMeowsCalculator),
    wbc: { value: '19', unitId: 'k_ul' },
  });
  assert.equal(sosWbc19.primaryResult.value, 2);

  // 2. SCORE2 smoking beta (0.6012 male, 0.7744 female) at 60y (cage=0), SBP 120 (csbp=0), CT 6 mmol/L (~232 mg/dL), HDL 1.3 mmol/L (~50.3 mg/dL)
  // Male moderate region: uncal = 1 - 0.9605^exp(0.6012); cal = 1 - exp(-exp(-0.1565 + 0.8009 * ln(-ln(1 - uncal))))
  const score2MaleSmoker = score2CvdCalculator.calculate({
    region: 'moderate',
    sex: 'male',
    age: { value: '60', unitId: 'years' },
    smoker: true,
    sbp: { value: '120', unitId: 'mmhg' },
    totalChol: { value: String(6 * 38.67), unitId: 'mg_dl' },
    hdlChol: { value: String(1.3 * 38.67), unitId: 'mg_dl' },
  });
  // Exact exp(0.6012) = 1.824306 => uncal = 0.07089 => cal = 10.03% -> 10.0%
  assert.equal(score2MaleSmoker.primaryResult.value, 10.0);

  const score2FemaleSmoker = score2CvdCalculator.calculate({
    region: 'moderate',
    sex: 'female',
    age: { value: '60', unitId: 'years' },
    smoker: true,
    sbp: { value: '120', unitId: 'mmhg' },
    totalChol: { value: String(6 * 38.67), unitId: 'mg_dl' },
    hdlChol: { value: String(1.3 * 38.67), unitId: 'mg_dl' },
  });
  // Exact exp(0.7744) = 2.16929 => uncal = 0.04796 => cal = 6.92% -> 6.9%
  assert.equal(score2FemaleSmoker.primaryResult.value, 6.9);

  // 3. SVS WIfI Table IVb: W2-I1-fI0 -> Moderate; W3-I1-fI0 -> High
  const wifiW2I1 = diabeticFootScalesCalculator.calculate({
    ...createInitialInputs(diabeticFootScalesCalculator),
    scaleMode: 'wifi',
    wifiWound: '2',
    wifiIschemia: '1',
    wifiInfection: '0',
  });
  assert.ok(wifiW2I1.secondaryResults?.some((r) => r.formattedValue === 'Beneficio moderado'));

  const wifiW3I1 = diabeticFootScalesCalculator.calculate({
    ...createInitialInputs(diabeticFootScalesCalculator),
    scaleMode: 'wifi',
    wifiWound: '3',
    wifiIschemia: '1',
    wifiInfection: '0',
  });
  assert.ok(wifiW3I1.secondaryResults?.some((r) => r.formattedValue.includes('Alto beneficio')));

  // 4. HbA1c ↔ eAG rounding alignment: eAG 139 -> 6.5% -> 6.5–7.0% category (not 5.7–6.4%)
  const eag139 = hba1cEagCalculator.calculate({
    mode: 'eag_to_a1c',
    eag: { value: '139', unitId: 'mg_dl' },
  });
  assert.equal(eag139.primaryResult.value, 6.5);
  assert.ok(eag139.riskClassification.includes('6.5 – 7.0 %'));

  const eag116 = hba1cEagCalculator.calculate({
    mode: 'eag_to_a1c',
    eag: { value: '116', unitId: 'mg_dl' },
  });
  assert.equal(eag116.primaryResult.value, 5.7);
  assert.ok(eag116.riskClassification.includes('5.7 – 6.4 %'));

  // 5. Broselow decimal lengths never jump to Green (33 kg)
  const broselow594 = pediatricBroselowResuscitationCalculator.calculate({
    ...createInitialInputs(pediatricBroselowResuscitationCalculator),
    method: 'by_length',
    lengthCm: { value: '59.4', unitId: 'cm' },
  });
  assert.ok(broselow594.primaryResult.formattedValue.includes('Gris'));
  assert.equal(broselow594.primaryResult.value, 4);

  const broselow595 = pediatricBroselowResuscitationCalculator.calculate({
    ...createInitialInputs(pediatricBroselowResuscitationCalculator),
    method: 'by_length',
    lengthCm: { value: '59.5', unitId: 'cm' },
  });
  assert.ok(broselow595.primaryResult.formattedValue.includes('Rosa'));
  assert.equal(broselow595.primaryResult.value, 6.5);

  // 6. ICHD-3 simultaneous brainstem + retinal aura preserves triptan contraindication
  const ichdMixed = ichd3HeadacheCalculator.calculate({
    ...createInitialInputs(ichd3HeadacheCalculator),
    syndrome: 'migraine_with_aura',
    auraAttacks: 'ge2',
    auraBrainstem: true,
    auraRetinal: true,
    acGradual5: true,
    acSuccession: true,
    acDuration60: true,
  });
  assert.equal(ichdMixed.primaryResult.formattedValue, 'ICHD-3 1.2.2 + 1.2.4');
  assert.ok(ichdMixed.guidance?.some((g) => g.toUpperCase().includes('CONTRAINDICADO')));

  // 7. Hadlock 1991: 4000 g at 40 weeks is P79 (AEG) + clinical macrosomia, NOT "> P97"
  const hadlock40w = evaluateFetalWeight(4000, 40);
  assert.ok(hadlock40w);
  assert.ok(hadlock40w.percentile <= 90);
  assert.ok(!hadlock40w.classification.includes('> P97'));
  assert.ok(hadlock40w.classification.includes('Macrosomía'));
});

test('Tuberculosis clinical suite: WHO HRZE adult/pediatric weight bands, CDC PPD/TPT & Xpert/BPaLM', async () => {
  const { tuberculosisClinicalSuiteCalculator } = await import(
    '../calculators/tuberculosisClinicalSuite.ts'
  );

  // 1. Adult 60 kg (55-70 kg band -> 4 tablets/day RHZE 150/75/400/275 mg)
  const adult60 = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'tb_active_dosing',
    weightKg: { value: '60', unitId: 'kg' },
    activeSite: 'pulmonary_standard',
    b6Risk: true,
  });
  assert.equal(adult60.primaryResult.value, 4);
  assert.ok(adult60.primaryResult.formattedValue.includes('4 tabletas/día'));
  assert.ok(adult60.secondaryResults?.some((r) => r.formattedValue.includes('Piridoxina')));

  // 2. Pediatric 10 kg (8.0-11.9 kg band -> 2 dispersible HRZ tablets + 2 E 100 mg)
  const ped10 = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'tb_active_dosing',
    weightKg: { value: '10', unitId: 'kg' },
    activeSite: 'pediatric_nonsevere',
  });
  assert.equal(ped10.primaryResult.value, 2);
  assert.ok(ped10.secondaryResults?.some((r) => r.formattedValue.includes('H 100 / R 150 / Z 300 mg')));
  assert.ok(ped10.secondaryResults?.some((r) => r.formattedValue.includes('H 100 · R 150 · Z 350 · E 200 mg')));

  // 3. Meningeal TB -> critical + Thwaites dexamethasone
  const tbMeningitis = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'tb_active_dosing',
    weightKg: { value: '62', unitId: 'kg' },
    activeSite: 'cns_meningeal',
  });
  assert.equal(tbMeningitis.severity, 'critical');
  assert.ok(tbMeningitis.guidance?.some((g) => g.includes('Thwaites')));

  // 4. LTBI / PPD cutoffs: 7 mm is positive in >=5 mm group (HIV/contact) and negative in >=10 mm group
  const ppd7In5mm = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'ltbi_tst_tpt',
    tstRiskGroup: 'cutoff_5mm',
    ppdMm: { value: '7', unitId: 'mm' },
    activeTbExcluded: true,
  });
  assert.equal(ppd7In5mm.severity, 'high');
  assert.ok(ppd7In5mm.primaryResult.formattedValue.includes('Positivo'));

  const ppd7In10mm = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'ltbi_tst_tpt',
    tstRiskGroup: 'cutoff_10mm',
    ppdMm: { value: '7', unitId: 'mm' },
    activeTbExcluded: true,
  });
  assert.equal(ppd7In10mm.severity, 'normal');
  assert.ok(ppd7In10mm.primaryResult.formattedValue.includes('Negativo'));

  // Must block TPT if active TB not excluded
  const ppdUnexcluded = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'ltbi_tst_tpt',
    tstRiskGroup: 'cutoff_5mm',
    ppdMm: { value: '8', unitId: 'mm' },
    activeTbExcluded: false,
  });
  assert.equal(ppdUnexcluded.severity, 'critical');

  // 5. Diagnostic mode: SR (Sintomático Respiratorio) -> BAAR x3 + GeneXpert CNDR; Xpert RR-TB + CNS exclusion of BPaLM
  const srDx = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'tb_dx_isolation',
    fourSymptomsPositive: true,
    xpertResult: 'pending',
  });
  assert.ok(srDx.primaryResult.formattedValue.includes('Sintomático Respiratorio'));
  assert.ok(srDx.guidance?.some((g) => g.includes('BAAR × 3')));

  const rrCns = tuberculosisClinicalSuiteCalculator.calculate({
    ...createInitialInputs(tuberculosisClinicalSuiteCalculator),
    tbMode: 'tb_dx_isolation',
    xpertResult: 'mtb_r_resistant',
    cnsOrDisseminated: true,
  });
  assert.equal(rrCns.severity, 'critical');
  assert.ok(rrCns.guidance?.some((g) => g.includes('NO está aprobado')));

  // 6. Reference table registered and searchable (MINSA Nicaragua Normativa 054)
  const tbTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === 'tuberculosis-oms-cdc-reference-table');
  assert.ok(tbTable);
  assert.ok(tbTable.title.includes('MINSA Nicaragua'));
  assert.ok(searchCalculators('normativa 054').some((c) => c.id === 'tuberculosis-clinical-suite'));

  // 7. Acronym glossary extraction matches exact clinical acronyms without false positives
  const { extractAcronymsFromText } = await import('../registries/clinicalGlossary.ts');
  const extracted = extractAcronymsFromText(
    'Paciente SR con BAAR (+) inicia esquema 2HRZE/4HR con DFC bajo TAES; no confundir con normal.',
  );
  const siglas = extracted.map((e) => e.sigla);
  assert.ok(siglas.includes('SR'));
  assert.ok(siglas.includes('BAAR'));
  assert.ok(siglas.includes('HRZE'));
  assert.ok(siglas.includes('DFC'));
  assert.ok(siglas.includes('TAES'));
  assert.ok(!siglas.includes('SpO₂'));
});

test('MINSA Nicaragua schemes: VIH (TLD/PPE/vertical), Dengue Normativa 147, MgSO4 Normativa 109, Malaria & Leptospirosis', async () => {
  const { malariaLeptospirosisMinsaCalculator } = await import(
    '../calculators/malariaLeptospirosisMinsa.ts'
  );
  const { extractAcronymsFromText } = await import('../registries/clinicalGlossary.ts');

  // 1. VIH MINSA: TLD + vertical transmission breastfeeding suspension + PPE 6 sem / 3 meses / 6 meses
  const hivPreg = hivCdcCd4ProphylaxisCalculator.calculate({
    cd4Count: { value: '420', unitId: 'cells_ul' },
    cd4Percent: { value: '', unitId: 'pct' },
    hasStage3Oi: false,
    sulfaAllergy: false,
    isPregnant: true,
  });
  assert.ok(hivPreg.guidance?.some((g) => g.includes('TLD') && g.includes('SUSPENDER lactancia materna')));

  const hivPepMinsa = hivPepPrepCalculator.calculate({
    mode: 'pep',
    hoursSinceExposure: { value: '10', unitId: 'h' },
    exposureRisk: 'high',
    prepProfile: 'daily_general',
    prepHivNegConfirmed: true,
    renalCrCl: { value: '100', unitId: 'ml_min' },
  });
  assert.ok(hivPepMinsa.guidance?.some((g) => g.includes('TDF/3TC')));
  assert.ok(hivPepMinsa.guidance?.some((g) => g.includes('6 semanas, 3 meses')));

  // 2. Dengue Normativa 147 MINSA: B2 = 7 mL/kg (60 kg -> 420 mL); C = 10 mL/kg (60 kg -> 600 mL)
  const dengueB2 = dengueOmsCalculator.calculate({
    ...createInitialInputs(dengueOmsCalculator),
    weightKg: { value: '60', unitId: 'kg' },
    ws_pain: true,
  });
  assert.equal(dengueB2.primaryResult.value, 2);
  assert.ok(dengueB2.secondaryResults?.some((r) => r.formattedValue === '420 mL'));

  const dengueC = dengueOmsCalculator.calculate({
    ...createInitialInputs(dengueOmsCalculator),
    weightKg: { value: '60', unitId: 'kg' },
    sev_plasma: true,
  });
  assert.equal(dengueC.primaryResult.value, 3);
  assert.ok(dengueC.secondaryResults?.some((r) => r.formattedValue === '600 mL'));

  // 3. MgSO4 Normativa 109 MINSA: 8 g in 420 mL SSN (= 500 mL -> 16 mg/mL -> 62.5 mL/h for 1 g/h) + 200 mL load
  const mgso4Minsa = obstetricMgso4Calculator.calculate({
    loadingGrams: '4',
    loadingMinutes: '20',
    loadingPrep: '200ml',
    maintGramsHour: '1',
    bagPrep: '8g_420ml',
  });
  assert.equal(mgso4Minsa.primaryResult.value, 62.5);
  assert.equal(mgso4Minsa.secondaryResults?.[0].formattedValue, '600 mL/h');
  assert.ok(mgso4Minsa.guidance?.some((g) => g.includes('FR < 13 rpm')));

  // 4. Malaria P. vivax adult (60 kg -> 1500 mg CQ + 30 mg/d PQ x7d) vs child (20 kg -> 500 mg CQ + 10 mg/d PQ)
  const vivaxAdult = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'malaria_vivax',
    weightKg: { value: '60', unitId: 'kg' },
    patientGroup: 'adult_adolescent',
  });
  assert.equal(vivaxAdult.primaryResult.value, 1500);
  assert.ok(vivaxAdult.primaryResult.formattedValue.includes('30.0 mg/d PQ'));

  const vivaxChild = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'malaria_vivax',
    weightKg: { value: '20', unitId: 'kg' },
    patientGroup: 'pediatric_ge6m',
  });
  assert.equal(vivaxChild.primaryResult.value, 500);
  assert.ok(vivaxChild.primaryResult.formattedValue.includes('10.0 mg/d PQ'));

  // Pregnancy blocks Primaquine
  const vivaxPreg = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'malaria_vivax',
    weightKg: { value: '65', unitId: 'kg' },
    patientGroup: 'pregnant_lactating',
  });
  assert.equal(vivaxPreg.severity, 'high');
  assert.ok(vivaxPreg.secondaryResults?.some((r) => r.formattedValue === 'CONTRAINDICADA'));

  // P. falciparum resistant Coartem 20 kg -> 2 tab/dose (12 tabs total)
  const coartem20 = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'malaria_falciparum_resistente',
    weightKg: { value: '20', unitId: 'kg' },
    patientGroup: 'pediatric_ge6m',
  });
  assert.equal(coartem20.primaryResult.value, 2);
  assert.ok(coartem20.primaryResult.unit.includes('12 tabletas'));

  // 5. Leptospirosis mild & severe
  const leptoAdult = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'leptospirosis_leve',
    weightKg: { value: '70', unitId: 'kg' },
    patientGroup: 'adult_adolescent',
    doxyContraindicated: false,
  });
  assert.ok(leptoAdult.primaryResult.formattedValue.includes('Doxiciclina 100 mg'));

  const leptoChild = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'leptospirosis_leve',
    weightKg: { value: '15', unitId: 'kg' },
    patientGroup: 'pediatric_ge6m',
  });
  assert.equal(leptoChild.primaryResult.value, 450);
  assert.ok(leptoChild.primaryResult.formattedValue.includes('150 mg'));

  const leptoSevereChild = malariaLeptospirosisMinsaCalculator.calculate({
    ...createInitialInputs(malariaLeptospirosisMinsaCalculator),
    protocolMode: 'leptospirosis_grave',
    weightKg: { value: '20', unitId: 'kg' },
    patientGroup: 'pediatric_ge6m',
    penicillinAllergy: false,
  });
  assert.equal(leptoSevereChild.primaryResult.value, 5_000_000);
  assert.ok(leptoSevereChild.primaryResult.formattedValue.includes('1.25 M UI'));

  // 6. Reference table & new MINSA acronyms
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'malaria-leptospirosis-minsa-table'));
  const minsaSiglas = extractAcronymsFromText(
    'Esquema TLD y PPE en UAF con RL supervisado por Col-Vol tras MgSO₄.',
  ).map((e) => e.sigla);
  assert.ok(minsaSiglas.includes('TLD'));
  assert.ok(minsaSiglas.includes('PPE'));
  assert.ok(minsaSiglas.includes('UAF'));
  assert.ok(minsaSiglas.includes('RL'));
  assert.ok(minsaSiglas.includes('Col-Vol'));
  assert.ok(minsaSiglas.includes('MgSO₄'));
});

test('dual guideline architecture: International default vs Nicaragua (MINSA) filtering and dual resolution', async () => {
  const { tuberculosisClinicalSuiteCalculator } = await import(
    '../calculators/tuberculosisClinicalSuite.ts'
  );

  // 1. All pathologies (including Malaria, Leptospirosis & Immunizations) exist in BOTH modes
  const intlCatalog = getCatalogForScope('international');
  const nicCatalog = getCatalogForScope('nicaragua');
  assert.equal(nicCatalog.length, CALCULATOR_CATALOG.length);
  assert.equal(intlCatalog.length, CALCULATOR_CATALOG.length);
  assert.ok(intlCatalog.some((c) => c.id === 'immunization-minsa-nicaragua'));
  assert.ok(intlCatalog.some((c) => c.id === 'malaria-leptospirosis-minsa'));

  const intlSearchLepto = searchCalculatorsForScope('leptospirosis', 'international');
  const nicSearchLepto = searchCalculatorsForScope('leptospirosis', 'nicaragua');
  assert.ok(intlSearchLepto.some((c) => c.id === 'malaria-leptospirosis-minsa'));
  assert.ok(nicSearchLepto.some((c) => c.id === 'malaria-leptospirosis-minsa'));

  const intlTables = CLINICAL_REFERENCE_TABLES.filter((t) =>
    isTableVisibleForScope(t.id, 'international'),
  );
  const nicTables = CLINICAL_REFERENCE_TABLES.filter((t) =>
    isTableVisibleForScope(t.id, 'nicaragua'),
  );
  assert.equal(nicTables.length, CLINICAL_REFERENCE_TABLES.length);
  assert.equal(intlTables.length, CLINICAL_REFERENCE_TABLES.length);
  assert.ok(intlTables.some((t) => t.id === 'minsa-nicaragua-immunization-table'));
  assert.ok(intlTables.some((t) => t.id === 'malaria-leptospirosis-minsa-table'));

  // 2. Dual markers (all 9 calculators and 7 tables)
  assert.equal(isDualCalculator('dengue-oms'), true);
  assert.equal(isDualCalculator('obstetric-mgso4'), true);
  assert.equal(isDualCalculator('malaria-leptospirosis-minsa'), true);
  assert.equal(isDualCalculator('immunization-minsa-nicaragua'), true);
  assert.equal(isDualCalculator('imc'), false);
  assert.equal(isDualTable('dengue-paho-who-table'), true);
  assert.equal(isDualTable('tuberculosis-oms-cdc-reference-table'), true);
  assert.equal(isDualTable('malaria-leptospirosis-minsa-table'), true);
  assert.equal(isDualTable('minsa-nicaragua-immunization-table'), true);

  // 3. Dengue OMS/OPS vs MINSA Nicaragua
  const dengueIntl = resolveCalculatorForGuideline(dengueOmsCalculator, 'international');
  assert.ok(!dengueIntl.name.includes('MINSA'));
  assert.ok(!dengueIntl.version.includes('Normativa 147'));
  assert.ok(!dengueIntl.references.some((r) => r.citation.includes('MINSA')));

  const dengueB2Intl = dengueIntl.calculate({
    ...createInitialInputs(dengueIntl),
    weightKg: { value: '60', unitId: 'kg' },
    ws_pain: true,
  });
  assert.equal(dengueB2Intl.primaryResult.value, 2);
  assert.ok(dengueB2Intl.secondaryResults?.some((r) => r.formattedValue === '600 mL'));

  const dengueCIntl = dengueIntl.calculate({
    ...createInitialInputs(dengueIntl),
    weightKg: { value: '60', unitId: 'kg' },
    sev_plasma: true,
  });
  assert.equal(dengueCIntl.primaryResult.value, 3);
  assert.ok(dengueCIntl.secondaryResults?.some((r) => r.formattedValue === '1200 mL'));

  // 4. MgSO4 Zuspan (International defaults: 100 mL load + 20 g / 500 mL -> 25 mL/h for 1 g/h)
  const mgso4Intl = resolveCalculatorForGuideline(obstetricMgso4Calculator, 'international');
  assert.ok(!mgso4Intl.name.includes('MINSA'));
  assert.ok(!mgso4Intl.version.includes('Normativa 109'));
  const mgso4IntlDefaults = createInitialInputs(mgso4Intl);
  assert.equal(mgso4IntlDefaults.loadingPrep, '100ml');
  assert.equal(mgso4IntlDefaults.bagPrep, '20g_500ml');
  const mgso4IntlOut = mgso4Intl.calculate(mgso4IntlDefaults);
  assert.equal(mgso4IntlOut.primaryResult.value, 25);
  assert.equal(mgso4IntlOut.secondaryResults?.[0].formattedValue, '300 mL/h');

  const mgso4Nic = resolveCalculatorForGuideline(obstetricMgso4Calculator, 'nicaragua');
  const mgso4NicDefaults = createInitialInputs(mgso4Nic);
  assert.equal(mgso4NicDefaults.loadingPrep, '200ml');
  assert.equal(mgso4NicDefaults.bagPrep, '8g_420ml');
  assert.equal(mgso4Nic.calculate(mgso4NicDefaults).primaryResult.value, 62.5);

  // 5. Remaining dual calculators strip MINSA wording in international mode
  const preeclampsiaIntl = resolveCalculatorForGuideline(
    preeclampsiaHellpCalculator,
    'international',
  );
  assert.ok(!preeclampsiaIntl.references.some((r) => r.citation.includes('MINSA')));

  const hivCd4Intl = resolveCalculatorForGuideline(
    hivCdcCd4ProphylaxisCalculator,
    'international',
  );
  const hivCd4Out = hivCd4Intl.calculate({
    ...createInitialInputs(hivCd4Intl),
    cd4Count: { value: '180', unitId: 'cells_ul' },
    isPregnant: true,
  });
  assert.ok(!hivCd4Out.guidance?.some((g) => g.includes('MINSA')));

  const hivPepIntl = resolveCalculatorForGuideline(hivPepPrepCalculator, 'international');
  const hivPepOut = hivPepIntl.calculate({
    ...createInitialInputs(hivPepIntl),
    mode: 'pep',
    hoursSinceExposure: { value: '12', unitId: 'h' },
    exposureRisk: 'high_percutaneous_sexual',
  });
  assert.ok(!hivPepOut.guidance?.some((g) => g.includes('MINSA')));
  assert.ok(hivPepOut.guidance?.some((g) => g.includes('CDC 2025')));

  const hivArtIntl = resolveCalculatorForGuideline(
    hivOpportunisticArtTimingCalculator,
    'international',
  );
  const hivArtOut = hivArtIntl.calculate(createInitialInputs(hivArtIntl));
  assert.ok(!hivArtOut.clinicalInterpretation.includes('MINSA'));

  const tbIntl = resolveCalculatorForGuideline(
    tuberculosisClinicalSuiteCalculator,
    'international',
  );
  assert.ok(!tbIntl.name.includes('MINSA'));
  assert.ok(!tbIntl.references.some((r) => r.citation.includes('MINSA')));
  const tbIntlOut = tbIntl.calculate({
    ...createInitialInputs(tbIntl),
    weightKg: { value: '60', unitId: 'kg' },
  });
  assert.ok(!tbIntlOut.clinicalInterpretation.includes('MINSA'));
  assert.ok(!tbIntlOut.guidance?.some((g) => g.includes('Normativa 054')));

  // 6. Malaria & Leptospirosis dual mode (WHO/CDC vs MINSA)
  const malLeptoIntl = resolveCalculatorForGuideline(
    malariaLeptospirosisMinsaCalculator,
    'international',
  );
  assert.ok(!malLeptoIntl.name.includes('MINSA'));
  assert.ok(!malLeptoIntl.references.some((r) => r.citation.includes('MINSA')));

  const vivaxIntl = malLeptoIntl.calculate({
    ...createInitialInputs(malLeptoIntl),
    protocolMode: 'malaria_vivax',
    weightKg: { value: '60', unitId: 'kg' },
    patientGroup: 'adult_adolescent',
  });
  assert.ok(vivaxIntl.primaryResult.formattedValue.includes('15.0 mg/d PQ × 14 d'));

  const leptoLeveIntl = malLeptoIntl.calculate({
    ...createInitialInputs(malLeptoIntl),
    protocolMode: 'leptospirosis_leve',
    weightKg: { value: '70', unitId: 'kg' },
    patientGroup: 'adult_adolescent',
  });
  assert.ok(leptoLeveIntl.primaryResult.formattedValue.includes('Doxiciclina 100 mg'));
  assert.ok(!leptoLeveIntl.primaryResult.label.includes('MINSA'));

  const leptoPregIntl = malLeptoIntl.calculate({
    ...createInitialInputs(malLeptoIntl),
    protocolMode: 'leptospirosis_leve',
    weightKg: { value: '65', unitId: 'kg' },
    patientGroup: 'pregnant_lactating',
  });
  assert.ok(leptoPregIntl.primaryResult.formattedValue.includes('Amoxicilina 500 mg VO c/8 h'));

  const leptoGraveIntl = malLeptoIntl.calculate({
    ...createInitialInputs(malLeptoIntl),
    protocolMode: 'leptospirosis_grave',
    weightKg: { value: '70', unitId: 'kg' },
    patientGroup: 'adult_adolescent',
  });
  assert.ok(!leptoGraveIntl.primaryResult.label.includes('MINSA'));
  assert.ok(leptoGraveIntl.clinicalInterpretation.includes('Ceftriaxona 1–2 g IV'));

  // 7. Immunizations dual mode (WHO Routine Immunization vs MINSA PAI)
  const immIntl = resolveCalculatorForGuideline(
    immunizationMinsaNicaraguaCalculator,
    'international',
  );
  assert.ok(!immIntl.name.includes('MINSA'));
  assert.ok(!immIntl.references.some((r) => r.citation.includes('MINSA')));
  const immPregIntl = immIntl.calculate({
    ...createInitialInputs(immIntl),
    mode: 'esquema_edad',
    ageGroup: 'embarazada',
  });
  assert.ok(immPregIntl.primaryResult.formattedValue.includes('Tdap'));
  assert.ok(!immPregIntl.riskClassification.includes('MINSA'));

  // 8. Dual tables resolve cleanly in international mode
  for (const dualTableId of [
    'dengue-paho-who-table',
    'tuberculosis-oms-cdc-reference-table',
    'malaria-leptospirosis-minsa-table',
    'minsa-nicaragua-immunization-table',
  ]) {
    const baseTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === dualTableId);
    assert.ok(baseTable, `Missing table ${dualTableId}`);
    const resolvedTable = resolveTableForGuideline(baseTable, 'international');
    assert.ok(!resolvedTable.title.includes('MINSA'), `MINSA in title of ${dualTableId}`);
    assert.ok(
      !resolvedTable.guidelineVersion.includes('MINSA'),
      `MINSA in guidelineVersion of ${dualTableId}`,
    );
    assert.ok(
      !resolvedTable.references.some((r) => r.citation.includes('MINSA')),
      `MINSA in references of ${dualTableId}`,
    );
  }
});

test('Ebola Virus, Lassa Fever, Herpes Zoster, and Gonorrhea calculators + reference tables', async () => {
  const { ebolaVirusCalculator } = await import('../calculators/ebolaVirus.ts');
  const { lassaVirusCalculator } = await import('../calculators/lassaVirus.ts');
  const { herpesZosterCalculator } = await import('../calculators/herpesZoster.ts');
  const { gonorrheaCalculator } = await import('../calculators/gonorrhea.ts');

  // 1. Ebola Virus: confirmed 60 kg -> Ansuvimab 3000 mg, REGN-EB3 3000/3000/3000 mg, 20 mL/kg = 1200 mL
  const ebolaConfirmed = ebolaVirusCalculator.calculate({
    ...createInitialInputs(ebolaVirusCalculator),
    scenario: 'enfermedad_confirmada',
    weightKg: { value: '60', unitId: 'kg' },
    epiExposure: true,
    fever: true,
    giLoss: true,
  });
  assert.equal(ebolaConfirmed.severity, 'high');
  assert.ok(ebolaConfirmed.secondaryResults?.some((r) => r.formattedValue.includes('3000 mg IV DU')));
  assert.ok(ebolaConfirmed.secondaryResults?.some((r) => r.formattedValue.includes('1200 mL')));

  const ebolaSuspect = ebolaVirusCalculator.calculate({
    ...createInitialInputs(ebolaVirusCalculator),
    scenario: 'triage_contacto',
    epiExposure: true,
    fever: true,
  });
  assert.equal(ebolaSuspect.primaryResult.formattedValue, 'Caso Sospechoso');

  const ebolaPreg = ebolaVirusCalculator.calculate({
    ...createInitialInputs(ebolaVirusCalculator),
    scenario: 'embarazo_lactancia',
    bleedingOrShock: true,
  });
  assert.equal(ebolaPreg.severity, 'critical');

  // 2. Lassa Fever: McCormick IV Ribavirin dosing & caps
  const lassa60 = lassaVirusCalculator.calculate({
    ...createInitialInputs(lassaVirusCalculator),
    scenario: 'tratamiento_ribavirina',
    weightKg: { value: '60', unitId: 'kg' },
    daysFromOnset: { value: '4', unitId: 'days' },
  });
  assert.equal(lassa60.primaryResult.value, 1800);
  assert.ok(lassa60.secondaryResults?.some((r) => r.formattedValue.includes('1800 mg IV')));
  assert.ok(lassa60.secondaryResults?.some((r) => r.formattedValue.includes('960 mg IV c/6 h')));
  assert.ok(lassa60.secondaryResults?.some((r) => r.formattedValue.includes('480 mg IV c/8 h')));

  const lassa80Capped = lassaVirusCalculator.calculate({
    ...createInitialInputs(lassaVirusCalculator),
    scenario: 'tratamiento_ribavirina',
    weightKg: { value: '80', unitId: 'kg' },
    daysFromOnset: { value: '8', unitId: 'days' },
  });
  assert.equal(lassa80Capped.primaryResult.value, 2000);
  assert.ok(lassa80Capped.secondaryResults?.some((r) => r.formattedValue.includes('1000 mg IV c/6 h')));
  assert.ok(lassa80Capped.secondaryResults?.some((r) => r.formattedValue.includes('500 mg IV c/8 h')));

  // 3. Herpes Zoster: eGFR adjustments, Hutchinson sign, IV Acyclovir
  const hzNormal = herpesZosterCalculator.calculate({
    ...createInitialInputs(herpesZosterCalculator),
    scenario: 'inmunocompetente',
    hoursSinceRash: 'lte72',
    egfrBand: 'ge50',
  });
  assert.equal(hzNormal.primaryResult.formattedValue, 'Valaciclovir / Aciclovir VO');
  assert.ok(hzNormal.secondaryResults?.some((r) => r.formattedValue === '1,000 mg VO c/8 h × 7 días'));
  assert.ok(
    hzNormal.secondaryResults?.some((r) =>
      r.formattedValue.includes('800 mg VO 5 veces al día'),
    ),
  );
  assert.ok(hzNormal.guidance?.some((g) => g.includes('800 mg VO 5 veces al día')));

  const hzRenal = herpesZosterCalculator.calculate({
    ...createInitialInputs(herpesZosterCalculator),
    scenario: 'inmunocompetente',
    hoursSinceRash: 'lte72',
    egfrBand: '10_29',
  });
  assert.ok(hzRenal.secondaryResults?.some((r) => r.formattedValue === '1,000 mg VO c/24 h × 7 días'));

  const hzHutchinson = herpesZosterCalculator.calculate({
    ...createInitialInputs(herpesZosterCalculator),
    scenario: 'inmunocompetente',
    hoursSinceRash: 'gt72',
    hutchinsonSign: true,
  });
  assert.equal(hzHutchinson.severity, 'high');
  assert.equal(hzHutchinson.primaryResult.formattedValue, 'Oftalmología urgente');

  const hzDisseminated = herpesZosterCalculator.calculate({
    ...createInitialInputs(herpesZosterCalculator),
    scenario: 'inmunocomprometido_diseminado',
    egfrBand: 'ge50',
  });
  assert.equal(hzDisseminated.severity, 'critical');
  assert.equal(hzDisseminated.primaryResult.formattedValue, 'Aciclovir IV inmediato');

  // 4. Gonorrhea: weight cutoffs (<150 vs >=150 kg), pregnancy, pharyngeal TOC, allergy, DGI, neonatal
  const gono70 = gonorrheaCalculator.calculate({
    ...createInitialInputs(gonorrheaCalculator),
    syndrome: 'uncomplicated_urogenital_rectal',
    weightKg: { value: '70', unitId: 'kg' },
    chlamydiaExcluded: false,
    pregnant: false,
  });
  assert.equal(gono70.primaryResult.value, 500);
  assert.ok(gono70.secondaryResults?.some((r) => r.formattedValue.includes('Doxiciclina 100 mg')));

  const gono160Preg = gonorrheaCalculator.calculate({
    ...createInitialInputs(gonorrheaCalculator),
    syndrome: 'pharyngeal',
    weightKg: { value: '160', unitId: 'kg' },
    chlamydiaExcluded: false,
    pregnant: true,
  });
  assert.equal(gono160Preg.primaryResult.value, 1000);
  assert.ok(gono160Preg.secondaryResults?.some((r) => r.formattedValue.includes('Azitromicina 1 g')));
  assert.ok(gono160Preg.secondaryResults?.some((r) => r.formattedValue.includes('OBLIGATORIA')));

  const gonoAllergy = gonorrheaCalculator.calculate({
    ...createInitialInputs(gonorrheaCalculator),
    syndrome: 'uncomplicated_urogenital_rectal',
    severeCephalosporinAllergy: true,
  });
  assert.ok(gonoAllergy.primaryResult.formattedValue.includes('Gentamicina 240 mg'));

  const gonoNeonatal = gonorrheaCalculator.calculate({
    ...createInitialInputs(gonorrheaCalculator),
    syndrome: 'neonatal_ophthalmia',
    weightKg: { value: '3.5', unitId: 'kg' },
  });
  assert.equal(gonoNeonatal.severity, 'critical');
  assert.equal(gonoNeonatal.primaryResult.value, 125);
  assert.equal(gonoNeonatal.primaryResult.formattedValue, '88–125 mg IV/IM DU');

  // 5. Search & reference tables verification
  assert.ok(searchCalculators('ebola').some((c) => c.id === 'ebola-virus'));
  assert.ok(searchCalculators('lassa').some((c) => c.id === 'lassa-virus'));
  assert.ok(searchCalculators('herpes zoster').some((c) => c.id === 'herpes-zoster'));
  assert.ok(searchCalculators('gonorrea').some((c) => c.id === 'gonorrhea-sti'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'vhf-ebola-lassa-table'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'sti-syndromic-treatment-table'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'herpes-zoster-varicella-exanthems-table'));
});

test('VHF Critical Suite, Endemic Fevers, Non-Endemic/Traveler Fevers, and Escala de Fine (PSI/PORT)', async () => {
  const { vhfCriticalSuiteCalculator } = await import('../calculators/vhfCriticalSuite.ts');
  const { endemicArbovirusesCalculator } = await import(
    '../calculators/endemicArbovirusesZoonoses.ts'
  );
  const { nonEndemicImportedFeversCalculator } = await import(
    '../calculators/nonEndemicImportedFevers.ts'
  );

  // 1. Escala de Fine prominently searchable and labeled
  assert.ok(psiPortCalculator.name.includes('Escala de Fine'));
  assert.ok(searchCalculators('escala de fine').some((c) => c.id === 'psi-port'));
  assert.ok(searchCalculators('fine').some((c) => c.id === 'psi-port'));

  // 2. VHF Critical Suite: Hantavirus fluid restriction, Yellow Fever toxic phase, CCHF Ribavirin, Junin <=8d, Marburg 20 mL/kg
  const hantaScph = vhfCriticalSuiteCalculator.calculate({
    ...createInitialInputs(vhfCriticalSuiteCalculator),
    pathogen: 'hantavirus',
    severeComplications: true,
  });
  assert.equal(hantaScph.severity, 'critical');
  assert.ok(
    hantaScph.secondaryResults?.some((r) => r.formattedValue.includes('Restricción hídrica')),
  );

  const yfToxic = vhfCriticalSuiteCalculator.calculate({
    ...createInitialInputs(vhfCriticalSuiteCalculator),
    pathogen: 'yellow_fever',
    severeComplications: true,
  });
  assert.equal(yfToxic.severity, 'critical');
  assert.ok(yfToxic.primaryResult.formattedValue.includes('Intoxicación'));

  const cchf = vhfCriticalSuiteCalculator.calculate({
    ...createInitialInputs(vhfCriticalSuiteCalculator),
    pathogen: 'cchf',
    weightKg: { value: '65', unitId: 'kg' },
    daysFromOnset: { value: '3', unitId: 'days' },
  });
  assert.ok(cchf.secondaryResults?.some((r) => r.formattedValue.includes('Carga 1950 mg')));

  const juninEarly = vhfCriticalSuiteCalculator.calculate({
    ...createInitialInputs(vhfCriticalSuiteCalculator),
    pathogen: 'south_american_arenavirus',
    daysFromOnset: { value: '6', unitId: 'days' },
  });
  assert.ok(juninEarly.primaryResult.formattedValue.includes('≤ 8 días'));

  const marburg = vhfCriticalSuiteCalculator.calculate({
    ...createInitialInputs(vhfCriticalSuiteCalculator),
    pathogen: 'marburg',
    weightKg: { value: '65', unitId: 'kg' },
    severeComplications: true,
  });
  assert.ok(marburg.secondaryResults?.some((r) => r.formattedValue.includes('1300 mL')));

  // 3. Endemic Fevers: Chagas Benznidazol, Rickettsiosis pediatric Doxycycline, Brucellosis pregnancy, Zika, Chikungunya
  const chagasAdult = endemicArbovirusesCalculator.calculate({
    ...createInitialInputs(endemicArbovirusesCalculator),
    disease: 'chagas_acute',
    weightKg: { value: '60', unitId: 'kg' },
    pediatricUnder8Or45: false,
  });
  assert.equal(chagasAdult.primaryResult.formattedValue, '300–350 mg/d');

  const chagasChild = endemicArbovirusesCalculator.calculate({
    ...createInitialInputs(endemicArbovirusesCalculator),
    disease: 'chagas_acute',
    weightKg: { value: '20', unitId: 'kg' },
    pediatricUnder8Or45: true,
  });
  assert.equal(chagasChild.primaryResult.formattedValue, '100–200 mg/d');

  const rickettsiaChild = endemicArbovirusesCalculator.calculate({
    ...createInitialInputs(endemicArbovirusesCalculator),
    disease: 'rickettsiosis',
    weightKg: { value: '30', unitId: 'kg' },
    pediatricUnder8Or45: true,
  });
  assert.equal(rickettsiaChild.primaryResult.value, 66);

  const brucellaPreg = endemicArbovirusesCalculator.calculate({
    ...createInitialInputs(endemicArbovirusesCalculator),
    disease: 'brucellosis',
    weightKg: { value: '62', unitId: 'kg' },
    pregnant: true,
  });
  assert.ok(brucellaPreg.primaryResult.formattedValue.includes('TMP-SMX + Rifampicina'));

  const zikaPreg = endemicArbovirusesCalculator.calculate({
    ...createInitialInputs(endemicArbovirusesCalculator),
    disease: 'zika',
    pregnant: true,
  });
  assert.equal(zikaPreg.severity, 'high');

  // 4. Non-Endemic & Traveler Fevers: triage windows, Typhoid peds, Q fever, Babesiosis
  const travelerLong = nonEndemicImportedFeversCalculator.calculate({
    ...createInitialInputs(nonEndemicImportedFeversCalculator),
    condition: 'traveler_triage',
    incubationWindow: 'gt21',
  });
  assert.ok(travelerLong.primaryResult.formattedValue.includes('> 21 días'));

  const typhoidChild = nonEndemicImportedFeversCalculator.calculate({
    ...createInitialInputs(nonEndemicImportedFeversCalculator),
    condition: 'typhoid_enteric',
    weightKg: { value: '20', unitId: 'kg' },
    pediatric: true,
  });
  assert.equal(typhoidChild.primaryResult.value, 1500);
  assert.ok(typhoidChild.secondaryResults?.some((r) => r.formattedValue.includes('400 mg VO')));

  const qFeverEndo = nonEndemicImportedFeversCalculator.calculate({
    ...createInitialInputs(nonEndemicImportedFeversCalculator),
    condition: 'q_fever',
    severeOrXdr: true,
  });
  assert.equal(qFeverEndo.severity, 'critical');
  assert.ok(qFeverEndo.primaryResult.formattedValue.includes('Hidroxicloroquina'));

  const babesiaMild = nonEndemicImportedFeversCalculator.calculate({
    ...createInitialInputs(nonEndemicImportedFeversCalculator),
    condition: 'babesiosis',
    weightKg: { value: '70', unitId: 'kg' },
    severeOrXdr: false,
  });
  assert.equal(babesiaMild.primaryResult.value, 750);

  // 5. Search & reference tables verification
  assert.ok(searchCalculators('fiebre amarilla').some((c) => c.id === 'vhf-critical-suite'));
  assert.ok(searchCalculators('marburgo').some((c) => c.id === 'vhf-critical-suite'));
  assert.ok(searchCalculators('fiebres endemicas').some((c) => c.id === 'endemic-arboviruses-fevers'));
  assert.ok(searchCalculators('chikungunya').some((c) => c.id === 'endemic-arboviruses-fevers'));
  assert.ok(searchCalculators('fiebre no endemica').some((c) => c.id === 'non-endemic-imported-fevers'));
  assert.ok(searchCalculators('tifoidea').some((c) => c.id === 'non-endemic-imported-fevers'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'vhf-other-complications-table'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'endemic-fevers-table'));
  assert.ok(CLINICAL_REFERENCE_TABLES.some((t) => t.id === 'non-endemic-fevers-table'));
});

test('STI Syndromes (ETS-only), Pediatric Varicella & Childhood Exanthems, and pure table separation', async () => {
  const { stiSyndromesCalculator } = await import('../calculators/stiSyndromes.ts');
  const { pediatricVaricellaExanthemsCalculator } = await import(
    '../calculators/pediatricVaricellaExanthems.ts'
  );

  // 1. STI Syndromes (exclusively STIs)
  const syphEarlyAdult = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'syphilis_early',
    weightKg: { value: '70', unitId: 'kg' },
    pregnant: false,
    penicillinAllergy: false,
  });
  assert.equal(syphEarlyAdult.primaryResult.value, 2400000);
  assert.ok(syphEarlyAdult.primaryResult.formattedValue.includes('2400000'));

  const syphEarlyChild = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'syphilis_early',
    weightKg: { value: '30', unitId: 'kg' },
    pregnant: false,
    penicillinAllergy: false,
  });
  assert.equal(syphEarlyChild.primaryResult.value, 1500000);
  assert.ok(syphEarlyChild.primaryResult.formattedValue.includes('1500000'));

  const syphPregAllergy = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'syphilis_late',
    pregnant: true,
    penicillinAllergy: true,
  });
  assert.equal(syphPregAllergy.severity, 'high');
  assert.ok(syphPregAllergy.primaryResult.formattedValue.includes('Desensibilización'));

  const neuroSyph = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'neurosyphilis',
    pregnant: true,
    penicillinAllergy: true,
  });
  assert.equal(neuroSyph.severity, 'critical');
  assert.ok(neuroSyph.guidance?.some((g) => g.includes('DESENSIBILIZACIÓN')));

  const hsvFirstPreg = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'genital_herpes_first',
    pregnant: true,
  });
  assert.equal(hsvFirstPreg.primaryResult.value, 400);
  assert.ok(hsvFirstPreg.secondaryResults?.some((r) => r.formattedValue.includes('36 SG')));

  const chancroidOut = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'chancroid',
  });
  assert.ok(chancroidOut.primaryResult.formattedValue.includes('Azitromicina 1 g'));

  const lgvPreg = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'lgv_donovanosis',
    pregnant: true,
  });
  assert.ok(lgvPreg.primaryResult.formattedValue.includes('Eritromicina'));

  const trichOut = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'trichomoniasis',
  });
  assert.ok(trichOut.primaryResult.formattedValue.includes('500 mg VO c/12 h × 7 d'));

  const chlamPreg = stiSyndromesCalculator.calculate({
    ...createInitialInputs(stiSyndromesCalculator),
    stiEntity: 'chlamydia_ng',
    pregnant: true,
  });
  assert.equal(chlamPreg.primaryResult.value, 1000);
  assert.ok(chlamPreg.primaryResult.formattedValue.includes('Azitromicina 1 g'));

  // 2. Pediatric Varicella & Childhood Exanthems
  const varicella18 = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'varicella_pediatric',
    ageBand: '1_11y',
    weightKg: { value: '18', unitId: 'kg' },
    highRiskOrSevere: false,
  });
  assert.ok(varicella18.primaryResult.formattedValue.includes('Paracetamol'));
  assert.ok(varicella18.secondaryResults?.some((r) => r.formattedValue.includes('360 mg VO')));
  assert.ok(varicella18.secondaryResults?.some((r) => r.formattedValue.includes('180 mg IV')));
  assert.ok(varicella18.guidance?.some((g) => g.includes('PROHIBIDO AAS')));

  const measlesLt6m = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'measles',
    ageBand: 'lt6m',
    weightKg: { value: '6', unitId: 'kg' },
  });
  assert.equal(measlesLt6m.primaryResult.value, 50000);

  const measles6to11m = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'measles',
    ageBand: '6_11m',
    weightKg: { value: '9', unitId: 'kg' },
  });
  assert.equal(measles6to11m.primaryResult.value, 100000);

  const measles1y = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'measles',
    ageBand: '1_11y',
    weightKg: { value: '15', unitId: 'kg' },
  });
  assert.equal(measles1y.primaryResult.value, 200000);

  const scarlet20 = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'scarlet_fever',
    weightKg: { value: '20', unitId: 'kg' },
    penicillinAllergy: false,
  });
  assert.equal(scarlet20.primaryResult.value, 1000);
  assert.ok(scarlet20.secondaryResults?.some((r) => r.formattedValue.includes('600000 UI')));

  const scarlet35 = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'scarlet_fever',
    weightKg: { value: '35', unitId: 'kg' },
    penicillinAllergy: false,
  });
  assert.ok(scarlet35.secondaryResults?.some((r) => r.formattedValue.includes('1200000 UI')));

  const kawasaki18 = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'kawasaki_alert',
    weightKg: { value: '18', unitId: 'kg' },
  });
  assert.equal(kawasaki18.severity, 'critical');
  assert.equal(kawasaki18.primaryResult.value, 36);
  assert.ok(kawasaki18.primaryResult.formattedValue.includes('36.0 g'));

  const rubellaOut = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'rubella',
  });
  assert.ok(rubellaOut.riskClassification.includes('Rubéola'));

  const roseolaOut = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'roseola_hhv6',
  });
  assert.ok(roseolaOut.primaryResult.formattedValue.includes('NO dar antibióticos'));

  const b19Risk = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'erythema_infectiosum_b19',
    highRiskOrSevere: true,
  });
  assert.equal(b19Risk.severity, 'high');

  const hfmOut = pediatricVaricellaExanthemsCalculator.calculate({
    ...createInitialInputs(pediatricVaricellaExanthemsCalculator),
    exanthem: 'hand_foot_mouth',
  });
  assert.ok(hfmOut.riskClassification.includes('Mano-Pie-Boca'));

  // 3. Search & strict table category separation checks
  assert.ok(searchCalculators('chancroide').some((c) => c.id === 'sti-ulcer-discharge'));
  assert.ok(searchCalculators('herpes simple').some((c) => c.id === 'sti-ulcer-discharge'));
  assert.ok(searchCalculators('varicela').some((c) => c.id === 'pediatric-varicella-exanthems'));
  assert.ok(searchCalculators('exantematicas').some((c) => c.id === 'pediatric-varicella-exanthems'));
  assert.ok(searchCalculators('escarlatina').some((c) => c.id === 'pediatric-varicella-exanthems'));

  const getRowFirstCol = (row: (typeof CLINICAL_REFERENCE_TABLES)[number]['rows'][number]) =>
    typeof row[0] === 'string' ? row[0] : row[0].text;

  // VHF tables must contain ONLY Viral Hemorrhagic Fevers
  const vhfOtherTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === 'vhf-other-complications-table');
  assert.ok(vhfOtherTable);
  const vhfTitles = vhfOtherTable.rows.map(getRowFirstCol).join(' | ');
  assert.ok(vhfTitles.includes('Dengue Grave'));
  assert.ok(vhfTitles.includes('Fiebre Amarilla'));
  assert.ok(vhfTitles.includes('Hantavirus'));
  assert.ok(vhfTitles.includes('Arenavirus'));
  assert.ok(vhfTitles.includes('Marburgo'));
  assert.ok(vhfTitles.includes('Crimea-Congo'));
  assert.ok(!vhfTitles.includes('Zika'));
  assert.ok(!vhfTitles.includes('Chikungunya'));
  assert.ok(!vhfTitles.includes('Chagas'));
  assert.ok(!vhfTitles.includes('Tifoidea'));

  // Endemic fevers table must contain endemic non-hemorrhagic fevers, no Marburg/Lassa/Ebola
  const endemicTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === 'endemic-fevers-table');
  assert.ok(endemicTable);
  const endemicTitles = endemicTable.rows.map(getRowFirstCol).join(' | ');
  assert.ok(endemicTitles.includes('Malaria'));
  assert.ok(endemicTitles.includes('Leptospirosis'));
  assert.ok(endemicTitles.includes('Chikungunya'));
  assert.ok(endemicTitles.includes('Chagas'));
  assert.ok(!endemicTitles.includes('Ébola'));
  assert.ok(!endemicTitles.includes('Marburgo'));

  // Non-endemic fevers table must cover traveler/imported non-endemic fevers
  const nonEndemicTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === 'non-endemic-fevers-table');
  assert.ok(nonEndemicTable);
  const nonEndemicTitles = nonEndemicTable.rows.map(getRowFirstCol).join(' | ');
  assert.ok(nonEndemicTitles.includes('Tifoidea XDR'));
  assert.ok(nonEndemicTitles.includes('Fiebre Q'));
  assert.ok(nonEndemicTitles.includes('Babesiosis'));

  // STI table must contain strictly STIs (no Herpes Zoster row)
  const stiTable = CLINICAL_REFERENCE_TABLES.find((t) => t.id === 'sti-syndromic-treatment-table');
  assert.ok(stiTable);
  const stiTitles = stiTable.rows.map(getRowFirstCol).join(' | ');
  assert.ok(stiTitles.includes('Gonorrea'));
  assert.ok(stiTitles.includes('Sífilis'));
  assert.ok(stiTitles.includes('Herpes Simple Genital'));
  assert.ok(stiTitles.includes('Chancro Blando'));
  assert.ok(stiTitles.includes('Linfogranuloma Venéreo'));
  assert.ok(stiTitles.includes('Tricomoniasis'));
  assert.ok(!stiTitles.includes('Herpes Zóster'));

  // Herpes Zoster + Pediatric Varicella + Childhood Exanthems table
  const exanthemTable = CLINICAL_REFERENCE_TABLES.find(
    (t) => t.id === 'herpes-zoster-varicella-exanthems-table',
  );
  assert.ok(exanthemTable);
  const exanthemTitles = exanthemTable.rows.map(getRowFirstCol).join(' | ');
  assert.ok(exanthemTitles.includes('Herpes Zóster'));
  assert.ok(exanthemTitles.includes('Varicela Infantil'));
  assert.ok(exanthemTitles.includes('Sarampión'));
  assert.ok(exanthemTitles.includes('Escarlatina'));
  assert.ok(exanthemTitles.includes('Rubéola'));
  assert.ok(exanthemTitles.includes('Roséola'));
  assert.ok(exanthemTitles.includes('Mano-Pie-Boca'));
  const hzRowText = String(exanthemTable.rows[0][2]);
  assert.ok(hzRowText.includes('Aciclovir 800 mg VO 5 veces al día'));
  assert.ok(hzRowText.includes('Valaciclovir 1,000 mg VO c/8 h'));
  assert.ok(hzRowText.includes('Famciclovir 500 mg VO c/8 h'));
});











