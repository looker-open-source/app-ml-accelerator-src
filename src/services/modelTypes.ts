export const MODEL_TYPES: {[key: string]: any} = {
  BOOSTED_TREE_REGRESSOR: {
    label: 'Regression',
    value: 'BOOSTED_TREE_REGRESSOR',
    detail: 'BOOSTED_TREE_REGRESSOR',
    description: 'I want to recommend something',
    targetDataType: 'numeric'
  },
  BOOSTED_TREE_CLASSIFIER: {
    label: 'Classification',
    value: 'BOOSTED_TREE_CLASSIFIER',
    detail: 'BOOSTED_TREE_CLASSIFIER',
    description: 'I want to classify something'
  },
  ARIMA_PLUS: {
    label: 'Time series forecasting',
    value: 'ARIMA_PLUS',
    detail: 'ARIMA_PLUS',
    description: 'I want to forecast a number (e.g. future sales)',
    targetDataType: 'numeric'
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Try Clustering'
  },
}

export const isArima = (objective: string): boolean => (
  objective === MODEL_TYPES.ARIMA_PLUS.value
)

type IFormSQLProps = {
  gcpProject: string,
  bqmlModelDatasetName: string,
  bqModelName: string,
  target: string,
  features: string[],
  arimaTimeColumn?: string
}

interface IFormBoostedTreeTypeSQLProps extends IFormSQLProps {
  boostedType: string
}

const formBoostedTreeSQL = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  target,
  features,
  boostedType
}: IFormBoostedTreeTypeSQLProps): string => {
  // *******
  // TODO: Replace Select * with Select ${feature_fields}
  // *******
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}_boosted_tree_${boostedType.toLowerCase()}
          OPTIONS(MODEL_TYPE='BOOSTED_TREE_${boostedType.toUpperCase()}',
          BOOSTER_TYPE = 'GBTREE',
          INPUT_LABEL_COLS = ['${target.replace(".", "_")}'])
    AS SELECT ${features.join(', ')} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data\`;
  `
}

const formBoostedTreeClassifierSQL = (props: IFormSQLProps): string => {
  return formBoostedTreeSQL({...props, boostedType: 'classifier'})
}

const formBoostedTreeRegressorSQL = (props: IFormSQLProps): string => {
  return formBoostedTreeSQL({...props, boostedType: 'regressor'})
}

const formArimaSQL = ({
  gcpProject,
  bqmlModelDatasetName,
  bqModelName,
  target,
  features,
  arimaTimeColumn
}: IFormSQLProps) => {
  return `
    CREATE OR REPLACE MODEL ${bqmlModelDatasetName}.${bqModelName}_arima
    OPTIONS(MODEL_TYPE = 'ARIMA_PLUS'
      , time_series_timestamp_col = '${arimaTimeColumn}'
      , time_series_data_col = '${target}'
      , HORIZON = 1000
      , HOLIDAY_REGION = 'none'
      , AUTO_ARIMA = TRUE)
    AS (SELECT ${features.join(', ')} FROM \`${gcpProject}.${bqmlModelDatasetName}.${bqModelName}_input_data\`) ;
  `
}

export const MODEL_TYPE_CREATE_METHOD: { [key: string]: (props: IFormSQLProps) => string } = {
  BOOSTED_TREE_REGRESSOR: formBoostedTreeRegressorSQL,
  BOOSTED_TREE_CLASSIFIER: formBoostedTreeClassifierSQL,
  ARIMA_PLUS: formArimaSQL
}
