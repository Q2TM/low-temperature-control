# Brightness

Schema for device display brightness configuration.  Used by GET/PUT /brightness endpoints for brightness control.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**brightness** | **int** | Brightness level between 0 and 100 | 

## Example

```python
from lgg_client.models.brightness import Brightness

# TODO update the JSON string below
json = "{}"
# create an instance of Brightness from a JSON string
brightness_instance = Brightness.from_json(json)
# print the JSON string representation of the object
print(Brightness.to_json())

# convert the object into a dict
brightness_dict = brightness_instance.to_dict()
# create an instance of Brightness from a dict
brightness_from_dict = Brightness.from_dict(brightness_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


