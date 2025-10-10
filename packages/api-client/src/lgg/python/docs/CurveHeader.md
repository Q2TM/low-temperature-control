# CurveHeader

Schema for curve header information containing metadata about a temperature sensor curve.  Used by GET /curve/{channel}/header endpoint to return curve configuration.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**curve_name** | **str** |  | 
**serial_number** | **str** |  | 
**curve_data_format** | [**CurveFormat**](CurveFormat.md) |  | 
**temperature_limit** | **float** |  | 
**coefficient** | [**Coefficients**](Coefficients.md) |  | 

## Example

```python
from lgg_client.models.curve_header import CurveHeader

# TODO update the JSON string below
json = "{}"
# create an instance of CurveHeader from a JSON string
curve_header_instance = CurveHeader.from_json(json)
# print the JSON string representation of the object
print(CurveHeader.to_json())

# convert the object into a dict
curve_header_dict = curve_header_instance.to_dict()
# create an instance of CurveHeader from a dict
curve_header_from_dict = CurveHeader.from_dict(curve_header_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


