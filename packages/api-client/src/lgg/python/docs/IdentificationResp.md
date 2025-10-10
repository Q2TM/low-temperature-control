# IdentificationResp

Schema for device identification information.  Used by GET /identification endpoint to return device details.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**manufacturer** | **str** |  | 
**model** | **str** |  | 
**serial_number** | **str** |  | 
**firmware_version** | **str** |  | 

## Example

```python
from lgg_client.models.identification_resp import IdentificationResp

# TODO update the JSON string below
json = "{}"
# create an instance of IdentificationResp from a JSON string
identification_resp_instance = IdentificationResp.from_json(json)
# print the JSON string representation of the object
print(IdentificationResp.to_json())

# convert the object into a dict
identification_resp_dict = identification_resp_instance.to_dict()
# create an instance of IdentificationResp from a dict
identification_resp_from_dict = IdentificationResp.from_dict(identification_resp_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


