import { SelectedFields } from ".";

export type BQModelState = {
  objective?: string,
  name: string,
  target?: string,
  arimaTimeColumn?: string,
  selectedFeatures?: string[],
  advancedSettings?: any,
  inputDataUID?: "a" | "b",
  inputDataQuery: {
    exploreName?: string,
    modelName?: string,
    exploreLabel?: string,
    limit: string,
    sorts: string[],
    selectedFields: SelectedFields
  },
  binaryClassifier: boolean,
  jobStatus?: string,
  job?: any,
  hasPredictions: boolean,
  predictSettings: any,
  registerVertex: boolean,
  applyQuery: {
    exploreName?: string,
    modelName?: string,
    exploreLabel?: string,
    limit?: string,
    sorts?: string[],
    selectedFields?: SelectedFields
  }
}
