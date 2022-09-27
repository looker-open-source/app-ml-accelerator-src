import { DEFAULT_ARIMA_HORIZON } from "../constants"
import { advancedSettingsSql } from "./advancedSettings"
import { noDot } from "./string"
import { removeLimit } from "./summary"

export const MODEL_EVAL_FUNCS: { [key: string]: string } = {
  trainingInfo: 'trainingInfo',
  evaluate: 'evaluate',
  arimaEvaluate: 'arimaEvaluate',
  confusionMatrix: 'confusionMatrix',
  rocCurve: 'rocCurve'
}

export const MODEL_TABS: { [key: string]: string } = {
  [MODEL_EVAL_FUNCS.trainingInfo]: 'TRAINING INFO',
  [MODEL_EVAL_FUNCS.evaluate]: 'EVALUATE',
  [MODEL_EVAL_FUNCS.arimaEvaluate]: 'ARIMA EVALUATE',
  [MODEL_EVAL_FUNCS.confusionMatrix]: 'CONFUSION MATRIX',
  [MODEL_EVAL_FUNCS.rocCurve]: 'ROC CURVE'
}

export const MODEL_TYPES: { [key: string]: any } = {
  BOOSTED_TREE_REGRESSOR: {
    label: 'Predict a Value',
    value: 'BOOSTED_TREE_REGRESSOR',
    detail: 'BOOSTED_TREE_REGRESSOR',
    techLabel: 'Regression',
    description: 'Train a model to predict numeric values.',
    requiredFieldTypes: ['numeric'],
    targetDataType: 'numeric',
    exploreName: 'boosted_tree',
    modelTabs: () => [MODEL_EVAL_FUNCS.evaluate]
  },
  BOOSTED_TREE_CLASSIFIER: {
    label: 'Predict a Category',
    value: 'BOOSTED_TREE_CLASSIFIER',
    detail: 'BOOSTED_TREE_CLASSIFIER',
    techLabel: 'Classification',
    description: 'Train a model to predict a class or category.',
    exploreName: 'boosted_tree',
    modelTabs: (isBinary: boolean) => (
      isBinary ?
        [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix, MODEL_EVAL_FUNCS.rocCurve] :
        [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix]
    )
  },
  // ARIMA_PLUS: {
  //   label: 'Forecast Time-based Values',
  //   value: 'ARIMA_PLUS',
  //   detail: 'ARIMA_PLUS',
  //   techLabel: 'Time-series Forecasting',
  //   description: 'Train a model to predict future values from historical data',
  //   requiredFieldTypes: ['date_date', 'numeric'],
  //   exploreName: 'arima',
  //   targetDataType: 'numeric',
  //   optionalParameters: true,
  //   modelTabs: () => [MODEL_EVAL_FUNCS.arimaEvaluate]
  // },
  // KMEANS: {
  //   label: 'Clustering',
  //   value: 'KMEANS',
  //   detail: 'KMEANS',
  //   description: 'Try Clustering',
  //   modelTabs: () => [MODEL_EVAL_FUNCS.evaluate]
  // },
}

export const isArima = (objective: string): boolean => (
  objective === 'ARIMA_PLUS'
)

export const isBoostedTree = (objective: string): boolean => (
  objective === MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value ||
  objective === MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value
)

export const isClassifier = (objective: string): boolean => (
  objective === MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value
)

export const TABLE_SUFFIXES: { [key: string]: string } = {
  evaluate: '_evaluate',
  confusionMatrix: '_confusion_matrix',
  rocCurve: '_roc_curve',
  inputData: '_input_data',
  predictions: '_predictions',
  globalExplainModel: '_global_explain_model',
  globalExplainClass: '_global_explain_class'
}

/********************/
/* INPUT_DATA SQL */
/********************/

type FormBQInputDataSQLProps = {
  sql: string | undefined,
  bqmlModelDatasetName: string | undefined,
  bqModelName: string | undefined,
  uid: string | undefined
}

