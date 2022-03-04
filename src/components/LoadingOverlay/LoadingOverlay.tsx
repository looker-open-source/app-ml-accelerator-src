import React from 'react'
import Spinner from '../Spinner'

type LoadingOverlayParams = {
  isLoading: boolean
}

export const LoadingOverlay: React.FC<LoadingOverlayParams> = ({
  isLoading
}) => {
  if (!isLoading) { return <></> }

  return (
    <>
      <div className="loading-overlay">
      </div>
      <div className="loading-overlay-spinner-container">
        <Spinner className="loading-overlay-spinner"/>
      </div>
    </>
  )
}
