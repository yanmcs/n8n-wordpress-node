# Active Context: Enhanced n8n WordPress Node

## 1. Current Work Focus
- Initial project setup: Establishing the Memory Bank.
- Preparing to use Context7 to find references and documentation in the "n8n-io/n8n-nodes-starter" repository.
- Planning the initial structure of the WordPress node.

## 2. Recent Changes
- Created core Memory Bank files:
    - `projectbrief.md`
    - `productContext.md`
    - `systemPatterns.md`
    - `techContext.md`
- Refined project plan based on user feedback, prioritizing:
    - Custom Post Types (with auto-discovery)
    - Media uploads and management
    - User management
    - Advanced Custom Fields (ACF) integration (with auto-discovery of fields)

## 3. Next Steps
1. ~~Create `progress.md` to complete the initial Memory Bank setup.~~ (Completed)
2. ~~Use the `resolve-library-id` MCP tool to get the Context7 ID for "n8n-io/n8n-nodes-starter".~~ (Completed, ID: `/n8n-io/n8n-nodes-starter`)
3. ~~Use the `get-library-docs` MCP tool to fetch documentation for "n8n-io/n8n-nodes-starter", focusing on node creation, structure, and dynamic parameters.~~ (Completed, received setup information)
4. ~~Analyze the fetched documentation to understand the foundational elements for the new WordPress node.~~ (Completed, foundational elements understood: Git repo, pnpm for dependencies, linting)
5. ~~Create a `package.json` file for the project.~~ (Completed)
6. ~~Create the directory structure: `nodes/WordPress` and `credentials`~~ (Completed implicitly by file creation)
7. ~~Begin scaffolding the `WordPress.node.ts` file within `nodes/WordPress/`~~ (Completed)
8. ~~Begin scaffolding the `WordPressApi.credentials.ts` file within `credentials/`~~ (Completed)
9. ~~Define basic interfaces and classes in the scaffolded files.~~ (Completed)
10. ~~Install project dependencies using `npm install`.~~ (Completed - `pnpm` failed, `npm install` succeeded with warnings)
11. ~~Verify TypeScript errors related to module resolution are gone.~~ (Completed, errors resolved by casting inputs/outputs)
12. ~~Plan and start implementing properties for the 'Post' resource, including operations (Create, Read, Update, Delete).~~ (Completed: Operations and fields for Posts/CPTs, Media, and Users are defined. Display options generalized.)
13. ~~Plan and start implementing auto-discovery for Custom Post Types (e.g., using `loadOptions` method for the 'Resource' or a dedicated CPT field).~~ (Completed: `loadOptions` for CPTs using `rest_base` is implemented.)
14. ~~Implement the `execute` method logic for 'Post' resource operations (starting with 'Create' or 'Read').~~ (Completed: Logic for Post-like types, Media, and Users CRUD operations added. ACF fields are now included in the body for post-like create/update.)
15. ~~Add placeholder for Advanced Custom Fields (ACF) using a `collection` type.~~ (Completed)
16. ~~Refine `wordpressApiRequest` helper function for robustness and correct usage of `this.helpers.request` (for loadOptions) and `this.helpers.httpRequest` (for execute), including proper error handling and request option mapping (e.g., `url` vs `uri`).~~ (Completed)
17. Implement more detailed Media Upload logic (handling form-data correctly, potentially sending metadata with upload). (In progress: Implemented as a two-step process - file upload then metadata update. True single multipart/form-data request is a future enhancement.)
18. ~~Implement User operations in `execute` method.~~ (Completed, initial logic in place)
19. Further develop ACF integration: dynamic loading of ACF field keys, handling various ACF field types. (In progress: `loadOptions` for ACF keys added with simulation. `JSON.parse` for values in `execute` implemented. Full ACF field type handling is a future enhancement.)
20. Review and implement improved authentication, particularly OAuth2. (Pending)
21. Implement comprehensive error handling and retry logic within API calls. (Pending)
22. Test existing functionalities. (Pending)

## 4. Active Decisions & Considerations
- **Memory Bank First:** Ensuring all core Memory Bank files are established before diving into coding. This is crucial for maintaining context across sessions.
- **Context7 for Starter Repo:** Relying on Context7 to get insights into `n8n-nodes-starter` is a key early step to align with n8n best practices.
- **Prioritization:** The development will focus on CPTs, Media, Users, and ACF first, as requested. Other features like comments and full taxonomy support will follow.

## 5. Important Patterns & Preferences
- Adhere to n8n's coding standards and node development guidelines.
- Emphasize modularity and clear separation of concerns in the node's codebase.
- Ensure robust error handling and clear user feedback.

## 6. Learnings & Project Insights
- (This section will be populated as the project progresses)
