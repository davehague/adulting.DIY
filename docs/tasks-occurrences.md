This system's primary goal is to handle home maintenance tasks. 


# Occurrences
Executable instantiations of a task.  

## States

Occurrences can be in one of these states:
- Upcoming - occurrence is not executed and due date is newer than or equal to today's date
- Overdue - occurrence is not executed and due date is older than today's date
- Completed - occurrence is executed
- Deleted - occurrence has been marked as deleted
	- Note when marking an occurrence as deleted a new one should be generated in the future, if the task is recurring

## Notes
- If the occurrence is upcoming, you can't edit it's due date to be in the past

# Tasks
Contains title, description, instructions, details about a home activity.  Can be recurring or non-recurring. 

## States

Tasks can be in these (derived) states:

- Active - there are upcoming occurrences
- Overdue - the latest occurrence is overdue
- Completed - the task is non-recurring and all occurrences are completed
- Deleted - the task has been marked as deleted by the user

## Notes	
- When creating a new task for the first time, the next future occurrence should be created based on a due date specified by the user.  This applies to both recurring and non-recurring tasks.
- If a task is recurring there should always be one task upcoming, there can be many in the past


