# lgg_client.CurveApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**delete_curve**](CurveApi.md#delete_curve) | **DELETE** /api/v1/curve/{channel} | Delete Curve
[**get_all_curve_data_points**](CurveApi.md#get_all_curve_data_points) | **GET** /api/v1/curve/{channel}/data-points | Get Curve Data Points
[**get_curve_data_point**](CurveApi.md#get_curve_data_point) | **GET** /api/v1/curve/{channel}/data-point/{index} | Get Curve Data Point
[**get_curve_header**](CurveApi.md#get_curve_header) | **GET** /api/v1/curve/{channel}/header | Get Curve Header
[**set_curve_data_point**](CurveApi.md#set_curve_data_point) | **PUT** /api/v1/curve/{channel}/data-point/{index} | Set Curve Data Point
[**set_curve_header**](CurveApi.md#set_curve_header) | **PUT** /api/v1/curve/{channel}/header | Set Curve Header


# **delete_curve**
> OperationResult delete_curve(channel)

Delete Curve

### Example


```python
import lgg_client
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Delete Curve
        api_response = api_instance.delete_curve(channel)
        print("The response of CurveApi->delete_curve:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->delete_curve: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**OperationResult**](OperationResult.md)

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

# **get_all_curve_data_points**
> CurveDataPoints get_all_curve_data_points(channel)

Get Curve Data Points

### Example


```python
import lgg_client
from lgg_client.models.curve_data_points import CurveDataPoints
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Get Curve Data Points
        api_response = api_instance.get_all_curve_data_points(channel)
        print("The response of CurveApi->get_all_curve_data_points:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->get_all_curve_data_points: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**CurveDataPoints**](CurveDataPoints.md)

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

# **get_curve_data_point**
> CurveDataPoint get_curve_data_point(channel, index)

Get Curve Data Point

### Example


```python
import lgg_client
from lgg_client.models.curve_data_point import CurveDataPoint
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8
    index = 56 # int | Index of the data point in the curve

    try:
        # Get Curve Data Point
        api_response = api_instance.get_curve_data_point(channel, index)
        print("The response of CurveApi->get_curve_data_point:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->get_curve_data_point: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 
 **index** | **int**| Index of the data point in the curve | 

### Return type

[**CurveDataPoint**](CurveDataPoint.md)

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

# **get_curve_header**
> CurveHeader get_curve_header(channel)

Get Curve Header

### Example


```python
import lgg_client
from lgg_client.models.curve_header import CurveHeader
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Get Curve Header
        api_response = api_instance.get_curve_header(channel)
        print("The response of CurveApi->get_curve_header:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->get_curve_header: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**CurveHeader**](CurveHeader.md)

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

# **set_curve_data_point**
> OperationResult set_curve_data_point(channel, index, curve_data_point)

Set Curve Data Point

### Example


```python
import lgg_client
from lgg_client.models.curve_data_point import CurveDataPoint
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8
    index = 56 # int | Index of the data point in the curve
    curve_data_point = lgg_client.CurveDataPoint() # CurveDataPoint | 

    try:
        # Set Curve Data Point
        api_response = api_instance.set_curve_data_point(channel, index, curve_data_point)
        print("The response of CurveApi->set_curve_data_point:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->set_curve_data_point: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 
 **index** | **int**| Index of the data point in the curve | 
 **curve_data_point** | [**CurveDataPoint**](CurveDataPoint.md)|  | 

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

# **set_curve_header**
> OperationResult set_curve_header(channel, curve_header)

Set Curve Header

### Example


```python
import lgg_client
from lgg_client.models.curve_header import CurveHeader
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
    api_instance = lgg_client.CurveApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8
    curve_header = lgg_client.CurveHeader() # CurveHeader | 

    try:
        # Set Curve Header
        api_response = api_instance.set_curve_header(channel, curve_header)
        print("The response of CurveApi->set_curve_header:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CurveApi->set_curve_header: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 
 **curve_header** | [**CurveHeader**](CurveHeader.md)|  | 

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

