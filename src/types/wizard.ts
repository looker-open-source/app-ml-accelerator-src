export type WizardState = {
  currentStep: number,
  steps: {
    step1: Step1State,
    step2: Step2State,
    step3: Step3State,
    step4: Step4State,
    step5: Step5State
  }
}

export type Step1State = {
  objective: string | undefined
}

export type Step2State = {
  exploreName: string | undefined,
  modelName: string | undefined,
  exploreLabel: string | undefined
}

export type Step3State = {
  data: any
}

export type Step4State = {
  data: any
}

export type Step5State = {
  data: any
}
