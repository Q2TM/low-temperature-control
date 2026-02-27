# GetAllStates200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**simulators** | [**List[GetAllStates200ResponseSimulatorsInner]**](GetAllStates200ResponseSimulatorsInner.md) |  | 

## Example

```python
from simulator_client.models.get_all_states200_response import GetAllStates200Response

# TODO update the JSON string below
json = "{}"
# create an instance of GetAllStates200Response from a JSON string
get_all_states200_response_instance = GetAllStates200Response.from_json(json)
# print the JSON string representation of the object
print(GetAllStates200Response.to_json())

# convert the object into a dict
get_all_states200_response_dict = get_all_states200_response_instance.to_dict()
# create an instance of GetAllStates200Response from a dict
get_all_states200_response_from_dict = GetAllStates200Response.from_dict(get_all_states200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