export const formBQInputDataSQL = ({
  sql,
  bqmlModelDatasetName,
  bqModelName,
  uid
}: FormBQInputDataSQLProps) => {
  if (
    !sql ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }

  if (uid === 'a' || uid === 'selected') {
    return `CREATE OR REPLACE VIEW ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid} AS (${removeLimit(sql)})`
  }
  return `CREATE OR REPLACE TABLE ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid} AS (${removeLimit(sql)})`
}

type GetBQInputDataSqlProps = {
  bqmlModelDatasetName: string,
  bqModelName: string,
  uid: string,
  limit?: string
}

export const getBQInputDataSql = ({
  bqmlModelDatasetName,
  bqModelName,
  uid,
  limit
}: GetBQInputDataSqlProps) => (
  `SELECT * FROM ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid} ${limit ? `LIMIT ${limit}` : ''}`
)

export const getBQInputDataMetaDataSql = ({
  bqmlModelDatasetName,
  bqModelName,
  uid
}: GetBQInputDataSqlProps) => (
  `SELECT * FROM ${bqmlModelDatasetName}.INFORMATION_SCHEMA.TABLES WHERE table_name = '${bqModelName}${TABLE_SUFFIXES.inputData}_${uid}'`
)

type GetAllBQInputDataSqlProps = {
  bqmlModelDatasetName: string,
  bqModelName: string
}

export const getAllInputDataTablesSql = ({
  bqmlModelDatasetName,
  bqModelName
}: GetAllBQInputDataSqlProps) => (
  `SELECT table_name FROM ${bqmlModelDatasetName}.INFORMATION_SCHEMA.TABLES WHERE table_name like '${bqModelName}${TABLE_SUFFIXES.inputData}_%'`
)

/********************/
/* MODEL CREATE SQL */
/********************/
type IFormModelCreateSQLProps = {
  uid: string,
  gcpProject: string,
  bqmlModelDatasetName: string,
  bqModelName: string,
  target: string,
  features: string[],
  arimaTimeColumn?: string,
  advancedSettings?: any
}

interface IFormBoostedTreeModelCreateSQLProps extends IFormModelCreateSQLProps {
  boostedType: string
}

const formBoostedTreeSQL = ({
  uid,
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  target,
  features,
  boostedType,
  advancedSettings
}: IFormBoostedTreeModelCreateSQLProps): string => {
  const settingsSql = advancedSettingsSql(advancedSettings)
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}
          OPTIONS(MODEL_TYPE='BOOSTED_TREE_${boostedType.toUpperCase()}'
          , INPUT_LABEL_COLS = ['${target.replace(".", "_")}']
          ${settingsSql})
    AS SELECT ${features.join(', ')} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid}\`;
  `
}

const formBoostedTreeClassifierSQL = (props: IFormModelCreateSQLProps): string => {
  return formBoostedTreeSQL({ ...props, boostedType: 'classifier' })
}

const formBoostedTreeRegressorSQL = (props: IFormModelCreateSQLProps): string => {
  return formBoostedTreeSQL({ ...props, boostedType: 'regressor' })
}

const formArimaSQL = ({
  uid,
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  target,
  advancedSettings = {},
  arimaTimeColumn
}: IFormModelCreateSQLProps) => {
  if (!arimaTimeColumn) { return '' }
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}
    OPTIONS(MODEL_TYPE = 'ARIMA_PLUS'
      , time_series_timestamp_col = '${arimaTimeColumn.replace(".", "_")}'
      , time_series_data_col = '${target.replace(".", "_")}'
      , HORIZON = ${advancedSettings.horizon || DEFAULT_ARIMA_HORIZON}
      ${advancedSettings.holidayRegion ? `, HOLIDAY_REGION = '${advancedSettings.holidayRegion}'` : ''}
      , AUTO_ARIMA = TRUE)
    AS (SELECT ${target.replace(".", "_")}, ${arimaTimeColumn.replace(".", "_")} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid}\`) ;
  `
}

export const MODEL_TYPE_CREATE_METHOD: { [key: string]: (props: IFormModelCreateSQLProps) => string } = {
  BOOSTED_TREE_REGRESSOR: formBoostedTreeRegressorSQL,
  BOOSTED_TREE_CLASSIFIER: formBoostedTreeClassifierSQL,
  ARIMA_PLUS: formArimaSQL
}


