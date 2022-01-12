import React from "react"
import { useStore } from "../../contexts/StoreProvider"
import { NavLink } from "react-router-dom"
import { WIZARD_STEPS } from "../../constants"

type NavBarProps = {
  url: string
}

export const NavBar : React.FC<NavBarProps> = ({ url }) => {
  const { state, dispatch } = useStore()
  const increaseWizardStep = () => {
    dispatch({
      type: 'setCurrentStep',
      step: state.wizard.currentStep + 1
    })
  }
  return (
    <>
      <button onClick={increaseWizardStep}>Increase</button> {state.wizard.currentStep}
      <nav className="NavBar-container">
        <WizardNavLink
          to={`${url}/${WIZARD_STEPS.step1}`}
          title="Objective" />
        <WizardNavLink
          to={`${url}/${WIZARD_STEPS.step2}`}
          disabled={(state.wizard.currentStep < 2)}
          title="Source" />
        <WizardNavLink
          to={`${url}/${WIZARD_STEPS.step3}`}
          disabled={(state.wizard.currentStep < 3)}
          title="Model" />
        <WizardNavLink
          to={`${url}/${WIZARD_STEPS.step4}`}
          disabled={(state.wizard.currentStep < 4)}
          title="Review" />
        <WizardNavLink
          to={`${url}/${WIZARD_STEPS.step5}`}
          disabled={(state.wizard.currentStep < 5)}
          title="Apply" />
      </nav>
    </>
  )
}

type WizardNavLinkProps = {
  to: string,
  disabled?: boolean,
  title: string
}

export const WizardNavLink : React.FC<WizardNavLinkProps> = ({ to, title, disabled }) => {
  if (disabled) {
    return (
      <div className="NavBar-item disabled">
        { title }
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className="NavBar-item">
      {title}
    </NavLink>
  )
}
