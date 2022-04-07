import { DEFAULT_ARIMA_HORIZON } from "../constants"
import { advancedSettingsSql } from "./advancedSettings"
import { noDot } from "./string"
import { removeLimit } from "./summary"

export const MODEL_EVAL_FUNCS: {[key:string]: string} = {
  trainingInfo: 'trainingInfo',
  evaluate: 'evaluate',
  arimaEvaluate: 'arimaEvaluate',
  confusionMatrix: 'confusionMatrix',
  rocCurve: 'rocCurve'
}

export const MODEL_TABS: {[key:string]: string} = {
  [MODEL_EVAL_FUNCS.trainingInfo]: 'ML.TRAINING_INFO',
  [MODEL_EVAL_FUNCS.evaluate]: 'ML.EVALUATE',
  [MODEL_EVAL_FUNCS.arimaEvaluate]: 'ML.ARIMA_EVALUATE',
  [MODEL_EVAL_FUNCS.confusionMatrix]: 'ML.CONFUSION_MATRIX',
  [MODEL_EVAL_FUNCS.rocCurve]: 'ML.ROC_CURVE'
}

export const MODEL_TYPES: {[key: string]: any} = {
  BOOSTED_TREE_REGRESSOR: {
    label: 'Regression',
    value: 'BOOSTED_TREE_REGRESSOR',
    detail: 'BOOSTED_TREE_REGRESSOR',
    description: 'I want to recommend something',
    requiredFieldTypes: ['numeric'],
    targetDataType: 'numeric',
    exploreName: 'boosted_tree',
    modelTabs: () => [MODEL_EVAL_FUNCS.evaluate]
  },
  BOOSTED_TREE_CLASSIFIER: {
    label: 'Classification',
    value: 'BOOSTED_TREE_CLASSIFIER',
    detail: 'BOOSTED_TREE_CLASSIFIER',
    description: 'I want to classify something',
    exploreName: 'boosted_tree',
    modelTabs: (isBinary: boolean) => (
      isBinary ?
        [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix, MODEL_EVAL_FUNCS.rocCurve] :
        [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix]
    )
  },
  ARIMA_PLUS: {
    label: 'Time series forecasting',
    value: 'ARIMA_PLUS',
    detail: 'ARIMA_PLUS',
    description: 'I want to forecast a number (e.g. future sales)',
    requiredFieldTypes: ['date_date', 'numeric'],
    exploreName: 'arima',
    targetDataType: 'numeric',
    optionalParameters: true,
    modelTabs: () => [MODEL_EVAL_FUNCS.arimaEvaluate]
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Try Clustering',
    modelTabs: () => [MODEL_EVAL_FUNCS.evaluate]
  },
}

export const isArima = (objective: string): boolean => (
  objective === MODEL_TYPES.ARIMA_PLUS.value
)

export const isBoostedTree = (objective: string): boolean => (
  objective === MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value ||
  objective === MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value
)



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
  return `CREATE OR REPLACE TABLE ${bqmlModelDatasetName}.${bqModelName}_input_data_${uid} AS (${removeLimit(sql)})`
}

type GetBQInputDataSqlProps = {
  bqmlModelDatasetName: string,
  bqModelName: string,
  uid: string
}

export const getBQInputDataSql = ({
  bqmlModelDatasetName,
  bqModelName,
  uid
}: GetBQInputDataSqlProps) => (
  `SELECT * FROM ${bqmlModelDatasetName}.${bqModelName}_input_data_${uid}`
)

export const getBQInputDataMetaDataSql = ({
  bqmlModelDatasetName,
  bqModelName,
  uid
}: GetBQInputDataSqlProps) => (
  `SELECT * FROM ${bqmlModelDatasetName}.INFORMATION_SCHEMA.TABLES WHERE table_name = '${bqModelName}_input_data_${uid}'`
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
    AS SELECT ${features.join(', ')} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid}\`;
  `
}

const formBoostedTreeClassifierSQL = (props: IFormModelCreateSQLProps): string => {
  return formBoostedTreeSQL({...props, boostedType: 'classifier'})
}

const formBoostedTreeRegressorSQL = (props: IFormModelCreateSQLProps): string => {
  return formBoostedTreeSQL({...props, boostedType: 'regressor'})
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
      , HORIZON = ${ advancedSettings.horizon || DEFAULT_ARIMA_HORIZON }
      ${ advancedSettings.holidayRegion ? `, HOLIDAY_REGION = ${advancedSettings.holidayRegion}` : ''}
      , AUTO_ARIMA = TRUE)
    AS (SELECT ${target.replace(".", "_")}, ${arimaTimeColumn.replace(".", "_")} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid}\`) ;
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
  uid?: string
  selectedFeatures: string[]
}

export const formEvaluateSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  uid,
  selectedFeatures
}: FormEvaluateSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }
  return `CREATE OR REPLACE TABLE
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_evaluate AS (
    SELECT *
    FROM ML.EVALUATE(
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      (SELECT ${selectedFeatures.join(', ')}
      FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid})
    ))
  `
}

type FormConfusionMatrixSqlProps = {
  gcpProject?: string,
  bqmlModelDatasetName?: string,
  bqModelName: string,
  uid?: string
  selectedFeatures: string[]
}

export const formConfusionMatrixSql = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  uid,
  selectedFeatures
}: FormConfusionMatrixSqlProps) => {
  if (
    !gcpProject ||
    !bqmlModelDatasetName ||
    !bqModelName ||
    !uid
  ) {
    return false
  }
  return `CREATE OR REPLACE TABLE
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_confusion_matrix AS (
    SELECT *
    FROM ML.CONFUSION_MATRIX (
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      (SELECT ${selectedFeatures.join(', ')}
      FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid})
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
  return `CREATE OR REPLACE TABLE
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_roc_curve AS (
    SELECT *
    FROM ML.ROC_CURVE(
      MODEL \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName},
      (SELECT ${selectedFeatures.join(', ')}
      FROM \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid})
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
  return `CREATE OR REPLACE TABLE
    \`${gcpProject}\`.${bqmlModelDatasetName}.${bqModelName}_evaluate AS (
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

  let tableSuffix = '_evaluate'
  switch (evalFuncName) {
    case MODEL_EVAL_FUNCS.confusionMatrix:
      tableSuffix = '_confusion_matrix'
      break
    case MODEL_EVAL_FUNCS.rocCurve:
      tableSuffix = '_roc_curve'
      break
  }

  return `SELECT * FROM ${gcpProject}.${bqmlModelDatasetName}.${bqModelName}${tableSuffix}`
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
    CREATE OR REPLACE TABLE ${bqmlModelDatasetName}.${bqModelName}_predictions AS
    ( SELECT * FROM ML.PREDICT(
      MODEL ${bqmlModelDatasetName}.${bqModelName},
      (${removeLimit(lookerSql)})
      ${ threshold && `, STRUCT(${threshold} as threshold)` }))
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
    CREATE OR REPLACE TABLE ${bqmlModelDatasetName}.${bqModelName}_predictions AS
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
    SELECT * FROM ${bqmlModelDatasetName}.${bqModelName}_predictions ${sortString} LIMIT ${limit || 500}
  `
}
