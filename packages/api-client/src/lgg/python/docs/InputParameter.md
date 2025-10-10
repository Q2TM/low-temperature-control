# InputParameter

Schema for input channel configuration parameters.  Used by GET /input/{channel} endpoint to return channel settings. All fields reflect the current configuration of the temperature input channel.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**sensor_name** | **str** |  | [optional] 
**sensor_type** | [**SensorTypes**](SensorTypes.md) |  | 
**temperature_unit** | [**Units**](Units.md) |  | 
**auto_range_enable** | **bool** |  | 
**current_reversal_enable** | **bool** |  | 
**input_enable** | **bool** |  | 
**input_range** | **int** |  | 
**filter** | **str** |  | [optional] 

## Example

```python
from lgg_client.models.input_parameter import InputParameter

# TODO update the JSON string below
json = "{}"
# create an instance of InputParameter from a JSON string
input_parameter_instance = InputParameter.from_json(json)
# print the JSON string representation of the object
print(InputParameter.to_json())

# convert the object into a dict
input_parameter_dict = input_parameter_instance.to_dict()
# create an instance of InputParameter from a dict
input_parameter_from_dict = InputParameter.from_dict(input_parameter_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


