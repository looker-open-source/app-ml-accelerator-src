import { isFloat } from "./common"
import { MODEL_TYPES } from "./modelTypes"

export const advancedSettingsSql = (advancedSettings: any) => {
  let sql = ''
  for (const key in advancedSettings) {
    let clause = ''
    if (key === 'class_weights') {
      if (showClassWeights(advancedSettings.auto_class_weights)) {
        clause = `, ${key.toUpperCase()} = ${classWeightSql(advancedSettings[key])}`
      }
    } else if (key === 'data_split_eval_fraction' &&
      !showDataSplitEvalFraction(advancedSettings.data_split_method)) {
        continue
    } else if (key === 'data_split_col' &&
      !showDataSplitCol(advancedSettings.data_split_method)) {
        continue
    } else if (key === 'dart_normalize_type' &&
      !showDartNormalizeType(advancedSettings.booster_type)) {
        continue
    } else if (advancedSettings[key] !== undefined) {
      const value = quotedSettings.includes(key) ?
        `'${advancedSettings[key]}'` :
        `${advancedSettings[key]}`
      clause = `, ${key.toUpperCase()} = ${value} `
    }
    sql = sql + clause
  }

  if (!advancedSettings || !advancedSettings.booster_type) {
    sql = sql + ", BOOSTER_TYPE = 'GBTREE'"
  }

  if (!advancedSettings) {
    sql = sql + ", ENABLE_GLOBAL_EXPLAIN = TRUE"
  }

  return sql
}

const classWeightSql = (classWeights: any): string => {
  let sql = ''
  for (const key in classWeights) {
    if (!isFloat(classWeights[key])) { continue }
    sql = sql ? sql + `, STRUCT('${key}', ${classWeights[key]})` : `STRUCT('${key}', ${classWeights[key]})`
  }
  return '[' + sql + '] '
}

const quotedSettings = [
  "data_split_method",
  "data_split_col",
  "booster_type",
  "dart_normalize_type",
  "tree_method"
]

// BOOSTED TREE ADVANCED SETTINGS
export const BOOSTER_TYPE = ['GBTREE', 'DART']
// parameter: booster_type {
//   type: unquoted
//   default_value: "GBTREE" # {'GBTREE' | 'DART'}
// }

// parameter: num_parallel_tree {
//   type: unquoted
//   default_value: "1" # int64_value
// }

export const DART_NORMALIZE_TYPE = ['TREE', 'FOREST']
// parameter: dart_normalize_type {
//   type: unquoted
//   default_value: "TREE" # {'TREE' | 'FOREST'}
// }

export const TREE_METHOD = ['AUTO', 'EXACT', 'APPROX', 'HIST']
// parameter: tree_method {
//   type: unquoted
//   default_value: "AUTO" # {'AUTO' | 'EXACT' | 'APPROX' | 'HIST'}
// }
// parameter: min_tree_child_weight {
//   type: unquoted
//   default_value: "1" # int64_value
// }
// parameter: colsample_bytree {
//   type: unquoted
//   default_value: "1" # int64_value
// }
// parameter: colsample_bylevel {
//   type: unquoted
//   default_value: "1" # int64_value
// }
// parameter: colsample_bynode {
//   type: unquoted
//   default_value: "1" # int64_value
// }
// parameter: min_split_loss {
//   type: unquoted
//   default_value: "0" # int64_value
// }
// parameter: max_tree_depth {
//   type: unquoted
//   default_value: "6" # int64_value
// }
// parameter: subsample {
//   type: unquoted
//   default_value: "1.0"
// }
// parameter: auto_class_weights {
//   type: unquoted
//   default_value: "TRUE" # { TRUE | FALSE }
// }
// parameter: class_weights {
//   type: unquoted
//   default_value: "" # [STRUCT('example_label', .2)]
//   # Can't be used when auto_class_weights = TRUE
// }
// parameter: l1_reg {
//   type: unquoted
//   default_value: "0" # float64_value
// }
// parameter: l2_reg {
//   type: unquoted
//   default_value: "0" # float64_value
// }
// parameter: early_stop {
//   type: unquoted
//   default_value: "TRUE" # { TRUE | FALSE }
// }
// parameter: learn_rate {
//   type: unquoted
//   default_value: "0.3" # float64_value
// }
// parameter: max_iterations {
//   type: unquoted
//   default_value: "20" # int64_value
// }
// parameter: min_rel_progress {
//   type: unquoted
//   default_value: "0.01" # float64_value
// }
export const DATA_SPLIT_METHOD = ['AUTO_SPLIT', 'RANDOM', 'CUSTOM', 'SEQ', 'NO_SPLIT']
// parameter: data_split_method {
//   type: unquoted
//   default_value: "AUTO_SPLIT" # { 'AUTO_SPLIT' | 'RANDOM' | 'CUSTOM' | 'SEQ' | 'NO_SPLIT' }
// }

