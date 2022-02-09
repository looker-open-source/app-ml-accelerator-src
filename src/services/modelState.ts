import { WizardState } from "../types"

export const generateModelState = (state: WizardState) => {
  const { step1, step2, step3, step4 } = state.steps
  const modelStateToSave = {
    currentStep: state.currentStep,
    step1: step1,
    step2: {
      exploreName: step2.exploreName,
      modelName: step2.modelName,
      exploreLabel: step2.exploreLabel,
      limit: step2.limit,
      selectedFields: step2.selectedFields,
      sorts: step2.sorts
    },
    step3: {
      bqModelName: step3.bqModelName,
      targetField: step3.targetField,
      arimaTimeColumn: step3.arimaTimeColumn,
      selectedFields: step3.selectedFields,
    },
    step4: {
      job: step4.job
    }
  }
  return modelStateToSave
}
