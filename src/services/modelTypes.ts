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
    modelTabs: [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix, MODEL_EVAL_FUNCS.rocCurve],
    modelFields: {
      [MODEL_EVAL_FUNCS.evaluate]:
        ['mean_absolute_error', 'mean_squared_error', 'mean_squared_log_error',
        'median_absolute_error', 'r2_score', 'explained_variance'].map(
          (field: string) => `boosted_tree_evaluate.${field}`
        )
    }
  },
  BOOSTED_TREE_CLASSIFIER: {
    label: 'Classification',
    value: 'BOOSTED_TREE_CLASSIFIER',
    detail: 'BOOSTED_TREE_CLASSIFIER',
    description: 'I want to classify something',
    exploreName: 'boosted_tree',
    modelTabs: [MODEL_EVAL_FUNCS.evaluate, MODEL_EVAL_FUNCS.confusionMatrix, MODEL_EVAL_FUNCS.rocCurve],
    modelFields: {
      [MODEL_EVAL_FUNCS.evaluate]: ['precision', 'recall', 'accuracy', 'f1_score', 'log_loss', 'roc_auc'].map(
        (field: string) => `boosted_tree_evaluate.${field}`
      )
    }
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
    modelTabs: [MODEL_EVAL_FUNCS.arimaEvaluate],
    modelFields: {
      [MODEL_EVAL_FUNCS.arimaEvaluate]:
        ['non_seasonal_p', 'non_seasonal_d', 'non_seasonal_q', 'has_drift', 'log_likelihood', 'aic', 'variance',
        'seasonal_periods', 'has_holiday_effect', 'has_spikes_and_dips', 'has_step_changes', 'error_message'].map(
          (field: string) => `arima_evaluate.${field}`
        )
    }
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Try Clustering',
    modelTabs: [MODEL_EVAL_FUNCS.evaluate]
  },
}

export const MODEL_VALIDATORS: {[key: string]: any} = {
  BOOSTED_TREE_CLASSIFIER: (data: any[], target: string) => {
    const validationMsgs = []
    const formattedTarget = noDot(target)
    const targetRow = data.filter((rowData: any) => (
      rowData["column_name"].value === formattedTarget
    ))
    if (targetRow.length > 0 && targetRow[0].count_distinct_values.value > 50) {
      validationMsgs.push('Target rows Distinct Values must be less than or equal to 50')
    }
    return validationMsgs
  }
}

export const isArima = (objective: string): boolean => (
  objective === MODEL_TYPES.ARIMA_PLUS.value
)

export const isBoostedTree = (objective: string): boolean => (
  objective === MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value ||
  objective === MODEL_TYPES.BOOSTED_TREE_REGRESSOR.value
)

type IFormSQLProps = {
  uid: string,
  gcpProject: string,
  bqmlModelDatasetName: string,
  bqModelName: string,
  target: string,
  features: string[],
  arimaTimeColumn?: string,
  advancedSettings?: any
}

interface IFormBoostedTreeTypeSQLProps extends IFormSQLProps {
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
}: IFormBoostedTreeTypeSQLProps): string => {
  const settingsSql = advancedSettingsSql(advancedSettings)
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}
          OPTIONS(MODEL_TYPE='BOOSTED_TREE_${boostedType.toUpperCase()}'
          , INPUT_LABEL_COLS = ['${target.replace(".", "_")}']
          ${settingsSql})
    AS SELECT ${features.join(', ')} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid}\`;
  `
}

const formBoostedTreeClassifierSQL = (props: IFormSQLProps): string => {
  return formBoostedTreeSQL({...props, boostedType: 'classifier'})
}

const formBoostedTreeRegressorSQL = (props: IFormSQLProps): string => {
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
}: IFormSQLProps) => {
  if (!arimaTimeColumn) { return '' }
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}
    OPTIONS(MODEL_TYPE = 'ARIMA_PLUS'
      , time_series_timestamp_col = '${arimaTimeColumn.replace(".", "_")}'
      , time_series_data_col = '${target.replace(".", "_")}'
      , HORIZON = ${ advancedSettings.horizon || '1000' }
      ${ advancedSettings.holidayRegion ? `, HOLIDAY_REGION = ${advancedSettings.holidayRegion}` : ''}
      , AUTO_ARIMA = TRUE)
    AS (SELECT ${target.replace(".", "_")}, ${arimaTimeColumn.replace(".", "_")} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data_${uid}\`) ;
  `
}

export const MODEL_TYPE_CREATE_METHOD: { [key: string]: (props: IFormSQLProps) => string } = {
  BOOSTED_TREE_REGRESSOR: formBoostedTreeRegressorSQL,
  BOOSTED_TREE_CLASSIFIER: formBoostedTreeClassifierSQL,
  ARIMA_PLUS: formArimaSQL
}

type BoostedTreePredictProps = {
  lookerSql: string,
  bqmlModelDatasetName: string,
  bqModelName: string
}

export const createBoostedTreePredictSql = ({
  lookerSql,
  bqmlModelDatasetName,
  bqModelName
}: BoostedTreePredictProps) => {
  return `
    CREATE OR REPLACE TABLE ${bqmlModelDatasetName}.${bqModelName}_predictions AS
    ( SELECT * FROM ML.PREDICT(MODEL ${bqmlModelDatasetName}.${bqModelName}, (${lookerSql})))
  `
}

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

type GetBoostedTreePredictProps = {
  bqmlModelDatasetName: string,
  bqModelName: string,
  sorts: string[]
}

export const getBoostedTreePredictSql = ({
  bqmlModelDatasetName,
  bqModelName,
  sorts
}: GetBoostedTreePredictProps) => {
  const sortString = sorts && sorts.length > 0 ? ` ORDER BY ${sorts.map((s) => noDot(s)).join(', ')} ` : ''
  return `
    SELECT * FROM ${bqmlModelDatasetName}.${bqModelName}_predictions ${sortString}
  `
}
