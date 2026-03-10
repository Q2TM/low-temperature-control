# SetCurveDataPointsRequest

Schema for setting multiple curve data points at once.  Accepts a list of data points (1 to 200). The existing curve is deleted first, then the supplied points are written starting at index 1. Any remaining slots (up to 200) are left at the device default of (0, 0).

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data_points** | [**List[CurveDataPoint]**](CurveDataPoint.md) | List of curve data points to set (1 to 200). Points are written starting at index 1 in the order provided. | 

## Example

```python
from lgg_client.models.set_curve_data_points_request import SetCurveDataPointsRequest

# TODO update the JSON string below
json = "{}"
# create an instance of SetCurveDataPointsRequest from a JSON string
set_curve_data_points_request_instance = SetCurveDataPointsRequest.from_json(json)
# print the JSON string representation of the object
print(SetCurveDataPointsRequest.to_json())

# convert the object into a dict
set_curve_data_points_request_dict = set_curve_data_points_request_instance.to_dict()
# create an instance of SetCurveDataPointsRequest from a dict
set_curve_data_points_request_from_dict = SetCurveDataPointsRequest.from_dict(set_curve_data_points_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


