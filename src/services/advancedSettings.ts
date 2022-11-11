import { isFloat } from "./common"
import { MODEL_TYPES } from "./modelTypes"

export const advancedSettingsSql = (advancedSettings: any) => {
  let sql = ''
  for (const key in advancedSettings) {
    let clause = ''
    if (key === 'class_weights') {
      if (showClassWeights(advancedSettings.auto_class_weights) && Object.keys(advancedSettings[key]).length > 0) {
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

  if (!advancedSettings || !Object.getOwnPropertyNames(advancedSettings).includes('enable_global_explain')) {
    sql = sql + ", ENABLE_GLOBAL_EXPLAIN = true"
  }

  if (!advancedSettings || !Object.getOwnPropertyNames(advancedSettings).includes('model_registry')) {
    sql = sql + ", MODEL_REGISTRY = {'VERTEX_AI'}" 
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
// parameter: model_registry {
//   type: quoted
//   default_value: "" # vertex_ai  
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
  subsample: '1.0',
  auto_class_weights: false,
  class_weights: {},
  l1_reg: 0,
  l2_reg: '1.0',
  early_stop: true,
  learn_rate: 0.3,
  max_iterations: 20,
  min_rel_progress: 0.01,
  data_split_method: 'AUTO_SPLIT',
  data_split_eval_fraction: 0.2,
  data_split_col: undefined,
  enable_global_explain: true,
  model_registry: false
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
  subsample: '1.0',
  l1_reg: 0,
  l2_reg: '1.0',
  early_stop: true,
  learn_rate: 0.3,
  max_iterations: 20,
  min_rel_progress: 0.01,
  data_split_method: 'AUTO_SPLIT',
  data_split_eval_fraction: 0.2,
  data_split_col: undefined,
  enable_global_explain: true,
  model_registry: false
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

type tooltipMapping = {
  [key: string]: {
    label: string,
    tooltip: string
  }
}

export const SettingsLabelsAndTooltips: tooltipMapping = {
  boosterType: {
    label: "Booster type", 
    tooltip: "For boosted tree models, specify the booster type to use, with default value 'GBTREE'."
  },
  numberParallelTree: {
    label: "Number parallel trees", 
    tooltip: "Number of parallel trees constructed during each iteration. Default value is 1. To train a boosted random forest, set this value larger than 1."
  },
  dartNormalizeType: {
    label: "Dart normalize type", 
    tooltip: "Type of normalization algorithm for DART booster. Default value is 'TREE'."
  },
  treeMethod: {
    label: "Tree Method", 
    tooltip: "Type of tree construction algorithm. Default value is 'AUTO', but 'HIST' is recommended for large datasets in order to achieve faster training speed and lower resource consumption."
  },
  minimumTreeChildWeight: {
    label: "Minimum tree child weight", 
    tooltip: "Minimum sum of instance weight needed in a child for further partitioning. If the tree partition step results in a leaf node with the sum of instance weight less than 'Minimum tree child weight', then the building process will give up further partitioning. The larger 'Minimum tree child weight' is, the more conservative the algorithm will be. The value should be greater than or equal to 0, with default value 1."
  },
  columnSampleByTree: {
    label: "Column sample by tree", 
    tooltip: "Subsample ratio of columns when constructing each tree. Subsampling occurs once for every tree constructed. The value should be between 0 and 1, with default value 1."
  },
  columnSampleByLevel: {
    label: "Column sample by level", 
    tooltip: "Subsample ratio of columns for each level. Subsampling occurs once for every new depth level reached in a tree. Columns are subsampled from the set of columns chosen for the current tree. The value should be between 0 and 1, with default value 1."
  },
  columnSampleByNode: {
    label: "Column sample by node", 
    tooltip: "Subsample ratio of columns for each node (split). Subsampling occurs once every time a new split is evaluated. Columns are subsampled from the set of columns chosen for the current level. The value should be between 0 and 1, with default value 1."
  },
  minimumSplitLoss: {
    label: "Minimum split loss", 
    tooltip: "Minimum loss reduction required to make a further partition on a leaf node of the tree. The larger 'Minimum split loss' is, the more conservative the algorithm will be. Default value is 0."
  },
  maximumTreeDepth: {
    label: "Maximum tree depth", 
    tooltip: "Maximum depth of a tree. Default value is 6."
  },
  subsample: {
    label: "Subsample", 
    tooltip: "Subsample ratio of the training instances. Setting this value to 0.5 means that training randomly samples half of the training data prior to growing trees, which prevents overfitting. Subsampling will occur once in every boosting iteration. This is independent of the training-test data split used in the training options (80/20 random by default)."
  },
  autoClassWeights: {
    label: "Auto class weights", 
    tooltip: "Whether to balance class labels using weights for each class in inverse proportion to the frequency of that class."
  },
  L1reg: {
    label: "L1 reg", 
    tooltip: "The amount of L1 regularization applied."
  },
  L2reg: {
    label: "L2 reg", 
    tooltip: "The amount of L2 regularization applied."
  },
  Earlystop: {
    label: "Early stop", 
    tooltip: "Whether training should stop after the first iteration in which the relative loss improvement is less than the value specified for 'Minimum relative progress'."
  },
  Learnrate: {
    label: "Learn rate", 
    tooltip: "Learn rate is the step size shrinkage used in update to prevents overfitting. After each boosting step, learn_rate shrinks the feature weights to make the boosting process more conservative."
  },
  MaximumIterations: {
    label: "Maximum iterations", 
    tooltip: "The maximum number of rounds for boosting."
  },
  MinimumRelativeProgress: {
    label: "Minimum relative progress", 
    tooltip: "The minimum relative loss improvement that is necessary to continue training when 'Early stop' is set to true. For example, a value of 0.01 specifies that each iteration must reduce the loss by 1% for training to continue."
  },
  dataSplitMethod: {
    label: "Data split method", 
    tooltip: "The method to split input data into training and evaluation sets. Training data is used to train the model. Evaluation data is used to avoid overfitting due to early stopping."
  },
  dataSplitEvaluationFraction: {
    label: "Data split evaluation fraction", 
    tooltip: "This option is used with 'RANDOM' and 'SEQ' splits. It specifies the fraction of the data used for evaluation, accurate to two decimal places."
  },
  dataSplitColumn: {
    label: "Data split column", 
    tooltip: "Identifies the column used to split the data. This column cannot be used as a feature or label, and will be excluded from features automatically."
  },
  enableGlobalExplain: {
    label: "Enable global explain", 
    tooltip: "Whether to compute global explanations using explainable AI to evaluate global feature importance to the model."
  },
  modelRegistry: {
    label: "Vertex AI model registry",
    tooltip: "Use Vertex AI model registry"
  }
}
