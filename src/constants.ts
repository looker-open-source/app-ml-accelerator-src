import { WizardSteps } from './types'

export const WIZARD_STEPS: { [key: string]: string } = {
  step1: 'objective',
  step2: 'source',
  step3: 'model',
  step4: 'review',
  step5: 'predict'
}

export const WIZARD_KEYS: { [key: number]: keyof WizardSteps } = {
  1: 'step1',
  2: 'step2',
  3: 'step3',
  4: 'step4',
  5: 'step5',
}

export const JOB_STATUSES: { [key: string]: string } = {
  canceled: 'CANCELED',
  pending: 'PENDING',
  running: 'RUNNING',
  done: 'DONE',
  failed: 'FAILED'
}

export const NAME_CHECK_STATUSES = {
  valid: 'valid',
  warning: 'warning',
  error: 'error'
}

export const REQUIRE_FIELD_MESSAGES: { [key: string]: string } = {
  date_date: 'You must select one date field.',
  numeric: 'You must select one numeric field.'
}

export const MODEL_STATE_TABLE_COLUMNS: { [key: string]: string } = {
  modelName: 'model_info.model_name',
  createdByEmail: 'model_info.created_by_email',
  createdByFirstName: 'model_info.created_by_first_name',
  createdByLastName: 'model_info.created_by_last_name',
  stateJson: 'model_info.state_json',
  sharedWithEmails: 'model_info.shared_with_emails',
  fullEmailList: 'model_info.full_email_list',
  modelCreatedAt: 'model_info.model_created_at',
  modelUpdatedAt: 'model_info.model_updated_at'
}

export const SHARE_PERMISSION_LEVEL: { [key: string]: number } = {
  read: 0,
  edit: 1
}

export const DEFAULT_PREDICT_THRESHOLD = 0.5
export const DEFAULT_ARIMA_CONFIDENCE_LEVEL = 0.95
export const DEFAULT_ARIMA_HORIZON = 1000

export const DESC_STRING = "desc"

// Model and explore where the summary data lives
export const BQML_LOOKER_MODEL = "ml_accelerator"
export const SUMMARY_EXPLORE = "selection_summary"

// user attribute keys from marketplace.json
export const BIGQUERY_CONN = "app_ml_accelerator_bigquery_connection_name"
export const BQML_MODEL_DATASET_NAME = "app_ml_accelerator_bqml_model_dataset_name"
export const GCP_PROJECT = "app_ml_accelerator_gcp_project"
