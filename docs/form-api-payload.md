# Form API Payload (draft)

Payload built by `FormBuilderContext` (`buildApiPayload`) to send to the backend.  
If `id` is missing, treat the entity as **new**; `clientId` is always present for correlation.

```json
{
  "title": "LogicFlow Form",
  "startSectionId": "sec_1",                // backend id if available, otherwise client id
  "sections": [
    {
      "id": "backend-section-id",           // omitted when not persisted
      "clientId": "sec_1",
      "title": "Welcome & Basic Info",
      "position": 0,
      "fields": [
        {
          "id": "backend-field-id",         // omitted when not persisted
          "clientId": "f_1",
          "type": "text",
          "label": "What is your name?",
          "required": true,
          "options": ["A", "B"],            // only for select/radio/checkbox
          "ratingScale": 5,                 // only for rating
          "ratingIcon": "star",             // only for rating
          "position": 0
        }
      ]
    }
  ],
  "logic": {
    "nodes": [
      {
        "id": "backend-logic-node-id",      // omitted when not persisted
        "clientId": "node-123",
        "type": "section|condition|action",
        "sectionId": "sec_1",               // backend id if known, otherwise client id
        "rules": [
          {
            "id": "rule-1",
            "fieldId": "f_2",               // client id
            "fieldBackendId": "backend-f2", // optional persisted id
            "operator": "equals",
            "value": "Sales"
          }
        ],
        "actionConfig": {
          "type": "redirect|webhook",
          "url": "https://example.com",
          "message": "Optional message"
        },
        "position": { "x": 120, "y": 340 }  // current canvas position
      }
    ],
    "edges": [
      {
        "id": "backend-edge-id",            // omitted when not persisted
        "clientId": "edge_1",
        "sourceClientId": "node-123",
        "targetClientId": "node-456"
      }
    ]
  }
}
```

### Rules of thumb
- Missing `id` = create; present `id` = update existing.
- Use `clientId` to map optimistic responses back to the UI.
- Preserve array order via `position`.
- `startSectionId` should point to the first section the flow begins with; when the backend id is known, use it, otherwise fall back to the client id.
