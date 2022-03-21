import { Button } from '@looker/components'
import { LookerEmbedLook, LookerEmbedSDK } from '@looker/embed-sdk'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import React, { useCallback, useContext, useEffect } from 'react'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { useStore } from '../../contexts/StoreProvider'

export const ArimaPredict: React.FC = () => {
  const [running, setRunning] = React.useState(true)
  const [embedLook, setEmbedLook] = React.useState<LookerEmbedLook>()
  const { extensionSDK } = useContext(ExtensionContext2)
  const { initArima } = useContext(ApplyContext)
  const { state } = useStore()
  const { look } = state.bqModel

  useEffect(() => {
    initArima?.()
  }, [])

  const updateRunButton = (running: boolean) => {
    setRunning(running)
  }

  const setupLook = (alook: LookerEmbedLook) => {
    setEmbedLook(alook)
  }

  const embedCtrRef = useCallback((el) => {
    const hostUrl = extensionSDK?.lookerHostData?.hostUrl
    if (el && hostUrl) {
      LookerEmbedSDK.init(hostUrl)
      LookerEmbedSDK.createLookWithId(look.id as number)
        .appendTo(el)
        .on('look:loaded', updateRunButton.bind(null, false))
        .on('look:run:start', updateRunButton.bind(null, true))
        .on('look:run:complete', updateRunButton.bind(null, false))
        .build()
        .connect()
        .then(setupLook)
        .catch((error: Error) => {
          console.error('Connection error', error)
        })
    }
  }, [look])

  const runLook = () => {
    if (embedLook) {
      embedLook.run()
    }
  }

  return (
    <>
      <Button className="action-button" onClick={runLook} disabled={running}>
        Run Look
      </Button>
      <div className="embed-container" ref={embedCtrRef}></div>
    </>
  )
}
