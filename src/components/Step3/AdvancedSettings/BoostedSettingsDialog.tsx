import { Button, ButtonTransparent, Checkbox, DialogContent, DialogFooter, DialogHeader, FieldText, Label, Select } from '@looker/components'
import { Save } from '@styled-icons/material'
import { values } from 'lodash'
import React, { useState } from 'react'
import { BOOSTED_SETTINGS_DEFAULTS, BOOSTER_TYPE, DART_NORMALIZE_TYPE, DATA_SPLIT_METHOD, TREE_METHOD } from '../../../services/advancedSettings'
import { alphaNumericOnly, arrayToSelectOptions, floatOnly, numericOnly } from '../../../services/common'
import Spinner from '../../Spinner'
import { ClassWeights } from './ClassWeights'

type BoostedSettingsDialogProps = {
  closeDialog: () => void
}

export const BoostedSettingsDialog: React.FC<BoostedSettingsDialogProps> = ({ closeDialog }) => {
  const [ form, setForm ] = useState<any>(BOOSTED_SETTINGS_DEFAULTS)
  console.log({ form })

  const handleSave = () => {
    closeDialog()
    return true
  }

  const handleSelectChange = (value: string, formKey: string) => {
    setForm({
      ...form,
      [formKey]: value
    })
  }

  const handleTextChange = (e: any, formKey: string) => {
    setForm({
      ...form,
      [formKey]: e.target.value
    })
  }

  const handleCheckboxChange = (formKey: string) => {
    setForm({
      ...form,
      [formKey]: !form[formKey]
    })
  }

  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent">Advanced Settings</DialogHeader>
      <DialogContent className="settings-dialog--content">
        <div className="settings-dialog--container modal-pane">
          <form className="settings-dialog-form">
            <div className="form-content">
              <div className="form-row">
                <Label>
                  Booster Type
                </Label>
                <Select
                  options={arrayToSelectOptions(BOOSTER_TYPE)}
                  value={form.booster_type}
                  onChange={(value: string) => handleSelectChange(value, 'booster_type')}
                />
              </div>
              <div className="form-row">
                <Label>
                  Num Parallel Tree
                </Label>
                <FieldText
                  value={form.num_parallel_tree}
                  onChange={(e: any) => handleTextChange(e, 'num_parallel_tree')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Dart Normalize Type
                </Label>
                <Select
                  options={arrayToSelectOptions(DART_NORMALIZE_TYPE)}
                  value={form.dart_normalize_type}
                  onChange={(value: string) => handleSelectChange(value, 'dart_normalize_type')}
                />
              </div>
              <div className="form-row">
                <Label>
                  Tree Method
                </Label>
                <Select
                  options={arrayToSelectOptions(TREE_METHOD)}
                  value={form.tree_method}
                  onChange={(value: string) => handleSelectChange(value, 'tree_method')}
                />
              </div>
              <div className="form-row">
                <Label>
                  Min Tree Child Weight
                </Label>
                <FieldText
                  value={form.min_tree_child_weight}
                  onChange={(e: any) => handleTextChange(e, 'min_tree_child_weight')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Col sample by tree
                </Label>
                <FieldText
                  value={form.colsample_bytree}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bytree')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Col sample by level
                </Label>
                <FieldText
                  value={form.colsample_bylevel}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bylevel')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Col sample by node
                </Label>
                <FieldText
                  value={form.colsample_bynode}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bynode')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Min split loss
                </Label>
                <FieldText
                  value={form.min_split_loss}
                  onChange={(e: any) => handleTextChange(e, 'min_split_loss')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Max Tree Depth
                </Label>
                <FieldText
                  value={form.max_tree_depth}
                  onChange={(e: any) => handleTextChange(e, 'max_tree_depth')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Subsample
                </Label>
                <FieldText
                  value={form.subsample}
                  onChange={(e: any) => handleTextChange(e, 'subsample')}
                  onKeyPress={floatOnly}
                  description={<span>Float only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Auto class weights
                </Label>
                <div className="settings-form-checkbox">
                  <Checkbox
                    checked={form.auto_class_weights}
                    onChange={() => handleCheckboxChange('auto_class_weights')}
                  />
                </div>
              </div>
              {
                !form.auto_class_weights && (
                  <div className="form-row">
                    <ClassWeights form={form} setForm={setForm} />
                  </div>
                )
              }
              <div className="form-row">
                <Label>
                  L1 reg
                </Label>
                <FieldText
                  value={form.l1_reg}
                  onChange={(e: any) => handleTextChange(e, 'l1_reg')}
                  onKeyPress={floatOnly}
                  description={<span>Float only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  L2 reg
                </Label>
                <FieldText
                  value={form.l2_reg}
                  onChange={(e: any) => handleTextChange(e, 'l2_reg')}
                  onKeyPress={floatOnly}
                  description={<span>Float only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Early stop
                </Label>
                <div className="settings-form-checkbox">
                  <Checkbox
                    checked={form.early_stop}
                    onChange={() => handleCheckboxChange('early_stop')}
                  />
                </div>
              </div>
              <div className="form-row">
                <Label>
                  Learn rate
                </Label>
                <FieldText
                  value={form.learn_rate}
                  onChange={(e: any) => handleTextChange(e, 'learn_rate')}
                  onKeyPress={floatOnly}
                  description={<span>Float only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Max iterations
                </Label>
                <FieldText
                  value={form.max_iterations}
                  onChange={(e: any) => handleTextChange(e, 'max_iterations')}
                  onKeyPress={numericOnly}
                  description={<span>Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Min rel progress
                </Label>
                <FieldText
                  value={form.min_rel_progress}
                  onChange={(e: any) => handleTextChange(e, 'min_rel_progress')}
                  onKeyPress={floatOnly}
                  description={<span>Float only</span>}
                />
              </div>
              <div className="form-row">
                <Label>
                  Data split method
                </Label>
                <Select
                  options={arrayToSelectOptions(DATA_SPLIT_METHOD)}
                  value={form.data_split_method}
                  onChange={(value: string) => handleSelectChange(value, 'data_split_method')}
                />
              </div>
              {
                (form.data_split_method === 'RANDOM' || form.data_split_method === 'SEQ') &&
                (<div className="form-row">
                  <Label>
                    Data split eval fraction
                  </Label>
                  <FieldText
                    value={form.data_split_eval_fraction}
                    onChange={(e: any) => handleTextChange(e, 'data_split_eval_fraction')}
                    onKeyPress={floatOnly}
                    description={<span>Float only</span>}
                  />
                </div>)
              }
              {
                (form.data_split_method === 'CUSTOM' || form.data_split_method === 'SEQ') &&
                (<div className="form-row">
                  <Label>
                    Data split col
                  </Label>
                  <FieldText
                    value={form.data_split_eval_fraction}
                    onChange={(e: any) => handleTextChange(e, 'data_split_eval_fraction')}
                    onKeyPress={floatOnly}
                    description={<span>Float only</span>}
                  />
                </div>)
              }
              <div className="form-row">
                <Label>
                  Enable Global Explain
                </Label>
                <div className="settings-form-checkbox">
                  <Checkbox
                    checked={form.early_stop}
                    onChange={() => handleCheckboxChange('enable_global_explain')}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
      <DialogFooter className="settings-dialog--footer">
        <div className="settings-dialog--buttons">
          <ButtonTransparent
            color="neutral"
            onClick={closeDialog}
            className="cancel-button"
          >
              Cancel
          </ButtonTransparent>
          <Button
            className="action-button"
            color="key"
            iconBefore={<Save />}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

// type AdvancedSettingsSelectProps = {
//   options: string[],
//   value: string | number,
//   placeHolder:
// }

// export const AdvancedSettingsSelect: React.FC<AdvancedSettingsSelectProps> = ({ options, value }) => {

//   return (
//     <Select
//       options={options}
//       value={value}
//       placeholder="Target"
//       onChange={handleTargetChange}
//       className="wizard-card-select"
//     />
//   )
// }
