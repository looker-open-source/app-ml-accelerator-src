import { Button, ButtonTransparent, Checkbox, DialogContent, DialogFooter, DialogHeader, FieldText, Icon, Label, Select, Tooltip } from '@looker/components'
import { Save } from '@styled-icons/material'
import { Info } from '@styled-icons/material-outlined'
import React, { useState } from 'react'
import { useStore } from '../../../contexts/StoreProvider'
import { getBoostedSettingsDefaults, BOOSTER_TYPE, DART_NORMALIZE_TYPE, DATA_SPLIT_METHOD, showClassWeights, showDataSplitCol, showDataSplitEvalFraction, TREE_METHOD, SettingsLabelsAndTooltips } from '../../../services/advancedSettings'
import { arrayToSelectOptions, floatOnly, numericOnly } from '../../../services/common'
import { MODEL_TYPES } from '../../../services/modelTypes'
import { ClassWeights } from './ClassWeights'


type TooltipLabelProps = {
  setting: string;
}

const TooltipLabel: React.FC<TooltipLabelProps> = ({setting}) => {
  return (
    <Tooltip content={SettingsLabelsAndTooltips[setting].tooltip}>
      <Label>{SettingsLabelsAndTooltips[setting].label}
        <Icon icon={<Info/>} />
      </Label>
    </Tooltip>
  )
}

type BoostedSettingsDialogProps = {
  closeDialog: () => void
}

