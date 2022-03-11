import {
  advancedSettingsSql, BOOSTED_SETTINGS_DEFAULTS
} from "../../services/advancedSettings";


test(`
advancedSettings
- no advancedSettings
`, () => {
  expect(advancedSettingsSql({})).toEqual(", BOOSTER_TYPE = 'GBTREE'")
})

test(`
advancedSettings
- default advancedSettings
`, () => {
  expect(advancedSettingsSql(BOOSTED_SETTINGS_DEFAULTS)).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'AUTO_SPLIT' , ENABLE_GLOBAL_EXPLAIN = false "
  )
})

test(`
advancedSettings
- data_split_method = 'RANDOM', 'CUSTOM', 'SEQ'
`, () => {
  expect(advancedSettingsSql({...BOOSTED_SETTINGS_DEFAULTS, data_split_method: 'RANDOM', data_split_eval_fraction: .2 })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'RANDOM' , DATA_SPLIT_EVAL_FRACTION = 0.2 , ENABLE_GLOBAL_EXPLAIN = false "
  )
  expect(advancedSettingsSql({...BOOSTED_SETTINGS_DEFAULTS, data_split_method: 'CUSTOM', data_split_col: 'users_age' })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'CUSTOM' , DATA_SPLIT_COL = 'users_age' , ENABLE_GLOBAL_EXPLAIN = false "
  )
  expect(advancedSettingsSql({...BOOSTED_SETTINGS_DEFAULTS, data_split_method: 'SEQ', data_split_eval_fraction: .2, data_split_col: 'users_age' })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'SEQ' , DATA_SPLIT_EVAL_FRACTION = 0.2 , DATA_SPLIT_COL = 'users_age' , ENABLE_GLOBAL_EXPLAIN = false "
  )
  expect(advancedSettingsSql({...BOOSTED_SETTINGS_DEFAULTS, data_split_method: 'AUTO_SPLIT', data_split_eval_fraction: .2, data_split_col: 'users_age' })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'AUTO_SPLIT' , ENABLE_GLOBAL_EXPLAIN = false "
  )
})

test(`
advancedSettings
- class weights
`, () => {
  expect(advancedSettingsSql({ ...BOOSTED_SETTINGS_DEFAULTS, auto_class_weights: true, class_weights: { 'users_age': .2, 'users_city': .8 } })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'AUTO_SPLIT' , ENABLE_GLOBAL_EXPLAIN = false "
  )
  expect(advancedSettingsSql({ ...BOOSTED_SETTINGS_DEFAULTS, auto_class_weights: false, class_weights: { 'users_age': .2, 'users_city': .8 } })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , NUM_PARALLEL_TREE = 1 , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYLEVEL = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = false , CLASS_WEIGHTS = [STRUCT('users_age', 0.2), STRUCT('users_city', 0.8)] , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'AUTO_SPLIT' , ENABLE_GLOBAL_EXPLAIN = false "
  )
})

test(`
advancedSettings
- undefined Settings
`, () => {
  expect(advancedSettingsSql({ ...BOOSTED_SETTINGS_DEFAULTS, num_parallel_tree: undefined, colsample_bylevel: undefined })).toEqual(
    ", BOOSTER_TYPE = 'GBTREE' , DART_NORMALIZE_TYPE = 'TREE' , TREE_METHOD = 'AUTO' , MIN_TREE_CHILD_WEIGHT = 1 , COLSAMPLE_BYTREE = 1 , COLSAMPLE_BYNODE = 1 , MIN_SPLIT_LOSS = 0 , MAX_TREE_DEPTH = 6 , SUBSAMPLE = 1 , AUTO_CLASS_WEIGHTS = true , L1_REG = 0 , L2_REG = 0 , EARLY_STOP = true , LEARN_RATE = 0.3 , MAX_ITERATIONS = 20 , MIN_REL_PROGRESS = 0.01 , DATA_SPLIT_METHOD = 'AUTO_SPLIT' , ENABLE_GLOBAL_EXPLAIN = false "
  )
})