/********************/
/* EVALUATE SQL */
/********************/

type FormEvaluateSqlProps = {
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName: string,
  target?: string,
}

export const formEvaluateSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
}: FormEvaluateSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName
  ) {
    return false
  }

  return `CREATE OR REPLACE VIEW
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.evaluate} AS (
    SELECT *
    FROM ML.EVALUATE(
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}
    ))
  `
}

type FormConfusionMatrixSqlProps = {
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName: string,
  uid?: string
  selectedFeatures: string[],
  threshold?: string
}

export const formConfusionMatrixSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  uid,
  selectedFeatures,
  threshold
}: FormConfusionMatrixSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }
  return `CREATE OR REPLACE VIEW
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.confusionMatrix} AS (
    SELECT *
    FROM ML.CONFUSION_MATRIX (
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      (SELECT ${selectedFeatures.join(', ')}
      FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid})
      ${threshold ?
      `, STRUCT(${threshold} as threshold)` : ''
    }
    ))
  `
}

type FormROCCurveSqlProps = {
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName: string,
  uid?: string
  selectedFeatures: string[]
}

export const formROCCurveSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  uid,
  selectedFeatures
}: FormROCCurveSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }
  return `CREATE OR REPLACE VIEW
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.rocCurve} AS (
    SELECT *
    FROM ML.ROC_CURVE(
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      (SELECT ${selectedFeatures.join(', ')}
      FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.inputData}_${uid})
    ))
  `
}

type FormArimaEvaluateSqlProps = {
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName: string,
  uid?: string
}

export const formArimaEvaluateSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  uid
}: FormArimaEvaluateSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }
  return `CREATE OR REPLACE VIEW
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.evaluate} AS (
    SELECT *
    FROM ML.ARIMA_EVALUATE(
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      STRUCT(FALSE AS show_all_candidate_models)
    ))
  `
}

export const EVALUATE_CREATE_SQL_METHODS: { [key: string]: (props: any) => string | false } = {
  [MODEL_EVAL_FUNCS.evaluate]: formEvaluateSql,
  [MODEL_EVAL_FUNCS.confusionMatrix]: formConfusionMatrixSql,
  [MODEL_EVAL_FUNCS.rocCurve]: formROCCurveSql,
  [MODEL_EVAL_FUNCS.arimaEvaluate]: formArimaEvaluateSql
}

type GetEvaluateDataSqlProps = {
  evalFuncName: string,
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName?: string,
}

export const getEvaluateDataSql = ({
  evalFuncName,
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
}: GetEvaluateDataSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName
  ) {
    return false
  }

  let tableSuffix = TABLE_SUFFIXES.evaluate
  switch (evalFuncName) {
    case MODEL_EVAL_FUNCS.confusionMatrix:
      tableSuffix = TABLE_SUFFIXES.confusionMatrix
      break
    case MODEL_EVAL_FUNCS.rocCurve:
      tableSuffix = TABLE_SUFFIXES.rocCurve
      break
  }

  return `SELECT * FROM ${gcpProject}.${bqmlModelDatasetName}.${bqModelName}${tableSuffix}`
}

/*********************/
/* GLOBAL EXPLAIN */
/*********************/


type BoostedTreeGlobalExplainProps = {
  gcpProject: string
  bqmlModelDatasetName: string,
  bqModelName: string,
  classLevelExplain?: boolean
}

export const createClassifierGlobalExplainSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  classLevelExplain
}: BoostedTreeGlobalExplainProps) => {
  const suffix = classLevelExplain ? TABLE_SUFFIXES.globalExplainClass : TABLE_SUFFIXES.globalExplainModel
  return `
    CREATE OR REPLACE VIEW
      \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${suffix} AS (
      SELECT *
      FROM ML.GLOBAL_EXPLAIN(
        MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
        STRUCT(${classLevelExplain ? 'TRUE' : 'FALSE'} AS class_level_explain)
      )
    )
  `
}

export const createRegressorGlobalExplainSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName
}: BoostedTreeGlobalExplainProps) => {
  return `
    CREATE OR REPLACE VIEW
      \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.globalExplainModel} AS (
      SELECT *
      FROM ML.GLOBAL_EXPLAIN(
        MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}
      )
    )
  `
}

export const selectBoostedTreeGlobalExplainSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  classLevelExplain
}: BoostedTreeGlobalExplainProps) => {
  const suffix = classLevelExplain ? TABLE_SUFFIXES.globalExplainClass : TABLE_SUFFIXES.globalExplainModel
  return `
    SELECT * FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}${suffix}
  `
}


/********************/
/* PREDICT SQL */
/********************/

type BoostedTreePredictProps = {
  lookerSql: string,
  bqmlModelDatasetName: string,
  bqModelName: string,
  threshold?: string
}

export const createBoostedTreePredictSql = ({
  lookerSql,
  bqmlModelDatasetName,
  bqModelName,
  threshold
}: BoostedTreePredictProps) => {
  return `
    CREATE OR REPLACE VIEW ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.predictions} AS
    ( SELECT * FROM ML.PREDICT(
      MODEL ${bqmlModelDatasetName}.${bqModelName},
      (${removeLimit(lookerSql)})
      ${threshold ?
      `, STRUCT(${threshold} as threshold)` : ''
    }))
  `
}

type ArimaPredictProps = {
  bqmlModelDatasetName: string,
  bqModelName: string,
  horizon?: number,
  confidenceLevel?: number
}

export const createArimaPredictSql = ({
  bqmlModelDatasetName,
  bqModelName,
  horizon = 30,
  confidenceLevel = 0.95
}: ArimaPredictProps) => {
  return `
    CREATE OR REPLACE VIEW ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.predictions} AS
    ( SELECT * FROM ML.FORECAST(MODEL ${bqmlModelDatasetName}.${bqModelName}
      , STRUCT(${horizon} AS horizon
      , ${confidenceLevel} AS confidence_level)))
  `
}

type GetPredictProps = {
  bqmlModelDatasetName: string,
  bqModelName: string,
  sorts: string[],
  limit?: string
}

export const getPredictSql = ({
  bqmlModelDatasetName,
  bqModelName,
  sorts,
  limit
}: GetPredictProps) => {
  const sortString = sorts && sorts.length > 0 ? ` ORDER BY ${sorts.map((s) => noDot(s)).join(', ')} ` : ''
  return `
    SELECT * FROM ${bqmlModelDatasetName}.${bqModelName}${TABLE_SUFFIXES.predictions} ${sortString} LIMIT ${limit || 500}
  `
}

type TEvaluationInfo = {
  [key: string]: {
    tooltip: string,
    subtitle: string,
    highIsBad: boolean
  }
}

export const evaluationAdditionalInfo: TEvaluationInfo = {
  "precision": {
    tooltip: "The fraction of classification predictions produced by the model that were correct.",
    subtitle: "Higher is Better",
    highIsBad: false
  },
  "recall": {
    tooltip: "The fraction of predictions with this class that the model correctly predicted. Also called true positive rate.",
    subtitle: "Higher is Better",
    highIsBad: false
  },
  "accuracy": {
    tooltip: "Foo Bar Bat Baz", // TODO
    subtitle: "Higher is Better",
    highIsBad: false
  },
  "f1_score": {
    tooltip: "The harmonic mean of precision and recall. F1 is a useful metric if you're looking for a balance between precision and recall and there's an uneven class distribution.",
    subtitle: "Higher is Better",
    highIsBad: false
  },
  "log_loss": {
    tooltip: "The cross-entropy between the model predictions and the target values. This ranges from zero to infinity, where a lower value indicates a higher-quality model.",
    subtitle: "Lower is Better",
    highIsBad: true
  },
  "roc_auc": {
    tooltip: "The area under receiver operating characteristic curve. This ranges from zero to one, where a higher value indicates a higher-quality model.",
    subtitle: "Higher is Better",
    highIsBad: false
  },
}