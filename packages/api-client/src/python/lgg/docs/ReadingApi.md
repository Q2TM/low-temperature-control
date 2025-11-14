# lgg_client.ReadingApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_input_parameter**](ReadingApi.md#get_input_parameter) | **GET** /api/v1/reading/input/{channel} | Get Input Parameter
[**get_monitor**](ReadingApi.md#get_monitor) | **GET** /api/v1/reading/monitor/{channel} | Get Monitor
[**set_input_parameter**](ReadingApi.md#set_input_parameter) | **PUT** /api/v1/reading/input/{channel} | Set Input Config


# **get_input_parameter**
> InputParameter get_input_parameter(channel)

Get Input Parameter

### Example


```python
import lgg_client
from lgg_client.models.input_parameter import InputParameter
from lgg_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = lgg_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with lgg_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = lgg_client.ReadingApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Get Input Parameter
        api_response = api_instance.get_input_parameter(channel)
        print("The response of ReadingApi->get_input_parameter:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ReadingApi->get_input_parameter: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**InputParameter**](InputParameter.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_monitor**
> MonitorResp get_monitor(channel)

Get Monitor

### Example


```python
import lgg_client
from lgg_client.models.monitor_resp import MonitorResp
from lgg_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = lgg_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with lgg_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = lgg_client.ReadingApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Get Monitor
        api_response = api_instance.get_monitor(channel)
        print("The response of ReadingApi->get_monitor:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ReadingApi->get_monitor: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**MonitorResp**](MonitorResp.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**503** | Either the lakeshore is not connected or error communicating |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **set_input_parameter**
> OperationResult set_input_parameter(channel, input_parameter)

Set Input Config

### Example


```python
import lgg_client
from lgg_client.models.input_parameter import InputParameter
from lgg_client.models.operation_result import OperationResult
from lgg_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost
# See configuration.py for a list of all supported configuration parameters.
configuration = lgg_client.Configuration(
    host = "http://localhost"
)


# Enter a context with an instance of the API client
with lgg_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = lgg_client.ReadingApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8
    input_parameter = lgg_client.InputParameter() # InputParameter | 

    try:
        # Set Input Config
        api_response = api_instance.set_input_parameter(channel, input_parameter)
        print("The response of ReadingApi->set_input_parameter:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ReadingApi->set_input_parameter: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 
 **input_parameter** | [**InputParameter**](InputParameter.md)|  | 

### Return type

[**OperationResult**](OperationResult.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