// parameter: data_split_eval_fraction {
//   type: unquoted
//   default_value: "0.2" # float64_value
//   ## Only used when data_split_method = 'RANDOM'|'SEQ'
// }
// parameter: data_split_col {
//   type: unquoted
//   default_value: "" # string_value
//   ## Only used when data_split_method = 'CUSTOM'|'SEQ'
// }
// parameter: enable_global_explain {
//   type: unquoted
//   default_value: "FALSE" # { TRUE | FALSE }
// }

const BOOSTED_CLASSIFIER_SETTINGS_DEFAULTS = {
  booster_type: 'GBTREE',
  num_parallel_tree: 1,
  dart_normalize_type: 'TREE',
  tree_method: 'AUTO',
  min_tree_child_weight: 1,
  colsample_bytree: 1,
  colsample_bylevel: 1,
  colsample_bynode: 1,
  min_split_loss: 0,
  max_tree_depth: 6,
  subsample: 1.0,
  auto_class_weights: true,
  class_weights: {},
  l1_reg: 0,
  l2_reg: 0,
  early_stop: true,
  learn_rate: 0.3,
  max_iterations: 20,
  min_rel_progress: 0.01,
  data_split_method: 'AUTO_SPLIT',
  data_split_eval_fraction: 0.2,
  data_split_col: undefined,
  enable_global_explain: true
}

const BOOSTED_REGRESSOR_SETTINGS_DEFAULTS = {
  booster_type: 'GBTREE',
  num_parallel_tree: 1,
  dart_normalize_type: 'TREE',
  tree_method: 'AUTO',
  min_tree_child_weight: 1,
  colsample_bytree: 1,
  colsample_bylevel: 1,
  colsample_bynode: 1,
  min_split_loss: 0,
  max_tree_depth: 6,
  subsample: 1.0,
  l1_reg: 0,
  l2_reg: 0,
  early_stop: true,
  learn_rate: 0.3,
  max_iterations: 20,
  min_rel_progress: 0.01,
  data_split_method: 'AUTO_SPLIT',
  data_split_eval_fraction: 0.2,
  data_split_col: undefined,
  enable_global_explain: true
}

export const getBoostedSettingsDefaults = (objective: string) => {
  if (objective === MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value) {
    return BOOSTED_REGRESSOR_SETTINGS_DEFAULTS
  }
  return BOOSTED_CLASSIFIER_SETTINGS_DEFAULTS
}

export const showClassWeights = (auto_class_weights: boolean) => (!auto_class_weights)
export const showDataSplitEvalFraction = (data_split_method: string) => (data_split_method === 'RANDOM' || data_split_method === 'SEQ')
export const showDataSplitCol = (data_split_method: string) => (data_split_method === 'CUSTOM' || data_split_method === 'SEQ')
export const showDartNormalizeType = (booster_type: string) => booster_type === 'DART'

// ARIMA ADVANCED SETTINGS
export const HOLIDAY_REGION_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'GLOBAL', label: 'Global' },
  { value: 'NA', label: 'North America' },
  { value: 'JAPAC', label: 'Japan and Asia Pacific' },
  { value: 'EMEA', label: 'Europe, the Middle East and Africa' },
  { value: 'LAC', label: 'Latin America and the Caribbean' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AT', label: 'Austria' },
  { value: 'AU', label: 'Australia' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CA', label: 'Canada' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CZ', label: 'Czechia' },
  { value: 'DE', label: 'Germany' },
  { value: 'DK', label: 'Denmark' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EE', label: 'Estonia' },
  { value: 'EG', label: 'Egypt' },
  { value: 'ES', label: 'Spain' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'GR', label: 'Greece' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HU', label: 'Hungary' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IN', label: 'India' },
  { value: 'IR', label: 'Iran' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'LV', label: 'Latvia' },
  { value: 'MA', label: 'Morocco' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NO', label: 'Norway' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'RO', label: 'Romania' },
  { value: 'RS', label: 'Serbia' },
  { value: 'RU', label: 'Russia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'SE', label: 'Sweden' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'US', label: 'United States' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'ZA', label: 'South Africa' }
]
