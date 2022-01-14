export const MODEL_TYPES = {
  ARIMA_PLUS: {
    label: 'Time series forecasting',
    value: 'ARIMA_PLUS',
    detail: 'ARIMA_PLUS',
    description: 'Univariate time-series forecasting with many modeling components under the hood such as ARIMA model for the trend, STL and ETS for seasonality, holiday effects, and so on.'
  },
  AUTOML_REGRESSOR: {
    label: 'Regression',
    value: 'AUTOML_REGRESSOR',
    detail: 'AUTOML_REGRESSOR',
    description: 'Create a regression model using AutoML Tables.'
  },
  AUTOML_CLASSIFIER: {
    label: 'Classification',
    value: 'AUTOML_CLASSIFIER',
    detail: 'AUTOML_CLASSIFIER',
    description: 'Create a classification model using AutoML Tables.'
  },
  KMEANS: {
    label: 'Clustering',
    value: 'KMEANS',
    detail: 'KMEANS',
    description: 'Create a classification model using AutoML Tables.'
  },
}
