import { View, Field } from '../types'

function isMatchingFieldGroup(group1: Field, group2: Field): boolean {
  if (
      !(
          group1 &&
          group1.type == "field_group" &&
          group2 &&
          group2.type == "field_group"
      )
  ) {
      return false;
  }
  if (group1.label !== group2.label) {
      return false;
  }
  if (group1.isHidden || group2.isHidden) {
      return false;
  }
  return true;
}

/**
* Given an explore field selection hierarchy, coalesce field groups with matching labels
* under a single field group. This is required as different views can define fields as belonging
* to the same field group, and in the field selection for the explore, these fields should
* appear under a common field group.
*
* @param {Map<string, Object>} fields - map representing tiers of field hierarchy. These
* tiers can be dimensions/measures, but also field groups
*
* @returns {Map<string, Object>} map representing tiers of field hierarchy, with like
* field groups coalesced
*/
function concatFieldGroupsWithSameLabel(fields: [string, Field][]) {
  const fieldGroupsWithSameLabelGrouped = fields.reduce(
      (acc: any, [label, tier]) => {
          if (isMatchingFieldGroup(acc[label], tier)) {
              // we've found field groups with matching labels, combine their fields
              const currFieldMap = acc[label].fields;
              acc[label].fields = new Map([...currFieldMap, ...tier.fields]);
          } else {
              // otherwise do not modify field selection tier
              acc[label] = tier;
          }
          return acc;
      },
      {}
  );
  return Object.entries(fieldGroupsWithSameLabelGrouped);
}

type ExcludeEmptyViewsProps = {
  dimensions: Field[],
  measures: Field[],
  parameters: Field[]
}

function excludeEmptyViews({ dimensions, measures, parameters }: ExcludeEmptyViewsProps): boolean {
  const isViewEmpty =
      dimensions.length + measures.length + parameters.length === 0;
  return !isViewEmpty;
}

export function collapseViewsWithSameLabel(viewsArr: [string, View][]): Map<string, View> {
  // creates a new Map by label instead of name, combining view objects with the same labels. contains less data that the full view object
  const viewsMap = viewsArr.reduce((accumulator, [, view]) => {
    if (accumulator.get(view.label)) {
      // there's already an entry by this label, combine the views (for display purposes only)
      const preexistingView = accumulator.get(view.label);
      let combinedView = {
        label: view.label,
        name: "combined_view_" + preexistingView.name + "_" + view.name,
        dimensions: [...preexistingView.dimensions, ...view.dimensions],
        measures: [...preexistingView.measures, ...view.measures],
        parameters: [...preexistingView.parameters, ...view.parameters],
      };
      accumulator.set(view.label, combinedView); // replace the preexisting view with the combination of that plus this new one
    } else {
      // no view by this label, insert it
      accumulator.set(view.label, {
        label: view.label,
        name: view.name,
        dimensions: [...view.dimensions],
        measures: [...view.measures],
        parameters: [...view.parameters],
      });
    }
    return accumulator;
  }, new Map());

  let viewsMapGroupedByLabel: View[] = [];
  viewsMap.forEach((view) => {
    viewsMapGroupedByLabel.push({
      ...view,
      dimensions: concatFieldGroupsWithSameLabel(view.dimensions),
      measures: concatFieldGroupsWithSameLabel(view.measures),
    });
  });

  // we don't want to show view labels at the top level of the field selection pane
  // that don't have any fields inside of them, so filter out empty views. Looker
  // does the same in the Explore view
  viewsMapGroupedByLabel = viewsMapGroupedByLabel.filter(excludeEmptyViews);

  return new Map(
    viewsMapGroupedByLabel.map((viewMap) => [viewMap.label, viewMap])
  );
}
