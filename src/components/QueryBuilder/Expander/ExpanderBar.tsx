import React from "react"
import { Chevron } from "../Icons/Chevron"

type ExpanderBarProps = {
  title: string,
  fields?: React.ReactElement[]
  isOpen: boolean
  setIsOpen: () => void
  showFieldsEvenWhenClosed?: boolean
  children?: any
  expanderBodyClasses?: string
  expanderLabelClasses?: string
}

export const ExpanderBar: React.FC<ExpanderBarProps> = ({
  title,
  fields,
  isOpen,
  setIsOpen,
  showFieldsEvenWhenClosed = false,
  children,
  expanderBodyClasses = "",
  expanderLabelClasses = "",
}) => {
  fields = fields?.map((
    field,
    index // if the type is a string, it's probably a dom element and not a component. don't attempt to inject props
  ) =>
    injectPropsIfComponent(field, {
      isParentExpanderOpen: isOpen,
      key: field?.key || "expander-field-" + index,
    })
  );
  return (
    <div
      className={
        "ExpanderBarContents__container " +
        (isOpen ? "expander--open" : "expander--closed")
      }
    >
      <div
        className={`expander-body ${
          isOpen ? "expander-body_open" : ""
        } ${expanderBodyClasses || ""}`}
        onClick={setIsOpen}
      >
        <div
          className={
            "expander-label__text " + (expanderLabelClasses || "")
          }
        >
          <Chevron
            classes={"chevronIcon"}
            rotationDirection={isOpen ? "down" : "right"}
          />
          {title}
        </div>
        {isOpen || showFieldsEvenWhenClosed ? fields : null}
      </div>
      <div
        className={
          isOpen ? "expander-children__visible" : "expander-children"
        }
      >
        {children}
      </div>
    </div>
  );
}

const injectPropsIfComponent = (field: React.ReactElement, props: any) =>  {
  if (typeof field?.type === "string") {
    return field; // it's probably a dom element (div, span, label, etc.) and not a component, so don't try to inject props
  }
  return React.cloneElement(field, props);
}
