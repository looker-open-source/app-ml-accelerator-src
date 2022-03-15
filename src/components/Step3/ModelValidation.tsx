import React, { useEffect, useState } from 'react'
import { MODEL_TYPES, MODEL_VALIDATORS } from '../../services/modelTypes'

type ModelValidationProps = {
  setIsInvalid: (isValid: boolean) => void,
  target?: string,
  objective?: string,
  data?: any[]
}

export const ModelValidation: React.FC<ModelValidationProps> = ({ setIsInvalid, target, objective, data }) => {
  const [ validationMsgs, setValidationMsgs ] = useState<string[]>([])

  useEffect(() => {
    if (
      !target || !objective || !data ||
      !MODEL_VALIDATORS[objective]) {
      setIsInvalid(false)
      return
    }
    const msgs = MODEL_VALIDATORS[objective](data, target)
    setIsInvalid(msgs && msgs.length > 0)
    setValidationMsgs(msgs || [])
  }, [data, target])

  if (validationMsgs.length <= 0) {
    return (<></>)
  }

  if (!target || !objective || !data) { return (<></>) }

  return (
    <div className="model-validations">
      {
        validationMsgs.map((msg: string, i: number) => (
          <div className="model-validations-msg" key={i}>
            <b>{ `${MODEL_TYPES[objective].label} Model Type:` }</b> { msg }
          </div>
        ))
      }
    </div>
  )
}
