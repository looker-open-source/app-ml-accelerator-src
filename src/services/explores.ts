import { Looker40SDK as LookerSDK } from "@looker/sdk"
import { ILookmlModel, ILookmlModelExploreField } from "@looker/sdk/lib/4.0/models"
import { compact } from 'lodash'
import { getBigQueryConnectionName } from './userAttributes'

/*
* Fetch all explores and associated models and sort them
*/
export async function fetchSortedModelsAndExplores(extensionSDK: any, sdk: LookerSDK): Promise<any[]> {
  try {
    const connectionName = await getBigQueryConnectionName(extensionSDK)
    const { value: result } = await sdk.all_lookml_models({})
    const modelExplores = (result || [])
      .filter(
        (model: ILookmlModel) =>
          model.explores?.length &&
            model.label !== "System Activity" &&
            model.allowed_db_connection_names.indexOf(connectionName) >= 0
      )
      .sort(alphabeticSortByLabel)
      .map((model: ILookmlModel) => ({
        name: model.name,
        label: model.label,
        explores: compact((model.explores || [])
          .map((view) => {
            if (view.hidden) { return null }
            return {
              name: view.name,
              label: view.label,
            }
          }))
          .sort(alphabeticSortByLabel),
      }))
    return modelExplores
  } catch (error) {
      throw new Error(error)
  }
}

function alphabeticSortByLabel(obj1: any, obj2: any) {
  const label1 = obj1.label.toLowerCase()
  const label2 = obj2.label.toLowerCase()
  return label1 < label2 ? -1 : 1
}

/*
* returns a filtered list of explores/models that contain textValue
*/
export const filterExplores = (textValue: string | null, modelsArray: ILookmlModel[]): ILookmlModel[] => {
  if (!textValue) {
    return modelsArray
  }
  var resultsArr: ILookmlModel[] = []

  modelsArray.forEach((model) => {
    if (
      model.label &&
      model.label.toLowerCase().indexOf(textValue.toLowerCase()) >= 0
    ) {
      // Title match.
      resultsArr.push(model)
      return
    }

    var filteredModel: ILookmlModel = {
      label: model.label,
      name: model.name,
      explores: [],
    }

    model.explores?.forEach((explore) => {
      if (
        explore.label &&
        explore.label.toLowerCase().indexOf(textValue.toLowerCase()) >= 0
      ) {
        filteredModel.explores?.push(explore)
      }
    })

    if (filteredModel.explores?.length || 0 > 0) {
      resultsArr.push(filteredModel)
    }
  })

  return resultsArr;
}

export async function fetchExplore(sdk: LookerSDK, modelName: string, exploreName: string) {
  try {
    return await sdk.lookml_model_explore(
      modelName,
      exploreName
    );
  } catch (error) {
    throw new Error("Error loading explore " + error);
  }
};

/**
 * Converts the raw JSON explore data into the subset of data that this app cares about.
 * Organizes fields by their respective view
 * @param {*} rawExploreData The raw JSON object response from fetching an explore
 */
 export function mapAPIExploreToClientExplore(rawExploreData: any) {
  let explore = {
    exploreLabel: rawExploreData.label,
    modelName: rawExploreData.model_name,
    exploreName: rawExploreData.name,
    viewName: rawExploreData.view_name,
    fieldDetails: rawExploreData.fields, // store the full list of metadata about every field, just in case we need it
  };
  let views: Map<string, any> | null = new Map();

  let dimensions = [...rawExploreData.fields.dimensions];
  let measures = [...rawExploreData.fields.measures];
  let parameters = [...rawExploreData.fields.parameters];

  // iterate over each field and construct our set of views
  dimensions.forEach((field) => {
    views = addViewIfDoesntExist(field, views);
    if (!views) { return }
    views.set(
      field.view,
      addFieldToView(field, views.get(field.view), "dimensions")
    );
  });
  measures.forEach((field) => {
    views = addViewIfDoesntExist(field, views);
    if (!views) { return }
    views.set(
      field.view,
      addFieldToView(field, views.get(field.view), "measures")
    );
  });
  parameters.forEach((field) => {
    views = addViewIfDoesntExist(field, views);
    if (!views) { return }
    views.set(
      field.view,
      addFieldToView(field, views.get(field.view), "parameters")
    );
  });

  return {
    ...explore,
    views,
  };
}

// Returns a new set of views with the new view added, if it wasn't already there. Otherwise returns the same views object.
function addViewIfDoesntExist(field: ILookmlModelExploreField, views: Map<string, any> | null) {
  if (!field.view || !views) { return null }
  if (views.has(field.view)) {
    return views;
  }
  let viewsWithNewViewAdded = new Map(views); // make a shallow copy
  viewsWithNewViewAdded.set(field.view, {
    name: field.view,
    label: field.view_label,
    dimensions: new Map(),
    measures: new Map(),
    parameters: new Map(),
  });
  return viewsWithNewViewAdded;
}

// Converts a api field to a client field then adds it under a view. Returns the view with the new field added.
function addFieldToView(field: ILookmlModelExploreField, view: any, fieldType: string) {
  const clientField = convertField(field);
  view = {
    ...view,
    dimensions: new Map(view.dimensions),
    measures: new Map(view.measures),
    parameters: new Map(view.parameters),
  };

  if (clientField.isPrimaryKey) {
    view.primaryKey = clientField.name;
  }
  if (clientField.type === "field_group") {
    view[fieldType] = addFieldGroupIfDoesntExist(field, view[fieldType]);
    if (view[fieldType].get(field.field_group_label)) {
      // only add a field to a field group if it actually exists (it might not exist if the field group was hidden)
      view[fieldType]
        .get(field.field_group_label)
        .fields.set(clientField.name, clientField); // add the new field under the field group map, instead of the top level map of fields (it's nested)
    }
  } else {
    // could be a dimension or measure
    view[fieldType].set(clientField.name, clientField); // technically overwrites any duplicate fields (keyed by name) per view
  }
  return view;
}

function addFieldGroupIfDoesntExist(field: ILookmlModelExploreField, fields: Map<string, any>) {
  const fieldGroupKey = field.field_group_label || "";
  if (fields.has(fieldGroupKey) || field.hidden) {
    // exclude the group entirely if the field is hidden
    return fields; // make no changes
  }
  fields = new Map(fields); // make a copy of the Map
  fields.set(fieldGroupKey, {
    label: fieldGroupKey,
    type: "field_group",
    fields: new Map(),
    isHidden: false,
  });
  return fields;
}

// Returns a subset of data from each field that we care about
function convertField(apiField: ILookmlModelExploreField) {
  return {
    name: apiField.name,
    label: apiField.label,
    fieldLabel: apiField.label_short,
    viewLabel: apiField.view_label,
    type: getFieldType(apiField), // dimension, measure, field_group, etc
    dataType: apiField.type,
    rawDataType: apiField.type,
    isHidden: apiField.hidden,
    isPrimaryKey: apiField.primary_key,
  };
}

function getFieldType(field: ILookmlModelExploreField) {
  if (field.field_group_label !== null) {
    return "field_group";
  } else if (field.measure === true) {
    return "measure";
  } else if (field.parameter === true) {
    return "parameter";
  } else if (field.measure === false && field.parameter === false) {
    return "dimension";
  }
  throw new Error(`unknown field type: ${field}`);
}
