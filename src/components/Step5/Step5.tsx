import React, { useCallback, useContext, useEffect, useState } from 'react'
import withWizardStep from '../WizardStepHOC'
import StepContainer from '../StepContainer'
import { getWizardStepCompleteCallback } from '../../services/wizard'
import './Step5.scss'
import { ApplyContext } from '../../contexts/ApplyProvider'
import { useStore } from '../../contexts/StoreProvider'
import { ExtensionContext2 } from '@looker/extension-sdk-react'
import type { LookerEmbedLook } from '@looker/embed-sdk'
import { LookerEmbedSDK } from '@looker/embed-sdk'
import { Button } from '@looker/components'

const Step5: React.FC<{ stepComplete: boolean }> = ({ stepComplete }) => {
  const { state, dispatch } = useStore()
  const [running, setRunning] = React.useState(true)
  const [isLoading, setIsLoading] = useState(false)
  // const [look, setLook] = React.useState<LookerEmbedLook>()
  // const [generatedEmbed, setGeneratedEmbed] = useState<string>()
  const [embedLook, setEmbedLook] = React.useState<LookerEmbedLook>()
  const { extensionSDK, coreSDK } = useContext(ExtensionContext2)
  const { init } = useContext(ApplyContext)
  const { look: lookState } = state.wizard.steps.step5


  useEffect(() => {
    init?.()
  }, [])

  // useEffect(() => {
  //   if (!look) { return }
  //   const split = look.embedUrl.split('/embed/')
  //   const embedUrl = split[0] +'/embed/looks/' + look.id
  //   setGeneratedEmbed(embedUrl)
  // }, [look])

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
      LookerEmbedSDK.createLookWithId(lookState.id as number)
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
  }, [lookState])

  const runLook = () => {
    if (embedLook) {
      embedLook.run()
    }
  }

  return (
    <StepContainer
      isLoading={isLoading}
      stepComplete={stepComplete}
      stepNumber={5}>
        <Button className="action-button" onClick={runLook} disabled={running}>
          Run Look
        </Button>
        <div className="embed-container" ref={embedCtrRef}></div>
    </StepContainer>
  )
}

export const WizardStep5 = withWizardStep({
  isStepComplete: getWizardStepCompleteCallback("step5"),
  stepNumber: 5
})(Step5)
