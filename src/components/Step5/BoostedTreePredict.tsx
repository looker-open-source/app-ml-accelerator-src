import { Button } from '@looker/components'
import { LookerEmbedLook, LookerEmbedSDK } from '@looker/embed-sdk'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import React, { useCallback, useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { useStore } from '../../contexts/StoreProvider'

export const BoostedTreePredict: React.FC = () => {
  const { state, dispatch } = useStore()
  const { step2, step5 } = state.wizard.steps

  return (
    <div>hi</div>
  )
}
