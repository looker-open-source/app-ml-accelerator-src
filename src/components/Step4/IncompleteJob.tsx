import React from 'react'
import { Icon } from '@looker/components'
import { Alarm, Close } from '@styled-icons/material'
import { CancelModelButton } from './CancelModelButton'
import { TimeRunning } from './TimeRunning'
import './Step4.scss'

type IncompleteJobProps = {
  jobCanceled: boolean,
  setIsLoading: (value: boolean) => void,
  startTime?: number
}

export const IncompleteJob: React.FC<IncompleteJobProps> = ({ jobCanceled, setIsLoading, startTime }) => {
  return jobCanceled ? (
    <div className="model-job-canceled">
      <div className="model-job-canceled--contents">
        {/* @ts-ignore */}
        <Icon icon={<Close />} size="large" className="model-job-canceled--icon"/>
        <h2>Model Canceled</h2>
        <p>The creation of this model has been canceled. Go back to the previous step to re-create the model.</p>
      </div>
    </div>
  ) : (
    <div className="model-job-pending">
      <div className="model-job-pending--contents">
        {/* @ts-ignore */}
        <Icon icon={<Alarm />} size="large" className="model-job-pending--icon"/>
        <h2>Creating Model...</h2>
        <p>This process may take a few minutes to several hours to complete. You can close your browser tab and return later to check on its progress.</p>
        <TimeRunning startTime={startTime} />
        <CancelModelButton setIsLoading={setIsLoading}/>
      </div>
    </div>
  )
}
