import React from 'react'
import { GlobalExplainDialog } from './GlobalExplainDialog'
import { ExplainProvider } from '../../contexts/ExplainProvider'
import './GlobalExplain.scss'

export const GlobalExplain: React.FC = () => {
  return (
    <ExplainProvider>
      <GlobalExplainDialog />
    </ExplainProvider>
  )
}
