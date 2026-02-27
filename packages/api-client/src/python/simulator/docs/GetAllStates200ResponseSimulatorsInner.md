# GetAllStates200ResponseSimulatorsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**config** | [**GetAllStates200ResponseSimulatorsInnerConfig**](GetAllStates200ResponseSimulatorsInnerConfig.md) |  | 
**state** | **List[List[float]]** |  | 

## Example

```python
from simulator_client.models.get_all_states200_response_simulators_inner import GetAllStates200ResponseSimulatorsInner

# TODO update the JSON string below
json = "{}"
# create an instance of GetAllStates200ResponseSimulatorsInner from a JSON string
get_all_states200_response_simulators_inner_instance = GetAllStates200ResponseSimulatorsInner.from_json(json)
# print the JSON string representation of the object
print(GetAllStates200ResponseSimulatorsInner.to_json())

# convert the object into a dict
get_all_states200_response_simulators_inner_dict = get_all_states200_response_simulators_inner_instance.to_dict()
# create an instance of GetAllStates200ResponseSimulatorsInner from a dict
get_all_states200_response_simulators_inner_from_dict = GetAllStates200ResponseSimulatorsInner.from_dict(get_all_states200_response_simulators_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


