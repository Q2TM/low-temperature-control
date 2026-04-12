# GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**type** | **str** |  | 
**position** | **List[float]** |  | 
**name** | **str** |  | 
**thermo_channel** | **float** |  | 
**heater_pin** | **float** |  | 
**heater_power** | **float** |  | 
**initial_power** | **float** |  | [optional] 

## Example

```python
from simulator_client.models.get_all_states200_response_simulators_inner_config_instruments_inner import GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner

# TODO update the JSON string below
json = "{}"
# create an instance of GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner from a JSON string
get_all_states200_response_simulators_inner_config_instruments_inner_instance = GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner.from_json(json)
# print the JSON string representation of the object
print(GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner.to_json())

# convert the object into a dict
get_all_states200_response_simulators_inner_config_instruments_inner_dict = get_all_states200_response_simulators_inner_config_instruments_inner_instance.to_dict()
# create an instance of GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner from a dict
get_all_states200_response_simulators_inner_config_instruments_inner_from_dict = GetAllStates200ResponseSimulatorsInnerConfigInstrumentsInner.from_dict(get_all_states200_response_simulators_inner_config_instruments_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


