# CurveDataPoint

Schema for a single curve data point containing temperature and sensor value pair.  Used by GET /curve/{channel}/data-point/{index} endpoint.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**temperature** | **float** |  | 
**sensor** | **float** |  | 

## Example

```python
from lgg_client.models.curve_data_point import CurveDataPoint

# TODO update the JSON string below
json = "{}"
# create an instance of CurveDataPoint from a JSON string
curve_data_point_instance = CurveDataPoint.from_json(json)
# print the JSON string representation of the object
print(CurveDataPoint.to_json())

# convert the object into a dict
curve_data_point_dict = curve_data_point_instance.to_dict()
# create an instance of CurveDataPoint from a dict
curve_data_point_from_dict = CurveDataPoint.from_dict(curve_data_point_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


