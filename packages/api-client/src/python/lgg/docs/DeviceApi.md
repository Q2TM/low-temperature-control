# lgg_client.DeviceApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**connect**](DeviceApi.md#connect) | **POST** /api/v1/device/connect | Connect
[**disconnect**](DeviceApi.md#disconnect) | **POST** /api/v1/device/disconnect | Disconnect
[**get_brightness**](DeviceApi.md#get_brightness) | **GET** /api/v1/device/brightness | Get Brightness
[**get_identification**](DeviceApi.md#get_identification) | **GET** /api/v1/device/identification | Get Identification
[**get_module_name**](DeviceApi.md#get_module_name) | **GET** /api/v1/device/module-name | Get Modname
[**get_status**](DeviceApi.md#get_status) | **GET** /api/v1/device/status/{channel} | Get Status
[**set_brightness**](DeviceApi.md#set_brightness) | **PUT** /api/v1/device/brightness | Set Brightness
[**set_factory_defaults**](DeviceApi.md#set_factory_defaults) | **DELETE** /api/v1/device/factory-defaults | Set Factory Defaults
[**set_module_name**](DeviceApi.md#set_module_name) | **PUT** /api/v1/device/module-name | Set Modname


# **connect**
> OperationResult connect()

Connect

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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Connect
        api_response = api_instance.connect()
        print("The response of DeviceApi->connect:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->connect: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **disconnect**
> OperationResult disconnect()

Disconnect

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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Disconnect
        api_response = api_instance.disconnect()
        print("The response of DeviceApi->disconnect:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->disconnect: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_brightness**
> Brightness get_brightness()

Get Brightness

### Example


```python
import lgg_client
from lgg_client.models.brightness import Brightness
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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Get Brightness
        api_response = api_instance.get_brightness()
        print("The response of DeviceApi->get_brightness:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->get_brightness: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**Brightness**](Brightness.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_identification**
> IdentificationResp get_identification()

Get Identification

### Example


```python
import lgg_client
from lgg_client.models.identification_resp import IdentificationResp
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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Get Identification
        api_response = api_instance.get_identification()
        print("The response of DeviceApi->get_identification:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->get_identification: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

[**IdentificationResp**](IdentificationResp.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_module_name**
> str get_module_name()

Get Modname

### Example


```python
import lgg_client
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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Get Modname
        api_response = api_instance.get_module_name()
        print("The response of DeviceApi->get_module_name:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->get_module_name: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

### Return type

**str**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_status**
> StatusResp get_status(channel)

Get Status

### Example


```python
import lgg_client
from lgg_client.models.status_resp import StatusResp
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
    api_instance = lgg_client.DeviceApi(api_client)
    channel = 56 # int | Channel must be between 1 and 8

    try:
        # Get Status
        api_response = api_instance.get_status(channel)
        print("The response of DeviceApi->get_status:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->get_status: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **channel** | **int**| Channel must be between 1 and 8 | 

### Return type

[**StatusResp**](StatusResp.md)

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

# **set_brightness**
> OperationResult set_brightness(brightness)

Set Brightness

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
    api_instance = lgg_client.DeviceApi(api_client)
    brightness = 56 # int | 

    try:
        # Set Brightness
        api_response = api_instance.set_brightness(brightness)
        print("The response of DeviceApi->set_brightness:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->set_brightness: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **brightness** | **int**|  | 

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

# **set_factory_defaults**
> OperationResult set_factory_defaults()

Set Factory Defaults

Reset to factory defaults

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
    api_instance = lgg_client.DeviceApi(api_client)

    try:
        # Set Factory Defaults
        api_response = api_instance.set_factory_defaults()
        print("The response of DeviceApi->set_factory_defaults:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->set_factory_defaults: %s\n" % e)
```



### Parameters

This endpoint does not need any parameter.

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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **set_module_name**
> OperationResult set_module_name(name)

Set Modname

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
    api_instance = lgg_client.DeviceApi(api_client)
    name = 'name_example' # str | 

    try:
        # Set Modname
        api_response = api_instance.set_module_name(name)
        print("The response of DeviceApi->set_module_name:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling DeviceApi->set_module_name: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **name** | **str**|  | 

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

