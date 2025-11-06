# SetHeaterOutputRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**value** | **float** | Heater output level (0.0 to 1.0) | 

## Example

```python
from simulator_client.models.set_heater_output_request import SetHeaterOutputRequest

# TODO update the JSON string below
json = "{}"
# create an instance of SetHeaterOutputRequest from a JSON string
set_heater_output_request_instance = SetHeaterOutputRequest.from_json(json)
# print the JSON string representation of the object
print(SetHeaterOutputRequest.to_json())

# convert the object into a dict
set_heater_output_request_dict = set_heater_output_request_instance.to_dict()
# create an instance of SetHeaterOutputRequest from a dict
set_heater_output_request_from_dict = SetHeaterOutputRequest.from_dict(set_heater_output_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