export const BoostedSettingsDialog: React.FC<BoostedSettingsDialogProps> = ({ closeDialog }) => {
  const { state, dispatch } = useStore()
  const { objective } = state.wizard.steps.step1
  const [ form, setForm ] = useState<any>({
    ...getBoostedSettingsDefaults(objective || ''),
    ...state.wizard.steps.step3.advancedSettings
  })

  const handleSave = () => {
    dispatch({
      type: 'addToStepData',
      step: 'step3',
      data: {
        advancedSettings: {
          ...state.wizard.steps.step3.advancedSettings,
          ...form
        }
      }
    })
    closeDialog()
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

  const resetDefaults = () => {
    setForm({...getBoostedSettingsDefaults(objective || '')})
  }

  return (
    <>
      <DialogHeader hideClose="true" borderBottom="transparent">Advanced Settings</DialogHeader>
      {/* TODO: add a link to the documentation here */}
      {/* https://cloud.google.com/bigquery-ml/docs/reference/standard-sql/bigqueryml-syntax-create-boosted-tree */}
      <DialogContent className="settings-dialog--content">
        <div className="settings-dialog--container modal-pane">
          <form className="settings-dialog-form">
            <div className="form-content">
              <div className="form-row">
                <TooltipLabel setting='boosterType'/>
                <Select
                  options={arrayToSelectOptions(BOOSTER_TYPE)}
                  value={form.booster_type}
                  onChange={(value: string) => handleSelectChange(value, 'booster_type')}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='numberParallelTree'/>
                <FieldText
                  value={form.num_parallel_tree}
                  onChange={(e: any) => handleTextChange(e, 'num_parallel_tree')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              { form.booster_type === 'DART' &&
                <div className="form-row">
                  <TooltipLabel setting='dartNormalizeType'/>
                  <Select
                    options={arrayToSelectOptions(DART_NORMALIZE_TYPE)}
                    value={form.dart_normalize_type}
                    onChange={(value: string) => handleSelectChange(value, 'dart_normalize_type')}
                  />
                </div>
              }
              <div className="form-row">
                <TooltipLabel setting='treeMethod'/>
                <Select
                  options={arrayToSelectOptions(TREE_METHOD)}
                  value={form.tree_method}
                  onChange={(value: string) => handleSelectChange(value, 'tree_method')}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='minimumTreeChildWeight'/>
                <FieldText
                  value={form.min_tree_child_weight}
                  onChange={(e: any) => handleTextChange(e, 'min_tree_child_weight')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='columnSampleByTree'/>
                <FieldText
                  value={form.colsample_bytree}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bytree')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='columnSampleByLevel'/>
                <FieldText
                  value={form.colsample_bylevel}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bylevel')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='columnSampleByNode'/>
                <FieldText
                  value={form.colsample_bynode}
                  onChange={(e: any) => handleTextChange(e, 'colsample_bynode')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='minimumSplitLoss'/>
                <FieldText
                  value={form.min_split_loss}
                  onChange={(e: any) => handleTextChange(e, 'min_split_loss')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='maximumTreeDepth'/>
                <FieldText
                  value={form.max_tree_depth}
                  onChange={(e: any) => handleTextChange(e, 'max_tree_depth')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='subsample'/>
                <FieldText
                  value={form.subsample}
                  onChange={(e: any) => handleTextChange(e, 'subsample')}
                  onKeyPress={floatOnly}
                  description={<span className="tiny-text">Decimal only</span>}
                />
              </div>
              { objective === MODEL_TYPES.BOOSTED_TREE_CLASSIFIER.value &&
                (<>
                  <div className="form-row">
                    <TooltipLabel setting='autoClassWeights'/>
                    <div className="settings-form-checkbox">
                      <Checkbox
                        checked={form.auto_class_weights}
                        onChange={() => handleCheckboxChange('auto_class_weights')}
                      />
                    </div>
                  </div>
                  {
                    showClassWeights(form.auto_class_weights) && (
                      <div className="form-row">
                        <ClassWeights form={form} setForm={setForm} />
                      </div>
                    )
                  }
                </>)
              }
              <div className="form-row">
                <TooltipLabel setting='L1reg'/>
                <FieldText
                  value={form.l1_reg}
                  onChange={(e: any) => handleTextChange(e, 'l1_reg')}
                  onKeyPress={floatOnly}
                  description={<span className="tiny-text">Decimal only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='L2reg'/>
                <FieldText
                  value={form.l2_reg}
                  onChange={(e: any) => handleTextChange(e, 'l2_reg')}
                  onKeyPress={floatOnly}
                  description={<span className="tiny-text">Decimal only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='Earlystop'/>
                <div className="settings-form-checkbox">
                  <Checkbox
                    checked={form.early_stop}
                    onChange={() => handleCheckboxChange('early_stop')}
                  />
                </div>
              </div>
              <div className="form-row">
                <TooltipLabel setting='Learnrate'/>
                <FieldText
                  value={form.learn_rate}
                  onChange={(e: any) => handleTextChange(e, 'learn_rate')}
                  onKeyPress={floatOnly}
                  description={<span className="tiny-text">Decimal only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='MaximumIterations'/>
                <FieldText
                  value={form.max_iterations}
                  onChange={(e: any) => handleTextChange(e, 'max_iterations')}
                  onKeyPress={numericOnly}
                  description={<span className="tiny-text">Numeric only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='MinimumRelativeProgress'/>
                <FieldText
                  value={form.min_rel_progress}
                  onChange={(e: any) => handleTextChange(e, 'min_rel_progress')}
                  onKeyPress={floatOnly}
                  description={<span className="tiny-text">Decimal only</span>}
                />
              </div>
              <div className="form-row">
                <TooltipLabel setting='dataSplitMethod'/>
                <Select
                  options={arrayToSelectOptions(DATA_SPLIT_METHOD)}
                  value={form.data_split_method}
                  onChange={(value: string) => handleSelectChange(value, 'data_split_method')}
                />
              </div>
              {
                showDataSplitEvalFraction(form.data_split_method) &&
                (<div className="form-row">
                  <TooltipLabel setting='dataSplitEvaluationFraction'/>
                  <FieldText
                    value={form.data_split_eval_fraction}
                    onChange={(e: any) => handleTextChange(e, 'data_split_eval_fraction')}
                    onKeyPress={floatOnly}
                    description={<span className="tiny-text">Decimal only</span>}
                  />
                </div>)
              }
              {
                showDataSplitCol(form.data_split_method) &&
                (<div className="form-row">
                  <TooltipLabel setting='dataSplitColumn'/>
                  <Select
                    options={arrayToSelectOptions(state.wizard.steps.step3.selectedFeatures || [])}
                    value={form.data_split_col}
                    onChange={(value: string) => handleSelectChange(value, 'data_split_col')}
                  />
                </div>)
              }
              <div className="form-row">
                <TooltipLabel setting='enableGlobalExplain'/>
                <div className="settings-form-checkbox">
                  <Checkbox
                    checked={form.enable_global_explain}
                    onChange={() => handleCheckboxChange('enable_global_explain')}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
      <DialogFooter className="settings-dialog--footer">
        <div className="settings-dialog--footer-content">
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
          <ButtonTransparent
            color="neutral"
            onClick={resetDefaults}
            className="cancel-button"
          >
              Reset Defaults
          </ButtonTransparent>
        </div>
      </DialogFooter>
    </>
  )
}
