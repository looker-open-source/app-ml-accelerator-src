export const determineWizardStep = (wizard) => {
  let currentStep = 1
  for (const step in Object.keys(wizard.steps).sort()) {
    if (hasNoEmptyValues(wizard[step])) {
      currentStep + 1
    } else {
      return currentStep
    }
  }

  return currentStep
}

export const hasNoEmptyValues = (obj) => {
  for (const key in obj) {
    if (!obj[key]) { return false }
  }
  return true
}
