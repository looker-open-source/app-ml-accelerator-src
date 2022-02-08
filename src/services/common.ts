import { find } from 'lodash'

export const findFieldDetail = (fieldDetails: any, fieldName: string) => {
  const allFields = [
    ...fieldDetails.dimensions || [],
    ...fieldDetails.measures || [],
    ...fieldDetails.parameters || [],
  ]

  return find(allFields, {name: fieldName})
}

type pollProps = {
  fn: (props: any) => Promise<any>,
  props: any,
  validate: (result: any) => boolean,
  interval: number,
  maxAttempts?: number
}

export const poll = ({
  fn, props, validate, interval, maxAttempts
}: pollProps): {
  promise: Promise<any>,
  cancel: () => void
} => {
  let canceled = false
  const cancel = () => canceled = true
  const executeWrapper = async() => {
    let attempts = 0

    const executePoll = async (resolve: any, reject: any) => {
      console.log('Attempt #' + attempts)
      const result = await fn(props)
      attempts++

      if (validate(result)) {
        return resolve(result)
      } else if (maxAttempts && attempts === maxAttempts) {
        return reject(new Error('Exceeded max attempts'))
      } else if (canceled) {
        console.log('resolving the cancelation')
        return resolve({ canceled: true })
      } else {
        setTimeout(executePoll, interval, resolve, reject);
      }
    };

    return new Promise(executePoll);
  }
  return { promise: executeWrapper(), cancel }
};
