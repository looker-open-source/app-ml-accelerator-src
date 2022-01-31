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

export const DESC_STRING = "desc"
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/bigquery'

// user attribute keys from marketplace.json
export const BIGQUERY_CONN = "bigquery_connection_name"
export const GOOGLE_CLIENT_ID = "google_client_id"
