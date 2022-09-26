import { noDot } from "./string"

type ValidatorFunction = (targetRow: any | undefined) => string | undefined

export const MODEL_VALIDATORS: {[key: string]: any} = {
  BOOSTED_TREE_CLASSIFIER: (data: any[], target: string) => {
    return validatorExecuter(data, target, [noNullsValidation, countDistinctValidation])
  },
  BOOSTED_TREE_REGRESSOR: (data: any[], target: string) => {
    return validatorExecuter(data, target, [noNullsValidation])
  },
}

const validatorExecuter = (data: any[], target: string, validators: ValidatorFunction[]) => {
  const validationMsgs: string[] = []
  const targetRow = getTargetRow(data, target)
  validators.forEach((validator: ValidatorFunction) => {
    const msg = validator(targetRow)
    msg && validationMsgs.push(msg)
  })
  return validationMsgs
}

const getTargetRow = (data: any[], target: string) => {
  const formattedTarget = noDot(target)
  return data.filter((rowData: any) => (
    rowData["column_name"].value === formattedTarget
  ))
}

const noNullsValidation = (targetRow: any | undefined) => {
  if (targetRow.length > 0 && targetRow[0].count_nulls.value > 0) {
    return 'Missing % for target row(s) must be 0%. Return to "Source" tab and filter out null values'
  }
}

const countDistinctValidation = (targetRow: any | undefined) => {
  if (targetRow.length > 0 && targetRow[0].count_distinct_values.value > 50) {
    return 'Distinct Values for target row(s) must be less than or equal to 50'
  }
}
