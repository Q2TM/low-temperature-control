# simulator_client.SimulatorApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_simulator_temperature**](SimulatorApi.md#get_simulator_temperature) | **GET** /temperature/{channel} | Get Simulator Temperature
[**set_heater_output**](SimulatorApi.md#set_heater_output) | **POST** /heater/{pin} | Set Heater Output


# **get_simulator_temperature**
> GetSimulatorTemperature200Response get_simulator_temperature(channel)

Get Simulator Temperature

Retrieve simulated temperature for a given channel

### Example


```python
import simulator_client
from simulator_client.models.get_simulator_temperature200_response import GetSimulatorTemperature200Response
from simulator_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = simulator_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with simulator_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = simulator_client.SimulatorApi(api_client)
    channel = 3.4 # float | 

    try:
        # Get Simulator Temperature
        api_response = api_instance.get_simulator_temperature(channel)
        print("The response of SimulatorApi->get_simulator_temperature:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SimulatorApi->get_simulator_temperature: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **float**|  | 

### Return type

[**GetSimulatorTemperature200Response**](GetSimulatorTemperature200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response for status 200 |  -  |
**404** | Response for status 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **set_heater_output**
> SetHeaterOutput200Response set_heater_output(pin, set_heater_output_request)

Set Heater Output

Set the heater output level for a given GPIO pin

### Example


```python
import simulator_client
from simulator_client.models.set_heater_output200_response import SetHeaterOutput200Response
from simulator_client.models.set_heater_output_request import SetHeaterOutputRequest
from simulator_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = simulator_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with simulator_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = simulator_client.SimulatorApi(api_client)
    pin = 3.4 # float | 
    set_heater_output_request = simulator_client.SetHeaterOutputRequest() # SetHeaterOutputRequest | 

    try:
        # Set Heater Output
        api_response = api_instance.set_heater_output(pin, set_heater_output_request)
        print("The response of SimulatorApi->set_heater_output:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling SimulatorApi->set_heater_output: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **pin** | **float**|  | 
 **set_heater_output_request** | [**SetHeaterOutputRequest**](SetHeaterOutputRequest.md)|  | 

### Return type

[**SetHeaterOutput200Response**](SetHeaterOutput200Response.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Response for status 200 |  -  |
**404** | Response for status 404 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

