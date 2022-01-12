import React from "react"
import { NavLink } from "react-router-dom"
import { WIZARD_STEPS } from "../../constants"

type NavBarProps = {
  url: string,
  currentStep: number
}

export const NavBar : React.FC<NavBarProps> = ({ url, currentStep }) => {
  return (
    <nav className="NavBar-container">
      <WizardNavLink
        to={`${url}/${WIZARD_STEPS.step1}`}
        title={WIZARD_STEPS.step1} />
      <WizardNavLink
        to={`${url}/${WIZARD_STEPS.step2}`}
        disabled={(currentStep < 2)}
        title={WIZARD_STEPS.step2} />
      <WizardNavLink
        to={`${url}/${WIZARD_STEPS.step3}`}
        disabled={(currentStep < 3)}
        title={WIZARD_STEPS.step3} />
      <WizardNavLink
        to={`${url}/${WIZARD_STEPS.step4}`}
        disabled={(currentStep < 4)}
        title={WIZARD_STEPS.step4} />
      <WizardNavLink
        to={`${url}/${WIZARD_STEPS.step5}`}
        disabled={(currentStep < 5)}
        title={WIZARD_STEPS.step5} />
    </nav>
  )
}

type WizardNavLinkProps = {
  to: string,
  disabled?: boolean,
  title: string
}

const WizardNavLink : React.FC<WizardNavLinkProps> = ({ to, title, disabled }) => {
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
