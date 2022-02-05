export const MODEL_TYPES = {
  BOOSTED_TREE_REGRESSOR: {
    label: 'Regression',
    value: 'BOOSTED_TREE_REGRESSOR',
    detail: 'BOOSTED_TREE_REGRESSOR',
    description: 'I want to recommend something'
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
    description: 'I want to forecast a number (e.g. future sales)'
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Try Clustering'
  },
}

type IFormSQLProps = {
  gcpProject: string,
  lookerTempDatasetName: string,
  bqModelName: string,
  target: string,
}

interface IFormBoostedTreeTypeSQLProps extends IFormSQLProps {
  boostedType: string
}

const formBoostedTreeSQL = ({
  gcpProject,
  lookerTempDatasetName,
  bqModelName,
  target,
  boostedType
}: IFormBoostedTreeTypeSQLProps): string => {
  return `
    CREATE MODEL ${lookerTempDatasetName}.${bqModelName}_boosted_tree_${boostedType.toLowerCase()}
          OPTIONS(MODEL_TYPE='BOOSTED_TREE_${boostedType.toUpperCase()}',
          BOOSTER_TYPE = 'GBTREE',
          INPUT_LABEL_COLS = ['${target}'])
    AS SELECT * FROM \`${gcpProject}.${lookerTempDatasetName}.${bqModelName}_input_data\`;
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
  lookerTempDatasetName,
  bqModelName,
  target
}: IFormSQLProps) => {
  // ******
  // TODO: What is 'user_selected_time_column'??????
  // ******
  return `
    CREATE OR REPLACE MODEL ${lookerTempDatasetName}.${bqModelName}_arima
    OPTIONS(MODEL_TYPE = 'ARIMA_PLUS'
      , time_series_timestamp_col = 'user_selected_time_column'
      , time_series_data_col = '${target}'
      , HORIZON = 1000
      , HOLIDAY_REGION = 'none'
      , AUTO_ARIMA = TRUE)
    AS (SELECT * FROM \`${gcpProject}.${lookerTempDatasetName}.${bqModelName}_input_data\`) ;
  `
}

export const MODEL_TYPE_CREATE_METHOD: { [key: string]: (props: IFormSQLProps) => string } = {
  BOOSTED_TREE_REGRESSOR: formBoostedTreeRegressorSQL,
  BOOSTED_TREE_CLASSIFIER: formBoostedTreeClassifierSQL,
  ARIMA_PLUS: formArimaSQL
}
