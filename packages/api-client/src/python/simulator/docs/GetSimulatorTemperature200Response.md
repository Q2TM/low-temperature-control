# GetSimulatorTemperature200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**temperature** | **float** | Simulated temperature in Kelvin | 
**celcius** | **float** | Simulated temperature in Celsius (For testing purposes) | 

## Example

```python
from simulator_client.models.get_simulator_temperature200_response import GetSimulatorTemperature200Response

# TODO update the JSON string below
json = "{}"
# create an instance of GetSimulatorTemperature200Response from a JSON string
get_simulator_temperature200_response_instance = GetSimulatorTemperature200Response.from_json(json)
# print the JSON string representation of the object
print(GetSimulatorTemperature200Response.to_json())

# convert the object into a dict
get_simulator_temperature200_response_dict = get_simulator_temperature200_response_instance.to_dict()
# create an instance of GetSimulatorTemperature200Response from a dict
get_simulator_temperature200_response_from_dict = GetSimulatorTemperature200Response.from_dict(get_simulator_temperature200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


