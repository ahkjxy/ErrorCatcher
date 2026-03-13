# cURL Command Feature

## Overview

ErrorCatcher now automatically generates and saves cURL commands for API errors, making it easy to reproduce and debug API issues.

## How It Works

When an API request fails (via fetch, XMLHttpRequest, axios, or jQuery), ErrorCatcher automatically:

1. Captures the request details (URL, method, headers, body)
2. Generates a cURL command that can reproduce the request
3. Saves it with the error report
4. Displays it in the error detail page

## Supported Request Types

- **fetch API** - Modern browser fetch requests
- **XMLHttpRequest** - Traditional XHR requests
- **axios** - Popular HTTP client library
- **jQuery.ajax** - jQuery AJAX requests

## Example

When an API error occurs, ErrorCatcher generates a cURL command like:

```bash
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer token123' \
  -d '{"name":"John","email":"john@example.com"}'
```

## Viewing cURL Commands

1. Navigate to the Errors page
2. Click on an API error to view details
3. In the Overview tab, you'll see a "cURL Command" section
4. Click the "Copy" button to copy the command to your clipboard
5. Paste and run it in your terminal to reproduce the request

## Benefits

- **Quick Reproduction**: Instantly reproduce API errors in your terminal
- **Easy Debugging**: Test API endpoints without writing code
- **Team Collaboration**: Share exact requests with team members
- **API Testing**: Verify fixes by running the same request

## Privacy & Security

- Sensitive headers (like Authorization) are included in the cURL command
- Be careful when sharing cURL commands that contain authentication tokens
- Consider sanitizing sensitive data before sharing

## Example Usage

### In Browser Console

```javascript
// Trigger an API error
fetch('https://api.example.com/users/999', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer token123'
  }
}).catch(err => console.error(err));
```

### Generated cURL Command

```bash
curl -X DELETE 'https://api.example.com/users/999' \
  -H 'Authorization: Bearer token123'
```

### Run in Terminal

```bash
# Copy the cURL command from the error detail page
# Paste and run in your terminal
curl -X DELETE 'https://api.example.com/users/999' \
  -H 'Authorization: Bearer token123'
```

## Technical Details

### Request Headers Captured

- Content-Type
- Authorization
- Custom headers
- Excludes: Host, Connection, Content-Length (automatically added by curl)

### Request Body Handling

- JSON bodies are preserved
- Form data is converted to string format
- Binary data is indicated but not included
- Large bodies are truncated with a note

### URL Construction

- Full URL including protocol and domain
- Query parameters are included
- URL encoding is preserved

## Configuration

No additional configuration is needed. The cURL command generation is automatic for all API errors.

## Limitations

- Binary request bodies are not fully supported
- Very large request bodies may be truncated
- Some complex header values may need manual adjustment
- Multipart form data requires manual reconstruction

## Best Practices

1. **Test in Safe Environment**: Always test cURL commands in development/staging first
2. **Remove Sensitive Data**: Sanitize tokens and credentials before sharing
3. **Verify URLs**: Ensure the URL points to the correct environment
4. **Check Headers**: Verify all required headers are present
5. **Validate Body**: Confirm the request body is correctly formatted

## Related Features

- [Error Detail View](../guide/error-detail.md)
- [API Error Tracking](../guide/api-errors.md)
- [Request/Response Logging](../guide/request-logging.md)
