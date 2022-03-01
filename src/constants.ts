import { WizardSteps } from './types'

export const WIZARD_STEPS: { [key: string]: string } = {
  step1: 'objective',
  step2: 'source',
  step3: 'model',
  step4: 'review',
  step5: 'apply'
}

export const WIZARD_KEYS: {[key: number]: keyof WizardSteps} = {
  1: 'step1',
  2: 'step2',
  3: 'step3',
  4: 'step4',
  5: 'step5',
}

export const JOB_STATUSES: {[key: string]: string} = {
  canceled: 'CANCELED',
  pending: 'PENDING',
  running: 'RUNNING',
  done: 'DONE'
}

export const NAME_CHECK_STATUSES = {
  valid: 'valid',
  warning: 'warning',
  error: 'error'
}

export const REQUIRE_FIELD_MESSAGES: {[key: string]: string} = {
  date_date: 'You must select one date field.',
  numeric: 'You must select one numeric field.'
}

export const MODEL_STATE_TABLE_COLUMNS: {[key:string]: string} = {
  modelName: 'model_info.model_name',
  createdByEmail: 'model_info.created_by_email',
  stateJson: 'model_info.state_json'
}

export const DESC_STRING = "desc"
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/bigquery'

// Model and explore where the summary data lives
export const BQML_LOOKER_MODEL="bqml_extension"
export const SUMMARY_EXPLORE="selection_summary"

// user attribute keys from marketplace.json
export const BIGQUERY_CONN = "bigquery_connection_name"
export const GOOGLE_CLIENT_ID = "google_client_id"
export const BQML_MODEL_DATASET_NAME = "bqml_model_dataset_name"
export const GCP_PROJECT = "gcp_project"


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
