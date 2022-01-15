import React from 'react'
import Spinner from '../Spinner'

type StepContainerParams = {
  isLoading?: boolean
  children: any
}

export const StepContainer: React.FC<StepContainerParams> = ({ isLoading, children }) => {
  const loadingClass = isLoading ? 'loading' : ''

  return (
    <section className={`step-container ${loadingClass}`}>
      { isLoading &&
        (
          <>
            <div className="step-container-loading-overlay">
            </div>
            <div className="step-container-spinner-container">
              <Spinner className="step-container-spinner"/>
            </div>
          </>
        )
      }
      { children }
    </section>
  )
}
