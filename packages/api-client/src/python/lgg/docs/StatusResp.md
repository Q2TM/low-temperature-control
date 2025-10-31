# StatusResp

Schema for device channel status information.  Used by GET /status/{channel} endpoint to return channel status flags.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**invalid_reading** | **bool** |  | 
**temp_under_range** | **bool** |  | 
**temp_over_range** | **bool** |  | 
**sensor_units_over_range** | **bool** |  | 
**sensor_units_under_range** | **bool** |  | 

## Example

```python
from lgg_client.models.status_resp import StatusResp

# TODO update the JSON string below
json = "{}"
# create an instance of StatusResp from a JSON string
status_resp_instance = StatusResp.from_json(json)
# print the JSON string representation of the object
print(StatusResp.to_json())

# convert the object into a dict
status_resp_dict = status_resp_instance.to_dict()
# create an instance of StatusResp from a dict
status_resp_from_dict = StatusResp.from_dict(status_resp_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


