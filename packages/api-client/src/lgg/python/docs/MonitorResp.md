# MonitorResp

Schema for temperature and sensor monitoring data.  Used by GET /monitor/{channel} endpoint to return current readings. Currently returns kelvin temperature and raw sensor value.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**kelvin** | **float** |  | 
**sensor** | **float** |  | 

## Example

```python
from lgg_client.models.monitor_resp import MonitorResp

# TODO update the JSON string below
json = "{}"
# create an instance of MonitorResp from a JSON string
monitor_resp_instance = MonitorResp.from_json(json)
# print the JSON string representation of the object
print(MonitorResp.to_json())

# convert the object into a dict
monitor_resp_dict = monitor_resp_instance.to_dict()
# create an instance of MonitorResp from a dict
monitor_resp_from_dict = MonitorResp.from_dict(monitor_resp_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


