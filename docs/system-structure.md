# Task Management System Structure

## Collections

### 1. Tasks Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Organization ID | organization | Relation | Required, Single Organization |
| Title | title | Text | Required, Min length: 1, Max length: 100 |
| Description | description | Text | Optional, Max length: 1000 |
| Created Date | created | Date | Required, Auto-generated |
| Last Updated Date | updated | Date | Required, Auto-updated |
| Created By | created_by | Relation | Required, Single User |
| Is Recurring | is_recurring | Boolean | Required |
| Recurrence Type | recurrence_type | Select | Required if is_recurring, Options: "Fixed", "Variable" |
| Recurrence Interval | recurrence_interval | Text | Required if is_recurring, e.g., "1 week", "2 months" |
| Last Occurrence Date | last_occurrence | Date | Optional |
| Category | category | Relation | Optional, Single Category |
| Dependencies | dependencies | Relation | Optional, Multiple Tasks |
| Notification Settings | notification_settings | JSON | Optional |

### 2. Occurrences Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Organization ID | organization | Relation | Required, Single Organization |
| Task ID | task | Relation | Required, Single Task |
| Status | status | Select | Required, Options: "Not Started", "In Progress", "Completed", "On Hold" |
| Due Date | due_date | Date | Required |
| Original Due Date | original_due_date | Date | Required |
| Assigned To | assigned_to | Relation | Optional, Single User |
| Completed Date | completed_date | Date | Optional |
| Is Deleted | is_deleted | Boolean | Required, Default: false |

### 3. Comments Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Organization ID | organization | Relation | Required, Single Organization |
| Occurrence ID | occurrence | Relation | Required, Single Occurrence |
| User ID | user | Relation | Required, Single User |
| Comment Text | text | Text | Required, Max length: 1000 |
| Created Date | created | Date | Required, Auto-generated |

### 4. Users Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Organization ID | organization | Relation | Required, Single Organization |
| Name | name | Text | Required, Min length: 2, Max length: 100 |
| Email | email | Email | Required, Unique |
| Role | role | Select | Required, Options: "Admin", "User" |

### 5. Categories Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Organization ID | organization | Relation | Required, Single Organization |
| Name | name | Text | Required, Min length: 1, Max length: 50 |
| Type | type | Select | Required, Options: "Dropdown", "Tag" |
| Options | options | JSON | Required if type is "Dropdown" |

### 6. Organizations Collection
| Current Name | PocketBase Name | Type | Settings |
|--------------|-----------------|------|----------|
| ID | id | ID | Auto-generated |
| Name | name | Text | Required, Min length: 2, Max length: 100 |
| Created Date | created | Date | Required, Auto-generated |

## Key Features

1. **Multi-tenant system**: Each organization has its own set of tasks, users, and categories.
2. **Recurring and non-recurring tasks**: Supports both one-time and repeating tasks.
3. **Fixed and variable recurrence**: Tasks can recur on a fixed schedule or a variable time after the last occurrence.
4. **Custom categorization**: Organizations can create their own categories and dropdown options.
5. **Task dependencies**: Non-recurring tasks can have dependencies on other tasks.
6. **Soft deletion**: Occurrences can be soft-deleted for exception handling.
7. **Flexible notifications**: Customizable email notifications for upcoming and overdue tasks.

## Implementation Notes

1. **Occurrence Generation**: Implement a scheduled job to generate occurrences for recurring tasks, typically 3-6 months in advance.
2. **Catch-up Functionality**: Create a method to soft-delete all but the latest occurrence of a task and update its due date.
3. **Data Isolation**: Ensure that all queries and operations are scoped to the organization level for data security.
4. **Recurrence Handling**: Implement logic to handle both fixed and variable recurrence patterns when generating new occurrences.
5. **Dependency Management**: For non-recurring tasks, implement a system to manage and enforce task dependencies.