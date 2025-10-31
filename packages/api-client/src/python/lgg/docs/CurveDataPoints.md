# CurveDataPoints

Schema for multiple curve data points containing arrays of temperature and sensor values.  Used by GET /curve/{channel}/data-points endpoint to return all curve data.

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**channel** | **int** |  | 
**temperatures** | **List[float]** | List of temperature values | 
**sensors** | **List[float]** | List of sensor values | 

## Example

```python
from lgg_client.models.curve_data_points import CurveDataPoints

# TODO update the JSON string below
json = "{}"
# create an instance of CurveDataPoints from a JSON string
curve_data_points_instance = CurveDataPoints.from_json(json)
# print the JSON string representation of the object
print(CurveDataPoints.to_json())

# convert the object into a dict
curve_data_points_dict = curve_data_points_instance.to_dict()
# create an instance of CurveDataPoints from a dict
curve_data_points_from_dict = CurveDataPoints.from_dict(curve_data_points_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


