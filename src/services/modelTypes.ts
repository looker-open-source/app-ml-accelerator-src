export const MODEL_TYPES = {
  BOOSTED_TREE_REGRESSOR: {
    label: 'Regression',
    value: 'BOOSTED_TREE_REGRESSOR',
    detail: 'BOOSTED_TREE_REGRESSOR',
    description: 'Create a Boosted Tree Regressor model using the XGBoost library'
  },
  BOOSTED_TREE_CLASSIFIER: {
    label: 'Classification',
    value: 'BOOSTED_TREE_CLASSIFIER',
    detail: 'BOOSTED_TREE_CLASSIFIER',
    description: 'Create a Boosted Tree Classifier model using the XGBoost library.'
  },
  ARIMA_PLUS: {
    label: 'Time series forecasting',
    value: 'ARIMA_PLUS',
    detail: 'ARIMA_PLUS',
    description: 'Univariate time-series forecasting with many modeling components under the hood such as ARIMA model for the trend, STL and ETS for seasonality, holiday effects, and so on.'
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Create a classification model using AutoML Tables.'
  },
}
