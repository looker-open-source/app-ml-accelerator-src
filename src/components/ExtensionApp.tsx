import React from 'react'
import './ExtensionApp.scss'
import TitleBar from './TitleBar'

export const ExtensionApp: React.FC = () => {

  return (
    <div className='bqml-app'>
      <TitleBar></TitleBar>
      BQML App
    </div>
  )
}

export default ExtensionApp
