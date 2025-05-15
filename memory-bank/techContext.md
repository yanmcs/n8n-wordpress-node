# Tech Context: Enhanced n8n WordPress Node

## 1. Technologies Used
- **n8n Node Development Kit:**
    - Core n8n libraries (`n8n-core`, `n8n-workflow`)
    - TypeScript for node implementation
    - n8n's credential system
    - n8n's UI components for node properties
- **WordPress:**
    - WordPress REST API (v2) as the primary interface.
    - Target WordPress version compatibility: Aim for broad compatibility with recent WordPress versions (e.g., 5.x and later).
- **Node.js Environment:** The n8n execution environment.
- **Development Tools:**
    - `npm` or `yarn` for package management.
    - ESLint/Prettier for code linting and formatting (following n8n standards).
    - Jest (or similar) for unit and integration testing.

## 2. Development Setup
- **Base Repository:** Start by cloning or using `n8n-io/n8n-nodes-starter` as a template.
- **Local n8n Instance:** For testing the node during development.
- **WordPress Test Site:** A dedicated WordPress instance (local or remote) for testing API interactions, CPTs, ACF, media uploads, and user management. This site should have ACF plugin installed and configured with various field types.
- **Context7:** Will be used to find references and documentation, particularly for `n8n-io/n8n-nodes-starter`.

## 3. Technical Constraints
- **API Rate Limits:** Be mindful of WordPress REST API rate limits, if any are imposed by the hosting environment or security plugins. Implement retry logic accordingly.
- **Authentication Methods:** Ensure robust and secure handling of Basic Auth, OAuth2, and Application Passwords. OAuth2 will require understanding n8n's OAuth2 credential implementation.
- **Data Serialization/Deserialization:** Properly handle JSON data to/from the WordPress API.
- **ACF Complexity:** ACF can have deeply nested fields and various field types. The mapping logic must be flexible enough to handle this. Consider potential performance implications of fetching/updating many ACF fields.
- **WordPress Plugin Dependencies:** The node's functionality, especially for ACF, relies on specific plugins (like Advanced Custom Fields) being active on the WordPress site. The node should gracefully handle cases where these are not available.

## 4. Dependencies
- **External Libraries:** Minimize external dependencies. If any are needed (e.g., a specific HTTP client if n8n's internal one is insufficient, though unlikely), they should be lightweight and well-maintained.
- **n8n Version Compatibility:** Ensure the node is compatible with recent and common n8n versions.

## 5. Tool Usage Patterns
- **API Interaction:** All interactions with WordPress will be through its REST API.
- **Dynamic UI Elements:** Leverage n8n's `loadOptions` methods for dynamically populating dropdowns (e.g., for CPTs, ACF fields).
- **Error Handling:** Use n8n's error classes (`NodeApiError`, `NodeOperationError`) for consistent error reporting.
