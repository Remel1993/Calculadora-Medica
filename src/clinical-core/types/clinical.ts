export type SpecialtyId =
  | 'cardiologia'
  | 'cirugia-general'
  | 'dermatologia'
  | 'endocrinologia'
  | 'gastroenterologia'
  | 'geriatria'
  | 'gineco-obstetricia'
  | 'hematologia'
  | 'infectologia'
  | 'medicina-interna'
  | 'nefrologia'
  | 'neumologia'
  | 'neurologia'
  | 'oncologia'
  | 'pediatria'
  | 'psiquiatria'
  | 'traumatologia'
  | 'urgencias'
  | 'urologia';

export type SubcategoryId =
  | 'formulas'
  | 'gravedad'
  | 'diagnostico'
  | 'liquidos'
  | 'dosificacion';

export type SeverityLevel =
  | 'normal'
  | 'low'
  | 'moderate'
  | 'high'
  | 'critical'
  | 'info';

export interface SpecialtyMeta {
  id: SpecialtyId;
  name: string;
  shortName: string;
  description: string;
}

export interface UnitOption {
  id: string;
  label: string;
  /** Converts from the user-entered unit into the calculator's canonical unit */
  toCanonical: (value: number) => number;
  /** Optional physiological bounds override for this specific unit */
  min?: number;
  max?: number;
  step?: number;
}

export interface BaseFieldDef {
  id: string;
  label: string;
  helpText?: string;
  required?: boolean;
  visibleWhen?: (inputs: CalculatorInputsState) => boolean;
}

export interface NumberFieldDef extends BaseFieldDef {
  type: 'number';
  canonicalUnit: string;
  units: UnitOption[];
  defaultUnitId: string;
  defaultValue?: string;
  /** Bounds evaluated in canonical units */
  min: number;
  max: number;
  placeholder?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  points?: number;
}

export interface SelectFieldDef extends BaseFieldDef {
  type: 'select';
  options: SelectOption[];
  defaultValue?: string;
}

export interface BooleanFieldDef extends BaseFieldDef {
  type: 'boolean';
  trueLabel?: string;
  falseLabel?: string;
  pointsWhenTrue?: number;
  defaultValue?: boolean;
}

export interface DateFieldDef extends BaseFieldDef {
  type: 'date';
  defaultToday?: boolean;
  defaultValue?: string;
}

export type CalculatorFieldDef = NumberFieldDef | SelectFieldDef | BooleanFieldDef | DateFieldDef;

export interface NumberInputValue {
  value: string;
  unitId: string;
}

export type FieldInputValue = NumberInputValue | string | boolean;

export type CalculatorInputsState = Record<string, FieldInputValue>;

export interface ValidationError {
  fieldId: string;
  message: string;
}

export interface SecondaryResultItem {
  label: string;
  formattedValue: string;
  unit: string;
  note?: string;
}

export interface ClinicalReference {
  citation: string;
  year: number;
  note?: string;
}

export interface CalculationOutput {
  primaryResult: {
    label: string;
    value: number;
    formattedValue: string;
    unit: string;
  };
  secondaryResults?: SecondaryResultItem[];
  severity: SeverityLevel;
  riskClassification: string;
  clinicalInterpretation: string;
  guidance?: string[];
  guidanceDisclaimer?: string;
  formulaUsed: string;
  inputsSummary: string;
}

export interface CalculatorDefinition {
  id: string;
  name: string;
  shortName: string;
  primarySpecialty: SpecialtyId;
  secondarySpecialties: SpecialtyId[];
  subcategory: SubcategoryId;
  keywords: string[];
  description: string;
  clinicalIndication: string;
  validatedPopulation: string;
  contraindications: string[];
  limitations: string[];
  requiredLabsNote?: string;
  version: string;
  references: ClinicalReference[];
  fields: CalculatorFieldDef[];
  calculate: (inputs: CalculatorInputsState) => CalculationOutput;
}
