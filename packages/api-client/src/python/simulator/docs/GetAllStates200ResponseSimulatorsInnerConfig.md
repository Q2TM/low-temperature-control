# GetAllStates200ResponseSimulatorsInnerConfig


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**enabled** | **bool** |  | 
**size** | **List[float]** |  | 
**instruments** | [**List[GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner]**](GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner.md) |  | 
**external_temperature** | **float** |  | 
**external_conductivity** | **float** |  | 
**internal_conductivity** | **float** |  | 

## Example

```python
from simulator_client.models.get_all_states200_response_simulators_inner_config import GetAllStates200ResponseSimulatorsInnerConfig

# TODO update the JSON string below
json = "{}"
# create an instance of GetAllStates200ResponseSimulatorsInnerConfig from a JSON string
get_all_states200_response_simulators_inner_config_instance = GetAllStates200ResponseSimulatorsInnerConfig.from_json(json)
# print the JSON string representation of the object
print(GetAllStates200ResponseSimulatorsInnerConfig.to_json())

# convert the object into a dict
get_all_states200_response_simulators_inner_config_dict = get_all_states200_response_simulators_inner_config_instance.to_dict()
# create an instance of GetAllStates200ResponseSimulatorsInnerConfig from a dict
get_all_states200_response_simulators_inner_config_from_dict = GetAllStates200ResponseSimulatorsInnerConfig.from_dict(get_all_states200_response_simulators_inner_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


