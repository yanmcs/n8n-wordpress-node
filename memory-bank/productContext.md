# Product Context: Enhanced n8n WordPress Node

## 1. Problem Solved
The existing WordPress integration options within n8n may lack the depth and flexibility required for advanced use cases. Users need a more robust node that supports a wider range of WordPress features, including custom post types, advanced custom fields, and more sophisticated authentication, without requiring custom code or complex workarounds.

## 2. How It Should Work
The enhanced WordPress node should provide a user-friendly interface within n8n for configuring connections and operations. Key functionalities include:
- **Seamless Authentication:** Easy setup for Basic Auth, OAuth2, and Application Passwords.
- **Dynamic Resource Handling:** Auto-discovery of custom post types and ACF fields, allowing users to select and map them dynamically.
- **Comprehensive Operations:** Support for CRUD (Create, Read, Update, Delete) operations on posts (including CPTs), media, and users.
- **Flexible Field Mapping:** Intuitive mapping of n8n input/output data to WordPress fields, including complex/nested ACF structures.
- **Reliable Execution:** Robust error handling and retry mechanisms to ensure workflow stability.

## 3. User Experience Goals
- **Ease of Use:** Simplify complex WordPress integrations.
- **Flexibility:** Adapt to various WordPress configurations and custom setups.
- **Reliability:** Provide a stable and dependable node for critical workflows.
- **Power:** Unlock advanced WordPress capabilities directly within n8n.
- **Clarity:** Offer clear feedback, error messages, and logging.
